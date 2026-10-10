import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="relative -mx-4 -mt-6 mb-5 px-4 pb-4 pt-8">
      <div aria-hidden className="zellige pointer-events-none absolute inset-0" />
      <div className="relative flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}
