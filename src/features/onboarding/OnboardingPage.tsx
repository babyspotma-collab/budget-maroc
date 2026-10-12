import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { Button, Field } from '../../components/ui'
import { CategoryIcon, type IconName } from '../../components/ui/CategoryIcon'
import { CheckIcon, ChevronLeftIcon, PencilIcon } from '../../components/ui/icons'
import { parseMAD } from '../../domain/money'
import type { Goal, IncomeKind, Problem, Situation } from '../../domain/plan'
import { saveProgram, skipOnboarding } from '../program/actions'
import { useProfile } from '../program/hooks'
import { AmountScreen } from './AmountScreen'
import {
  draftToProfile,
  EMPTY_DRAFT,
  OPTIONAL_STEPS,
  profileToDraft,
  skipStep,
  stepError,
  visibleSteps,
  type AmountKey,
  type Draft,
  type StepId,
} from './draft'
import { MakingScreen } from './MakingScreen'

const SITUATIONS: { value: Situation; icon: IconName }[] = [
  { value: 'employee', icon: 'sit_employee' },
  { value: 'self_employed', icon: 'sit_self_employed' },
  { value: 'merchant', icon: 'sit_merchant' },
  { value: 'student', icon: 'sit_student' },
  { value: 'unemployed', icon: 'sit_unemployed' },
]

const GOALS: { value: Goal; icon: IconName }[] = [
  { value: 'finish_month', icon: 'goal_finish_month' },
  { value: 'save', icon: 'goal_save' },
  { value: 'repay_debt', icon: 'goal_repay_debt' },
  { value: 'project', icon: 'goal_project' },
  { value: 'understand', icon: 'goal_understand' },
]

const PROBLEMS: { value: Problem; icon: IconName }[] = [
  { value: 'impulsive', icon: 'problem_impulsive' },
  { value: 'month_end', icon: 'problem_month_end' },
  { value: 'no_savings', icon: 'problem_no_savings' },
  { value: 'no_tracking', icon: 'problem_no_tracking' },
]

/** Écrans où toucher une carte fait passer à la suite automatiquement. */
const AUTO_STEPS: readonly StepId[] = [
  'goal',
  'situation',
  'incomeKind',
  'payDay',
  'hasDebts',
  'dependents',
  'problem',
]

const ADVANCE_DELAY_MS = 240

