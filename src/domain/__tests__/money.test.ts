import { describe, expect, it } from 'vitest'
import { formatMAD, parseMAD } from '../money'

describe('parseMAD', () => {
  it('convertit en centimes', () => {
    expect(parseMAD('12,5')).toBe(1250)
    expect(parseMAD('12.50')).toBe(1250)
    expect(parseMAD('1 234')).toBe(123400)
    expect(parseMAD('0,07')).toBe(7)
  })
  it('rejette les saisies invalides', () => {
    expect(parseMAD('')).toBeNaN()
    expect(parseMAD('abc')).toBeNaN()
    expect(parseMAD('1,234')).toBeNaN()
  })
})

describe('formatMAD', () => {
  it('formate en français avec le code MAD', () => {
    const s = formatMAD(123450, { lang: 'fr', numerals: 'latn' })
    expect(s).toContain('MAD')
    expect(s).toMatch(/1\s234,50/u)
  })
  it('utilise des chiffres arabes-indiens si demandé', () => {
    const s = formatMAD(1000, { lang: 'ar', numerals: 'arab' })
    expect(s).toMatch(/[٠-٩]/)
  })
})
