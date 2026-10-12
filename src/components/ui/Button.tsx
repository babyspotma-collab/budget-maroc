import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-50/70 active:bg-brand-50/50',
  ghost: 'text-ink hover:bg-ink/5 active:bg-ink/10',
  danger: 'bg-danger-50 text-danger-600 hover:bg-danger-50/70',
}

/** Zones tactiles d'au moins 48 px ; rayon de 14 px. */
const SIZES: Record<Size, string> = {
  md: 'min-h-12 px-4 text-sm',
  lg: 'min-h-14 px-6 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  )
}