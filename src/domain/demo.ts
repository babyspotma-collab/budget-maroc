import type { Expense } from '../db/types'
import { currentMonth } from './dates'

export const DEMO_EXPENSE_COUNT = 30
export const DEMO_INCOME_CENTS = 950_000 // 9 500 MAD

/** Plafonds mensuels de démo (MAD), par clé de catégorie prédéfinie. */
export const DEMO_BUDGETS_MAD: Record<string, number> = {
  rent: 2800,
  groceries: 2000,
  transport: 700,
  outings: 600,
  health: 500,
  utilities: 300,
}

type Spec =[note: string, minMAD: number, maxMAD: number]

const RANDOM_SPECS: { key: string; count: number; items: Spec[] }[] = [
  {
    key: 'groceries',
    count: 10,
    items: [
      ['Marjane', 150, 520],
      ['Carrefour', 120, 450],
      ['Marché', 40, 160],
      ['Hanout', 10, 60],
      ['Boulangerie', 8, 30],
      ['Boucherie', 90, 220],
    ],
  },
  {
    key: 'transport',
    count: 7,
    items: [
      ['Tram', 6, 30],
      ['Petit taxi', 15, 60],
      ['Essence', 200, 300],
      ['Train ONCF', 35, 120],
    ],
  },
  {
    key: 'outings',
    count: 5,
    items: [
      ['Café', 20, 60],
      ['Restaurant', 90, 280],
      ['Cinéma', 60, 120],
      ['Pizza', 60, 130],
    ],
  },
  { key: 'health', count: 2, items: [['Pharmacie', 45, 220], ['Médecin', 200, 300]] },
  { key: 'clothing', count: 1, items: [['Vêtements', 250, 600]] },
  { key: 'family', count: 1, items: [['Cadeau', 150, 400]] },
  { key: 'other', count: 1, items: [['Divers', 30, 150]] },
]

/** PRNG déterministe : mêmes dates → mêmes données de démo. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface DemoData {
  expenses: Omit<Expense, 'id' | 'demo'>[]
  incomeCents: number
}

/**
 * 30 dépenses réalistes en MAD, réparties du 1er du mois jusqu'à aujourd'hui.
 * `categoryIdByKey` associe les clés de catégories prédéfinies à leurs ids ;
 * une clé absente est ignorée.
 */
export function generateDemo(now: Date, categoryIdByKey: Record<string, number>): DemoData {
  const month = currentMonth(now)
  const lastDay = now.getDate()
  const rnd = mulberry32(Number(month.replace('-', '')))
  const between = (min: number, max: number, step = 5) =>
    Math.max(step, Math.round((min + rnd() * (max - min)) / step) * step)
  const dayISO = (d: number) => `${month}-${String(d).padStart(2, '0')}`
  const randomDay = () => 1 + Math.floor(rnd() * lastDay)

  const rows: { key: string; date: string; mad: number; note: string }[] = [
    { key: 'rent', date: dayISO(1), mad: 2200, note: 'Loyer' },
    { key: 'phone', date: dayISO(1), mad: 99, note: 'Forfait mobile' },
    {
      key: 'utilities',
      date: dayISO(Math.min(3, lastDay)),
      mad: between(120, 260),
      note: 'Eau et électricité',
    },
  ]

  for (const spec of RANDOM_SPECS) {
    for (let i = 0; i < spec.count; i++) {
      const [note, min, max] = spec.items[Math.floor(rnd() * spec.items.length)]
      rows.push({ key: spec.key, date: dayISO(randomDay()), mad: between(min, max), note })
    }
  }

  const base = now.getTime()
  const expenses = rows
    .filter((r) => categoryIdByKey[r.key] !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r, i) => ({
      amountCents: r.mad * 100,
      categoryId: categoryIdByKey[r.key],
      date: r.date,
      note: r.note,
      createdAt: base + i,
    }))

  return { expenses, incomeCents: DEMO_INCOME_CENTS }
}
