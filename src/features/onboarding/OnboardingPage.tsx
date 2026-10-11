import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Field } from '../../components/ui'
import { ChevronLeftIcon } from '../../components/ui/icons'
import type { Goal, IncomeKind, Problem, Situation } from '../../domain/plan'
import { saveProgram, skipOnboarding } from '../program/actions'
import { useProfile } from '../program/hooks'
import {
  draftToProfile,
  EMPTY_DRAFT,
  profileToDraft,
  STEPS,
  stepError,
  type Draft,
  type StepId,
} from './draft'
import { MakingScreen } from './MakingScreen'

const SITUATIONS: { value: Situation; icon: string }[] = [
  { value: 'employee', icon: '💼' },
  { value: 'self_employed', icon: '🛠️' },
  { value: 'merchant', icon: '🏪' },
  { value: 'student', icon: '🎓' },
  { value: 'unemployed', icon: '🔎' },
]

const GOALS: { value: Goal; icon: string }[] = [
  { value: 'finish_month', icon: '🌙' },
  { value: 'save', icon: '🐖' },
  { value: 'repay_debt', icon: '🔗' },
  { value: 'project', icon: '🏡' },
  { value: 'understand', icon: '🔍' },
]

const PROBLEMS: { value: Problem; icon: string }[] = [
  { value: 'impulsive', icon: '🛍️' },
  { value: 'month_end', icon: '📉' },
  { value: 'no_savings', icon: '🫙' },
  { value: 'no_tracking', icon: '🙈' },
]

function ChoiceCard({
  selected,
  onClick,
  icon,
  title,
  hint,
}: {
  selected: boolean
  onClick: () => void
  icon: string
  title: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-start transition-colors ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-transparent shadow-(--shadow-card)'
      }`}
    >
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs text-white ${
          selected ? 'border-brand-500 bg-brand-500' : 'border-line-strong'
        }`}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  )
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const stored = useProfile()
  const titleRef = useRef<HTMLHeadingElement>(null)

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [step, setStep] = useState(0)
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

  const stepId: StepId = STEPS[step]
  const error = stepError(stepId, draft)
  const total = STEPS.length
  const isLast = step === total - 1
  const profile = useMemo(() => draftToProfile(draft), [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  function next() {
    if (error) {
      setShowError(true)
      return
    }
    if (isLast) {
      if (profile) setMaking(true)
      return
    }
    setStep((s) => s + 1)
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
    else leave()
  }

  function leave() {
    skipOnboarding()
    navigate('/', { replace: true })
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

  const money = (key: keyof Draft, label: string, hint?: string) => (
    <Field
      key={key}
      label={label}
      hint={hint}
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      suffix="MAD"
      value={draft[key] as string}
      onChange={(e) => set(key, e.target.value as never)}
    />
  )

  let body: ReactNode
  switch (stepId) {
    case 'name':
      body = (
        <Field
          label={t('onboarding.q.name.title')}
          placeholder={t('onboarding.q.name.placeholder')}
          autoComplete="given-name"
          maxLength={30}
          value={draft.firstName}
          error={errorText}
          onChange={(e) => set('firstName', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && next()}
        />
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
              onClick={() => set('situation', o.value)}
            />
          ))}
        </div>
      )
      break
    case 'income':
      body = (
        <Field
          label={t('onboarding.q.income.label')}
          amount
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          suffix="MAD"
          value={draft.income}
          error={errorText}
          onChange={(e) => set('income', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && next()}
        />
      )
      break
    case 'incomeKind':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.incomeKind.title')} className="space-y-3">
          {(['regular', 'variable'] as IncomeKind[]).map((k) => (
            <ChoiceCard
              key={k}
              icon={k === 'regular' ? '📅' : '🎢'}
              title={t(`onboarding.q.incomeKind.${k}`)}
              hint={t(`onboarding.q.incomeKind.${k}Hint`)}
              selected={draft.incomeKind === k}
              onClick={() => set('incomeKind', k)}
            />
          ))}
        </div>
      )
      break
    case 'payDay':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.payDay.title')} className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={draft.payDay === day}
              onClick={() => set('payDay', day)}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm font-bold tabular-nums ${
                draft.payDay === day
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface shadow-(--shadow-card)'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )
      break
    case 'charges':
      body = (
        <div className="space-y-4">
          {money('rent', t('onboarding.q.charges.rent'))}
          {money('credit', t('onboarding.q.charges.credit'))}
          {money('school', t('onboarding.q.charges.school'))}
          {money('bills', t('onboarding.q.charges.bills'))}
          {money('transport', t('onboarding.q.charges.transport'))}
        </div>
      )
      break
    case 'debts':
      body = (
        <div className="space-y-4">
          {money('debtMonthly', t('onboarding.q.debts.debtMonthly'))}
          {money('debtTotal', t('onboarding.q.debts.debtTotal'))}
          {money('daret', t('onboarding.q.debts.daret'))}
        </div>
      )
      break
    case 'dependents':
      body = (
        <div role="radiogroup" aria-label={t('onboarding.q.dependents.title')} className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={draft.dependents === n}
              onClick={() => set('dependents', n)}
              className={`flex min-h-20 flex-col items-center justify-center rounded-2xl text-2xl font-extrabold ${
                draft.dependents === n
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface shadow-(--shadow-card)'
              }`}
            >
              {n === 5 ? '5+' : n}
              <span className="text-[11px] font-medium opacity-80">
                {n === 0 ? t('onboarding.q.dependents.none') : n === 5 ? t('onboarding.q.dependents.more') : ''}
              </span>
            </button>
          ))}
        </div>
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
              onClick={() => set('goal', o.value)}
            />
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
              onClick={() => set('problem', o.value)}
            />
          ))}
        </div>
      )
      break
  }

  const hintKey = `onboarding.q.${stepId}.hint`
  const hasHint = ['name', 'income', 'payDay', 'charges', 'debts', 'dependents'].includes(stepId)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-6 pt-4">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            aria-label={t('onboarding.back')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface"
          >
            <ChevronLeftIcon className="rtl-flip" />
          </button>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step + 1}
            aria-label={t('onboarding.progress', { n: step + 1, total })}
            className="h-2 flex-1 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
              style={{ width: `${((step + 1) / total) * 100}%` }}
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
        <p className="mt-3 text-xs font-medium text-muted">
          {t('onboarding.progress', { n: step + 1, total })}
        </p>
      </header>

      <main className="flex-1">
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="text-2xl font-extrabold leading-snug outline-none"
        >
          {t(`onboarding.q.${stepId}.title`)}
        </h1>
        {hasHint && <p className="mt-2 text-sm text-muted">{t(hintKey)}</p>}
        <div className="mt-6">{body}</div>
        {errorText && stepId !== 'name' && stepId !== 'income' && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
            {errorText}
          </p>
        )}
      </main>

      <footer className="sticky bottom-0 -mx-5 mt-6 bg-canvas/95 px-5 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur">
        <Button size="lg" block onClick={next}>
          {isLast ? t('onboarding.finish') : t('onboarding.next')}
        </Button>
      </footer>
    </div>
  )
}
