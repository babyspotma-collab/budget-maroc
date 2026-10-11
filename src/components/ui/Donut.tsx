import type { ReactNode } from 'react'

interface DonutProps {
  /** Part remplie, de 0 à 1 (au-delà de 1, l'anneau reste plein). */
  ratio: number
  /** Couleur de l'arc. */
  color: string
  label: string
  children?: ReactNode
  size?: number
}

/** Anneau de progression ; le contenu (children) est centré dans le trou. */
export function Donut({ ratio, color, label, children, size = 208 }: DonutProps) {
  const stroke = 22
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, ratio))

  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* rtl-flip : l'arc se remplit dans le sens de lecture */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="rtl-flip -rotate-90"
        aria-hidden
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ece7d8" strokeWidth={stroke} />
        {clamped > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * clamped} ${c}`}
            style={{ transition: 'stroke-dasharray 400ms ease' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        {children}
      </div>
    </div>
  )
}
