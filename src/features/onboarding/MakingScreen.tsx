import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DURATION_MS = 5000
const MESSAGES = ['m1', 'm2', 'm3', 'm4', 'm5'] as const

interface MakingScreenProps {
  name: string
  /** Travail réel (génération + sauvegarde), mené pendant l'animation. */
  work: () => Promise<unknown>
  onDone: () => void
}

/** Écran de « fabrication » : 5 secondes, une phrase par seconde, barre de progression. */
export function MakingScreen({ name, work, onDone }: MakingScreenProps) {
  const { t } = useTranslation()
  const [elapsed, setElapsed] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const t0 = performance.now()
    const id = setInterval(() => setElapsed(Math.min(DURATION_MS, performance.now() - t0)), 80)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (started.current) return
    started.current = true
    const wait = new Promise((r) => setTimeout(r, DURATION_MS))
    void Promise.all([work(), wait]).then(onDone)
    // `work` et `onDone` sont stables pour la durée de l'écran.
  }, []) // eslint-disable-line

  const index = Math.min(MESSAGES.length - 1, Math.floor(elapsed / (DURATION_MS / MESSAGES.length)))
  const pct = Math.round((elapsed / DURATION_MS) * 100)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-10 flex size-36 items-center justify-center">
        <svg viewBox="0 0 64 64" className="making-spin absolute inset-0 size-full" aria-hidden>
          <circle cx="32" cy="32" r="28" fill="none" stroke="#cbe6da" strokeWidth="6" />
          <path
            d="M32 4a28 28 0 0 1 26.6 19.3"
            fill="none"
            stroke="#0c7d5e"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-4xl font-extrabold tabular-nums">{pct}%</span>
      </div>

      <h1 className="text-xl font-extrabold">{t('onboarding.making.title')}</h1>

      <p
        key={index}
        role="status"
        aria-live="polite"
        className="making-fade mt-4 min-h-14 text-base text-muted"
      >
        {t(`onboarding.making.${MESSAGES[index]}`, { name })}
      </p>

      <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${pct}%`, transition: 'width 80ms linear' }}
        />
      </div>
    </div>
  )
}
