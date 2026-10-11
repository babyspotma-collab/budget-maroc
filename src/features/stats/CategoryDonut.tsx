import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { usePrefs } from '../../app/prefs'
import type { Category } from '../../db/types'
import type { Slice } from '../../domain/stats'

const OTHERS_COLOR = '#8a948d'
const SURFACE = '#ffffff'

interface CategoryDonutProps {
  slices: Slice[]
  totalCents: number
  categories: Map<number, Category>
  labelOf: (c: Category | undefined) => string
}

interface Datum {
  key: string
  name: string
  value: number
  percent: number
  fill: string
  fillOpacity: number
}

function SliceTooltip({
  active,
  payload,
  money,
  pct,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload: Datum }>
  money: (c: number) => string
  pct: (n: number) => string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-sm shadow-lg ring-1 ring-line">
      <p className="flex items-center gap-2 font-semibold">
        <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
        {d.name}
      </p>
      <p className="tabular-nums text-muted">
        {money(d.value)} · {pct(d.percent)}
      </p>
    </div>
  )
}

/**
 * Anneau de répartition (≤ 6 parts + « Autres »). La légende est aussi le tableau :
 * chaque ligne est cliquable et met la part en évidence (sans dépendre du survol).
 */
export function CategoryDonut({ slices, totalCents, categories, labelOf }: CategoryDonutProps) {
  const { t } = useTranslation()
  const { money, num, dir } = usePrefs()
  const [selected, setSelected] = useState<string | null>(null)

  const data = useMemo<Datum[]>(
    () =>
      slices.map((s) => {
        const key = s.categoryId === null ? 'others' : String(s.categoryId)
        const cat = s.categoryId === null ? undefined : categories.get(s.categoryId)
        return {
          key,
          name: s.categoryId === null ? t('stats.others') : labelOf(cat),
          value: s.totalCents,
          percent: s.percent,
          fill: s.categoryId === null ? OTHERS_COLOR : (cat?.color ?? OTHERS_COLOR),
          fillOpacity: selected === null || selected === key ? 1 : 0.3,
        }
      }),
    [slices, categories, labelOf, selected, t],
  )

  const active = data.find((d) => d.key === selected)
  const pct = (n: number) => t('budgets.percent', { pct: num(n) })
  const summary = data.map((d) => `${d.name} ${pct(d.percent)}`).join(', ')

  return (
    <div>
      <div
        role="img"
        aria-label={`${t('stats.byCategory')} : ${summary}`}
        className="relative mx-auto h-56 w-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              startAngle={90}
              endAngle={dir === 'rtl' ? 450 : -270}
              stroke={SURFACE}
              strokeWidth={2}
              isAnimationActive={false}
              onClick={(_, i) => setSelected((cur) => (cur === data[i].key ? null : data[i].key))}
            />
            <Tooltip
              content={(p) => (
                <SliceTooltip
                  active={p.active}
                  payload={p.payload as ReadonlyArray<{ payload: Datum }> | undefined}
                  money={money}
                  pct={pct}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <span className="line-clamp-1 text-xs font-medium text-muted">
            {active ? active.name : t('stats.total')}
          </span>
          <span className="mt-0.5 text-xl font-extrabold">
            {money(active ? active.value : totalCents)}
          </span>
          {active && <span className="text-xs text-muted">{pct(active.percent)}</span>}
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {data.map((d) => (
          <li key={d.key}>
            <button
              type="button"
              aria-pressed={selected === d.key}
              onClick={() => setSelected((cur) => (cur === d.key ? null : d.key))}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-start transition-colors hover:bg-line/40 ${
                selected === d.key ? 'bg-line/50' : ''
              }`}
            >
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.name}</span>
              <span className="text-sm tabular-nums text-muted">{pct(d.percent)}</span>
              <span className="w-24 text-end text-sm font-semibold tabular-nums">
                {money(d.value)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
