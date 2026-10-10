import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  body: string
  children?: ReactNode
}

/** État vide soigné : étoile à 8 branches, titre, explication et actions. */
export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="mb-5 flex size-24 items-center justify-center rounded-full bg-terracotta-50">
        <svg viewBox="0 0 56 56" width="56" height="56" fill="none" aria-hidden>
          <g stroke="#c2512f" strokeWidth="2.2" strokeLinejoin="round">
            <rect x="12" y="12" width="32" height="32" />
            <rect x="12" y="12" width="32" height="32" transform="rotate(45 28 28)" />
          </g>
          <circle cx="28" cy="28" r="5" fill="#c2512f" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
      {children && <div className="mt-6 flex w-full max-w-xs flex-col gap-2">{children}</div>}
    </div>
  )
}
