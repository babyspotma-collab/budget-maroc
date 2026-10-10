import { describe, expect, it } from 'vitest'
import { centsToInput, formatMAD, parseMAD } from '../money'

describe('centsToInput', () => {
  it('produit un texte éditable', () => {
    expect(centsToInput(1200)).toBe('12')
    expect(centsToInput(1250)).toBe('12,5')
    expect(centsToInput(1205)).toBe('12,05')
    expect(centsToInput(7)).toBe('0,07')
  })
  it('fait l\'aller-retour avec parseMAD', () => {
    for (const c of [1, 7, 50, 1200, 1250, 1205, 99999]) {
      expect(parseMAD(centsToInput(c))).toBe(c)
    }
  })
})

describe('parseMAD (clavier arabe)', () => {
  it('accepte les chiffres arabes-indiens et le séparateur arabe', () => {
    expect(parseMAD('١٢٫٥')).toBe(1250)
    expect(parseMAD('١٥٠')).toBe(15000)
    expect(parseMAD('٣،٥٠')).toBe(350)
  })
})

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
