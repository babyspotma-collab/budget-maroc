export type Lang = 'fr' | 'ar'
export type Numerals = 'latn' | 'arab'

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'

/**
 * Montant saisi en MAD (ex. "12,5", "12.50", "١٢٫٥") → centimes. NaN si invalide.
 * Accepte les chiffres arabes-indiens et les séparateurs décimaux arabes.
 */
export function parseMAD(input: string): number {
  const normalized = input
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)))
    .replace(/[\s  ]/g, '')
    .replace(/[,٫،]/, '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN
  return Math.round(Number(normalized) * 100)
}

/** Centimes → texte éditable ("1250" → "12,5"; "1200" → "12"). */
export function centsToInput(cents: number): string {
  const whole = Math.floor(cents / 100)
  const frac = cents % 100
  if (frac === 0) return String(whole)
  return `${whole},${String(frac).padStart(2, '0').replace(/0$/, '')}`
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
