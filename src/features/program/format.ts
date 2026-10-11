import type { Params } from '../../domain/plan'

/**
 * Prépare les paramètres d'une règle ou d'une action pour i18next :
 * `xxxCents` devient `xxx` formaté en MAD, les autres nombres sont formatés avec le
 * système de chiffres choisi.
 */
export function formatParams(
  params: Params,
  money: (cents: number) => string,
  num: (n: number) => string,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (key.endsWith('Cents')) out[key.slice(0, -5)] = money(value)
    else out[key] = num(value)
  }
  return out
}
