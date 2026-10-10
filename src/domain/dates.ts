import { format } from 'date-fns'

/** Dates métier : jour 'YYYY-MM-DD', mois 'YYYY-MM' (calendrier local). */

export function todayISO(now: Date = new Date()): string {
  return format(now, 'yyyy-MM-dd')
}

export function currentMonth(now: Date = new Date()): string {
  return format(now, 'yyyy-MM')
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7)
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const index = y * 12 + (m - 1) + delta
  const ny = Math.floor(index / 12)
  const nm = (index % 12) + 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

/** Bornes incluses pour une requête sur les chaînes ISO. */
export function monthBounds(month: string): { start: string; end: string } {
  return { start: `${month}-01`, end: `${month}-31` }
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

export function relativeDay(iso: string, today: string): 'today' | 'yesterday' | null {
  const diff = dayNumber(today) - dayNumber(iso)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return null
}

function dateFromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDayLong(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(dateFromISO(iso))
}

export function formatDayShort(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    dateFromISO(iso),
  )
}

export function formatMonthLabel(month: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    dateFromISO(`${month}-01`),
  )
}
