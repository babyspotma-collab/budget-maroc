import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  /** Texte collé à la fin du champ (ex. « MAD »). */
  suffix?: ReactNode
  /** Grand champ pour les montants. */
  amount?: boolean
}

export function Field({
  label,
  hint,
  error,
  suffix,
  amount,
  className = '',
  id,
  ...rest
}: FieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl border bg-surface px-4 transition-colors focus-within:border-majorelle-600 focus-within:ring-2 focus-within:ring-majorelle-600/25 ${
          error ? 'border-danger-600' : 'border-sand-strong'
        }`}
      >
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full min-w-0 bg-transparent py-3 outline-none placeholder:text-muted/60 ${
            amount ? 'font-display text-3xl font-semibold tabular-nums' : 'text-base'
          }`}
          {...rest}
        />
        {suffix && (
          <span className="ms-2 shrink-0 text-sm font-semibold text-muted">{suffix}</span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
