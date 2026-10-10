interface ProgressBarProps {
  /** Ratio consommé (0 à 1+). */
  ratio: number
  label: string
}

/** Menthe sous 80 %, safran à partir de 80 %, rouge à 100 %. */
export function ProgressBar({ ratio, label }: ProgressBarProps) {
  const pct = Math.round(ratio * 100)
  const color =
    ratio >= 1 ? 'bg-danger-600' : ratio >= 0.8 ? 'bg-saffron-500' : 'bg-mint-600'

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(pct, 100)}
      className="h-2.5 overflow-hidden rounded-full bg-line"
    >
      <div
        className={`h-full rounded-full transition-[width] ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}
