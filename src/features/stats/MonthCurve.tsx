import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePrefs } from '../../app/prefs'
import type { CurvePoint } from '../../domain/stats'

const CURRENT = '#2f7df6'
const PREVIOUS = '#8b90a8'
const GRID = '#e6e8f0'
const AXIS = '#d3d7e4'
const SURFACE = '#ffffff'

interface MonthCurveProps {
  rows: CurvePoint[]
  daysInMonth: number
  currentLabel: string
  previousLabel: string
  hasPrevious: boolean
}

function CurveTooltip({
  active,
  payload,
  money,
  num,
  dayLabel,
  currentLabel,
  previousLabel,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload: CurvePoint }>
  money: (c: number) => string
  num: (n: number) => string
  dayLabel: (d: string) => string
  currentLabel: string
  previousLabel: string
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-sm shadow-lg ring-1 ring-line">
      <p className="mb-1 font-semibold">{dayLabel(num(p.day))}</p>
      {p.current !== null && (
        <p className="flex items-center gap-2 tabular-nums">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: CURRENT }} />
          {currentLabel} : <b>{money(p.current)}</b>
        </p>
      )}
      {p.previous !== null && (
        <p className="flex items-center gap-2 tabular-nums text-muted">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: PREVIOUS }} />
          {previousLabel} : {money(p.previous)}
        </p>
      )}
    </div>
  )
}

/** Courbe des dépenses cumulées du mois, comparée au mois précédent (gris, en retrait). */
export function MonthCurve({
  rows,
  daysInMonth,
  currentLabel,
  previousLabel,
  hasPrevious,
}: MonthCurveProps) {
  const { t } = useTranslation()
  const { money, num, locale, dir } = usePrefs()
  const rtl = dir === 'rtl'

  // Nombres entiers simples : le format compact arabe (« ٥ آلاف ») est trop large pour l'axe.
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  const ticks = [1, 5, 10, 15, 20, 25, daysInMonth].filter(
    (d, i, a) => d <= daysInMonth && a.indexOf(d) === i && (d <= 25 ? true : daysInMonth - 25 >= 3),
  )

  return (
    <div>
      <div
        role="img"
        aria-label={`${t('stats.curveTitle')} : ${currentLabel}`}
        className="h-60 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: rtl ? 0 : 16, bottom: 4, left: rtl ? 16 : 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="day"
              reversed={rtl}
              ticks={ticks}
              tickFormatter={(d: number) => num(d)}
              tickLine={false}
              axisLine={{ stroke: AXIS }}
              tick={{ fontSize: 11, fill: '#6b6f8a' }}
              interval={0}
            />
            <YAxis
              orientation={rtl ? 'right' : 'left'}
              width={52}
              tickCount={4}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b6f8a' }}
              tickFormatter={(cents: number) => plain.format(Math.round(cents / 100))}
              domain={[0, 'auto']}
            />
            <Tooltip
              cursor={{ stroke: AXIS }}
              content={(p) => (
                <CurveTooltip
                  active={p.active}
                  payload={p.payload as ReadonlyArray<{ payload: CurvePoint }> | undefined}
                  money={money}
                  num={num}
                  dayLabel={(d) => t('stats.day', { day: d })}
                  currentLabel={currentLabel}
                  previousLabel={previousLabel}
                />
              )}
            />
            {hasPrevious && (
              <Line
                dataKey="previous"
                stroke={PREVIOUS}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
            <Line
              dataKey="current"
              stroke={CURRENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Légende : toujours présente dès deux séries */}
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 rounded-full" style={{ backgroundColor: CURRENT }} />
          {currentLabel}
        </li>
        {hasPrevious && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-0.5 w-5 rounded-full"
              style={{ backgroundColor: PREVIOUS }}
            />
            {previousLabel}
          </li>
        )}
      </ul>

      {/* Vue tableau : équivalent accessible de la courbe */}
      <details className="mt-3 rounded-xl bg-canvas px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-accent-600">
          {t('stats.showTable')}
        </summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-start tabular-nums">
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="py-1 text-start font-medium">
                  {t('stats.dayCol')}
                </th>
                <th scope="col" className="py-1 text-end font-medium">
                  {currentLabel}
                </th>
                {hasPrevious && (
                  <th scope="col" className="py-1 text-end font-medium">
                    {previousLabel}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => r.current !== null)
                .map((r) => (
                  <tr key={r.day} className="border-t border-line">
                    <th scope="row" className="py-1 text-start font-medium">
                      {num(r.day)}
                    </th>
                    <td className="py-1 text-end">{money(r.current ?? 0)}</td>
                    {hasPrevious && (
                      <td className="py-1 text-end text-muted">
                        {r.previous === null ? '—' : money(r.previous)}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
