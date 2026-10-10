import { describe, expect, it } from 'vitest'
import {
  addMonths,
  currentMonth,
  isValidISODate,
  monthBounds,
  monthOf,
  relativeDay,
  todayISO,
} from '../dates'

describe('dates', () => {
  it('formate le jour et le mois locaux', () => {
    const d = new Date(2026, 9, 5, 23, 30) // 5 octobre 2026, tard le soir
    expect(todayISO(d)).toBe('2026-10-05')
    expect(currentMonth(d)).toBe('2026-10')
    expect(monthOf('2026-10-05')).toBe('2026-10')
  })

  it('navigue entre les mois, y compris à cheval sur les années', () => {
    expect(addMonths('2026-10', 1)).toBe('2026-11')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-03', -15)).toBe('2024-12')
  })

  it('donne des bornes de mois utilisables en comparaison de chaînes', () => {
    const { start, end } = monthBounds('2026-02')
    expect('2026-02-01' >= start && '2026-02-28' <= end).toBe(true)
    expect('2026-03-01' <= end).toBe(false)
    expect('2026-01-31' >= start).toBe(false)
  })

  it('valide les dates ISO', () => {
    expect(isValidISODate('2026-02-28')).toBe(true)
    expect(isValidISODate('2024-02-29')).toBe(true)
    expect(isValidISODate('2026-02-29')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('')).toBe(false)
    expect(isValidISODate('05/10/2026')).toBe(false)
  })

  it('reconnaît aujourd\'hui et hier, même à cheval sur un mois', () => {
    expect(relativeDay('2026-10-10', '2026-10-10')).toBe('today')
    expect(relativeDay('2026-10-09', '2026-10-10')).toBe('yesterday')
    expect(relativeDay('2026-09-30', '2026-10-01')).toBe('yesterday')
    expect(relativeDay('2026-10-08', '2026-10-10')).toBeNull()
    expect(relativeDay('2026-10-11', '2026-10-10')).toBeNull()
  })
})