function ChoiceCard({
  selected,
  onClick,
  icon,
  title,
  hint,
}: {
  selected: boolean
  onClick: () => void
  icon: IconName
  title: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 bg-surface p-3.5 text-start transition-[border-color,background-color,transform] duration-200 active:scale-[0.98] ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-transparent shadow-(--shadow-card)'
      }`}
    >
      <CategoryIcon name={icon} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-white transition-colors duration-200 ${
          selected ? 'border-brand-500 bg-brand-500' : 'border-line-strong'
        }`}
      >
        {selected ? <CheckIcon width={14} /> : null}
      </span>
    </button>
  )
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const { money, num } = usePrefs()
  const navigate = useNavigate()
  const stored = useProfile()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [step, setStep] = useState<StepId>('name')
  const [history, setHistory] = useState<StepId[]>([])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [editing, setEditing] = useState(false)
  const [making, setMaking] = useState(false)
  const [showError, setShowError] = useState(false)
  const prefilled = useRef(false)

  // « Refaire le questionnaire » : on repart des réponses précédentes.
  useEffect(() => {
    if (stored && !prefilled.current) {
      prefilled.current = true
      setDraft(profileToDraft(stored.profile))
    }
  }, [stored])

  useEffect(() => {
    titleRef.current?.focus()
    setShowError(false)
  }, [step, making])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const steps = visibleSteps(draft)
  const questionCount = steps.length - 1 // le récapitulatif n'est pas une question
  const position = Math.max(0, steps.indexOf(step))
  const error = stepError(step, draft)
  const profile = useMemo(() => draftToProfile(draft), [draft])

  function go(target: StepId) {
    window.clearTimeout(timer.current)
    setDirection('forward')
    setHistory((h) => [...h, step])
    setStep(target)
  }

  function advance(d: Draft) {
    if (editing) {
      setEditing(false)
      go('recap')
      return
    }
    const list = visibleSteps(d)
    const i = list.indexOf(step)
    go(list[Math.min(i + 1, list.length - 1)])
  }

  function back() {
    window.clearTimeout(timer.current)
    const previous = history[history.length - 1]
    if (previous === undefined) {
      leave()
      return
    }
    setHistory((h) => h.slice(0, -1))
    setDirection('back')
    setEditing(false)
    setStep(previous)
  }

  function leave() {
    skipOnboarding()
    navigate('/', { replace: true })
  }

  /** Choix par carte : on enregistre puis on passe à la suite après un court instant. */
  function choose(patch: Partial<Draft>) {
    const next = { ...draft, ...patch }
    setDraft(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => advance(next), ADVANCE_DELAY_MS)
  }

  function onContinue() {
    if (step === 'recap') {
      if (profile) {
        setMaking(true)
      } else {
        const missing = visibleSteps(draft).find((s) => stepError(s, draft) !== null)
        if (missing) {
          setEditing(true)
          go(missing)
        }
      }
      return
    }
    if (error) {
      setShowError(true)
      return
    }
    advance(draft)
  }

  function onSkip() {
    const next = skipStep(step, draft)
    setDraft(next)
    advance(next)
  }

  function editFromRecap(target: StepId) {
    setEditing(true)
    go(target)
  }

  function setAmount(key: AmountKey, value: string) {
    setDraft((d) => ({ ...d, [key]: value }))
    setShowError(false)
  }

  if (making && profile) {
    return (
      <MakingScreen
        name={profile.firstName}
        work={() => saveProgram(profile)}
        onDone={() => navigate('/programme', { replace: true })}
      />
    )
  }

  const errorText =
    showError && error
      ? error === 'choice'
        ? t('onboarding.errors.choice')
        : t(`onboarding.errors.${error}`)
      : undefined

  const amounts: Record<AmountKey, string> = {
    income: draft.income,
    rent: draft.rent,
    credit: draft.credit,
    school: draft.school,
    bills: draft.bills,
    transport: draft.transport,
    debtMonthly: draft.debtMonthly,
    debtTotal: draft.debtTotal,
    daret: draft.daret,
  }

  const chargesTotal =
    [draft.rent, draft.credit, draft.school, draft.bills, draft.transport]
      .map((v) => (v.trim() === '' ? 0 : parseMAD(v)))
      .filter((n) => Number.isFinite(n))
      .reduce((s, n) => s + n, 0)

  let body: ReactNode
  switch (step) {
    case 'name':
      body = (
        <Field
          label={t('onboarding.q.name.title')}
          placeholder={t('onboarding.q.name.placeholder')}
          autoComplete="given-name"
          maxLength={30}
          value={draft.firstName}
          error={errorText}
          onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && onContinue()}
        />
      )
      break
    case 'goal':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.goal.title')} className="space-y-3">
          {GOALS.map((o) => (
            <ChoiceCard
              key={o.value}
              icon={o.icon}
              title={t(`onboarding.q.goal.${o.value}`)}
              selected={draft.goal === o.value}
              onClick={() => choose({ goal: o.value })}
            />
          ))}
        </div>
      )
      break
    case 'situation':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.situation.title')} className="space-y-3">
          {SITUATIONS.map((o) => (
            <ChoiceCard
              key={o.value}
              icon={o.icon}
              title={t(`onboarding.q.situation.${o.value}`)}
              selected={draft.situation === o.value}
              onClick={() => choose({ situation: o.value })}
            />
          ))}
        </div>
      )
      break
    case 'income':
      body = (
        <AmountScreen
          fields={[{ key: 'income', label: t('onboarding.q.income.label') }]}
          values={amounts}
          onChange={setAmount}
          error={errorText}
        />
      )
      break
    case 'incomeKind':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.incomeKind.title')} className="space-y-3">
          {(['regular', 'variable'] as IncomeKind[]).map((k) => (
            <ChoiceCard
              key={k}
              icon={k === 'regular' ? 'income_regular' : 'income_variable'}
              title={t(`onboarding.q.incomeKind.${k}`)}
              hint={t(`onboarding.q.incomeKind.${k}Hint`)}
              selected={draft.incomeKind === k}
              onClick={() => choose({ incomeKind: k })}
            />
          ))}
        </div>
      )
      break
    case 'payDay':
      body = (
        <div
          role="radiogroup"
          aria-label={t('onboarding.q.payDay.title')}
          className="grid grid-cols-7 gap-2"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={draft.payDay === day}
              onClick={() => choose({ payDay: day })}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm font-bold tabular-nums transition-[background-color,transform] duration-200 active:scale-95 ${
                draft.payDay === day
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface shadow-(--shadow-card)'
              }`}
            >
              {num(day)}
            </button>
          ))}
        </div>
      )
      break
    case 'charges':
      body = (
        <AmountScreen
          fields={[
            { key: 'rent', label: t('onboarding.q.charges.rent') },
            { key: 'credit', label: t('onboarding.q.charges.credit') },
            { key: 'school', label: t('onboarding.q.charges.school') },
            { key: 'bills', label: t('onboarding.q.charges.bills') },
            { key: 'transport', label: t('onboarding.q.charges.transport') },
          ]}
          values={amounts}
          onChange={setAmount}
          error={errorText}
        />
      )
      break
    case 'hasDebts':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.hasDebts.title')} className="space-y-3">
          <ChoiceCard
            icon="answer_yes"
            title={t('onboarding.q.hasDebts.yes')}
            selected={draft.hasDebts === true}
            onClick={() => choose({ hasDebts: true })}
          />
          <ChoiceCard
            icon="answer_no"
            title={t('onboarding.q.hasDebts.no')}
            selected={draft.hasDebts === false}
            onClick={() =>
              choose({ hasDebts: false, debtMonthly: '', debtTotal: '', daret: '' })
            }
          />
        </div>
      )
      break
    case 'debts':
      body = (
        <AmountScreen
          fields={[
            { key: 'debtMonthly', label: t('onboarding.q.debts.debtMonthly') },
            { key: 'debtTotal', label: t('onboarding.q.debts.debtTotal') },
            { key: 'daret', label: t('onboarding.q.debts.daret') },
          ]}
          values={amounts}
          onChange={setAmount}
          error={errorText}
        />
      )
      break
    case 'dependents':
      body = (
        <div
          role="radiogroup"
          aria-label={t('onboarding.q.dependents.title')}
          className="grid grid-cols-3 gap-3"
        >
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={draft.dependents === n}
              onClick={() => choose({ dependents: n })}
              className={`flex min-h-20 flex-col items-center justify-center rounded-2xl text-2xl font-extrabold transition-[background-color,transform] duration-200 active:scale-95 ${
                draft.dependents === n
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface shadow-(--shadow-card)'
              }`}
            >
              {n === 5 ? `${num(5)}+` : num(n)}
              <span className="text-[11px] font-medium opacity-80">
                {n === 0
                  ? t('onboarding.q.dependents.none')
                  : n === 5
                    ? t('onboarding.q.dependents.more')
                    : ''}
              </span>
            </button>
          ))}
        </div>
      )
      break
    case 'problem':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.problem.title')} className="space-y-3">
          {PROBLEMS.map((o) => (
            <ChoiceCard
              key={o.value}
              icon={o.icon}
              title={t(`onboarding.q.problem.${o.value}`)}
              selected={draft.problem === o.value}
              onClick={() => choose({ problem: o.value })}
            />
          ))}
        </div>
      )
      break
    case 'recap': {
      const none = t('onboarding.recap.none')
      const debtParts = [
        draft.debtMonthly && parseMAD(draft.debtMonthly) > 0
          ? t('onboarding.recap.debt', { amount: money(parseMAD(draft.debtMonthly)) })
          : null,
        draft.daret && parseMAD(draft.daret) > 0
          ? t('onboarding.recap.daret', { amount: money(parseMAD(draft.daret)) })
          : null,
      ].filter(Boolean)
      const rows: { step: StepId; label: string; value: string }[] = [
        { step: 'name', label: t('onboarding.recap.name'), value: draft.firstName.trim() || '—' },
        {
          step: 'goal',
          label: t('onboarding.recap.goal'),
          value: draft.goal ? t(`onboarding.q.goal.${draft.goal}`) : '—',
        },
        {
          step: 'situation',
          label: t('onboarding.recap.situation'),
          value: draft.situation ? t(`onboarding.q.situation.${draft.situation}`) : '—',
        },
        {
          step: 'income',
          label: t('onboarding.recap.income'),
          value: Number.isFinite(parseMAD(draft.income))
            ? t('onboarding.recap.perMonth', { amount: money(parseMAD(draft.income)) })
            : '—',
        },
        {
          step: 'incomeKind',
          label: t('onboarding.recap.incomeKind'),
          value: draft.incomeKind ? t(`onboarding.q.incomeKind.${draft.incomeKind}Short`) : '—',
        },
        {
          step: 'payDay',
          label: t('onboarding.recap.payDay'),
          value: draft.payDay ? t('onboarding.recap.dayOfMonth', { day: num(draft.payDay) }) : '—',
        },
        {
          step: 'charges',
          label: t('onboarding.recap.charges'),
          value:
            chargesTotal > 0
              ? t('onboarding.recap.perMonth', { amount: money(chargesTotal) })
              : none,
        },
        {
          step: 'hasDebts',
          label: t('onboarding.recap.debts'),
          value:
            draft.hasDebts === true
              ? debtParts.length > 0
                ? debtParts.join(' · ')
                : t('onboarding.recap.yes')
              : none,
        },
        {
          step: 'dependents',
          label: t('onboarding.recap.dependents'),
          value: draft.dependents === null ? '—' : num(draft.dependents),
        },
        {
          step: 'problem',
          label: t('onboarding.recap.problem'),
          value: draft.problem ? t(`onboarding.q.problem.${draft.problem}`) : '—',
        },
      ]
      body = (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.step + r.label}>
              <button
                type="button"
                onClick={() => editFromRecap(r.step)}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-surface px-4 py-2 text-start shadow-(--shadow-card) transition-transform duration-150 active:scale-[0.98]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-muted">{r.label}</span>
                  <span className="block truncate font-bold">{r.value}</span>
                </span>
                <PencilIcon width={20} className="text-muted" />
              </button>
            </li>
          ))}
        </ul>
      )
      break
    }
  }

  const optional = OPTIONAL_STEPS.includes(step)
  const auto = AUTO_STEPS.includes(step)
  const answered = error === null
  const showContinue = step === 'recap' || !auto || answered
  const showSkip = optional && step !== 'recap' && (!auto || !answered)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-6 pt-4">
      <header className="mb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            aria-label={t('onboarding.back')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 hover:bg-surface"
          >
            <ChevronLeftIcon />
          </button>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={position + 1}
            aria-label={t('onboarding.progressLabel')}
            className="h-2 flex-1 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out"
              style={{ width: `${((position + 1) / steps.length) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={leave}
            className="shrink-0 px-1 text-sm font-semibold text-muted"
          >
            {t('onboarding.later')}
          </button>
        </div>
        {step !== 'recap' && (
          <p className="mt-3 text-xs font-medium text-muted">
            {t('onboarding.progress', { n: num(position + 1), total: num(questionCount) })}
          </p>
        )}
      </header>

      <main key={step} className={`step-enter flex-1 ${direction === 'back' ? 'step-back' : ''}`}>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="text-2xl font-extrabold leading-snug outline-none"
        >
          {t(`onboarding.q.${step}.title`)}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t(`onboarding.q.${step}.why`)}</p>
        <div className="mt-6">{body}</div>
        {errorText && !['name', 'income', 'charges', 'debts'].includes(step) && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
            {errorText}
          </p>
        )}
      </main>

      <footer className="sticky bottom-0 -mx-5 mt-6 flex gap-2 bg-canvas/95 px-5 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur">
        {showSkip && (
          <Button variant="ghost" size="lg" onClick={onSkip}>
            {t('onboarding.skip')}
          </Button>
        )}
        {showContinue && (
          <Button size="lg" className="flex-1" onClick={onContinue}>
            {step === 'recap' ? t('onboarding.finish') : t('onboarding.next')}
          </Button>
        )}
      </footer>
    </div>
  )
}
