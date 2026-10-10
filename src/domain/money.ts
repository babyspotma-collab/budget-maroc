export type Lang = 'fr' | 'ar'
export type Numerals = 'latn' | 'arab'

/** Montant saisi en MAD (ex. "12,5" ou "12.50") → centimes. NaN si invalide. */
export function parseMAD(input: string): number {
  const normalized = input.replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN
  return Math.round(Number(normalized) * 100)
}

export function centsToMAD(cents: number): number {
  return cents / 100
}

export interface MoneyFormatOptions {
  lang: Lang
  numerals: Numerals
}

export function formatMAD(cents: number, { lang, numerals }: MoneyFormatOptions): string {
  // fr-MA sépare les milliers par un point ; fr-FR donne le format attendu (1 234,50).
  const base = lang === 'ar' ? 'ar-MA' : 'fr-FR'
  const locale = `${base}-u-nu-${numerals}`
  const whole = cents % 100 === 0
  const text = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MAD',
    currencyDisplay: lang === 'ar' ? 'symbol' : 'code',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(centsToMAD(cents))
  // L'espace fine insécable (U+202F) manque dans certaines polices : on la remplace par une NBSP.
  return text.replace(/ /g, ' ')
}
