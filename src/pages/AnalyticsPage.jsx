import { useEffect, useMemo, useState } from 'react'
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Badge, Panel, SectionTitle } from '../components/dashboard/DashboardComponents'
import { Icon } from '../components/Icon'
import { getAnalytics } from '../services/analyticsService'

const periods = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' },
]

function currency(value) {
  return `Rs ${Number(value).toLocaleString('en-IN')}`
}

function compact(value) {
  return Number(value).toLocaleString('en-IN')
}

export function AnalyticsPage({ sellerSession, theme, onToggleTheme }) {
  const [period, setPeriod] = useState('month')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadAnalytics() {
      setLoading(true)
      const nextAnalytics = await getAnalytics(period)
      if (active) {
        setAnalytics(nextAnalytics)
        setLoading(false)
      }
    }

    loadAnalytics()

    return () => {
      active = false
    }
  }, [period])

  const maxRevenue = useMemo(
    () => Math.max(...(analytics?.revenueTrend || []).map((item) => item.revenue), 1),
    [analytics],
  )

  return (
    <div className="ui-enter min-h-svh bg-[#f3f6f4] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Analytics" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <Panel className="overflow-hidden p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Analytics cockpit</p>
              <h1 className="mt-1 text-[23px] font-black leading-tight">Sales, revenue, buyers, and losses</h1>
              <p className="mt-1 max-w-[640px] text-[12px] font-semibold leading-relaxed text-[#647267]">
                Firebase can feed these cards from orders, payments, inventory adjustments, buyer profiles, and cancellation events.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-[15px] border border-[#dde5da] bg-[#edf1ed] p-1">
              {periods.map((item) => (
                <button
                  className={`tap-lift min-h-10 rounded-[12px] px-2 text-[11px] font-black ${period === item.id ? 'bg-[#173f2a] text-white shadow-[0_10px_22px_rgba(23,63,42,0.2)]' : 'text-[#647267] active:bg-white active:text-[#173f2a]'}`}
                  key={item.id}
                  type="button"
                  onClick={() => setPeriod(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {loading || !analytics ? (
          <div className="grid min-h-[320px] place-items-center rounded-[18px] border border-[#dde5da] bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#173f2a]" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2 lg:grid-cols-6">
              <MetricCard label="Total revenue" value={currency(analytics.kpis.revenue)} tone="green" icon="wallet" delta="Paid done" />
              <MetricCard label="Sales" value={compact(analytics.kpis.sales)} tone="blue" icon="orders" delta="Orders" />
              <MetricCard label="Profit" value={currency(analytics.kpis.profit)} tone="green" icon="chart" delta="Estimate" />
              <MetricCard label="Loss" value={currency(analytics.kpis.loss)} tone="red" icon="receipt" delta="Exposure" negative />
              <MetricCard label="Repeat buyers" value={compact(analytics.kpis.repeatBuyers)} tone="amber" icon="customers" delta="Actual" />
              <MetricCard label="Avg order" value={currency(analytics.kpis.avgOrderValue)} tone="blue" icon="tag" delta="Paid done" />
            </section>

            <section className="grid gap-3 xl:grid-cols-[.72fr_1.28fr]">
              <Panel className="p-4">
                <SectionTitle title="Business health" action={<Badge tone="green">{analytics.health.score}/100</Badge>} />
                <div className="grid gap-4 sm:grid-cols-[132px_1fr] sm:items-center">
                  <div className="relative mx-auto grid h-[132px] w-[132px] place-items-center rounded-full" style={{ background: `conic-gradient(#173f2a ${analytics.health.score * 3.6}deg, #edf1ed 0deg)` }}>
                    <div className="grid h-[96px] w-[96px] place-items-center rounded-full bg-white text-center">
                      <strong className="text-[27px] font-black leading-none">{analytics.health.score}</strong>
                      <span className="text-[9px] font-black uppercase tracking-[0.05em] text-[#647267]">Healthy</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <HealthRow label="Revenue quality" value={analytics.health.revenueQuality} />
                    <HealthRow label="Buyer retention" value={analytics.health.buyerRetention} />
                    <HealthRow label="Stock control" value={analytics.health.stockControl} />
                    <HealthRow label="Loss control" value={analytics.health.lossControl} warning />
                  </div>
                </div>
              </Panel>

              <Panel className="p-4">
                <SectionTitle title="AI analysis" />
                <div className="grid gap-3 md:grid-cols-3">
                  {analytics.insights.map((item) => (
                    <InsightCard key={item.title} insight={item} />
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-3 xl:grid-cols-[1.35fr_.65fr]">
              <Panel className="p-4">
                <SectionTitle
                  title={`${analytics.label} sale and revenue`}
                  action={<Badge tone="green">Live-ready</Badge>}
                />
                <div className="grid min-h-[260px] grid-cols-[38px_1fr] gap-3">
                  <div className="grid content-between py-2 text-right text-[9px] font-black text-[#7b887f]">
                    <span>{currency(maxRevenue)}</span>
                    <span>{currency(maxRevenue / 2)}</span>
                    <span>Rs 0</span>
                  </div>
                  <div className="relative overflow-visible rounded-[16px] border border-[#dde5da] bg-[#fbfcf8] p-3">
                    <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-[#dce5dd]"></div>
                    <div className="absolute inset-x-3 top-3 border-t border-dashed border-[#e8eee9]"></div>
                    <div className="absolute inset-x-3 bottom-10 border-t border-dashed border-[#e8eee9]"></div>
                    <div className="relative grid h-[210px] items-end gap-2" style={{ gridTemplateColumns: `repeat(${analytics.revenueTrend.length}, minmax(0, 1fr))` }}>
                      {analytics.revenueTrend.map((item) => (
                        <div className="grid h-full content-end gap-2" key={item.label}>
                          <div className="group relative grid h-[176px] items-end">
                            <div
                              className="rounded-t-[10px] bg-[#173f2a] shadow-[0_10px_18px_rgba(23,63,42,0.14)]"
                              style={{ height: `${Math.max(12, (item.revenue / maxRevenue) * 100)}%` }}
                            ></div>
                            <div
                              className="absolute bottom-0 right-0 w-[36%] rounded-t-[8px] bg-[#e0aa4a]"
                              style={{ height: `${Math.max(10, (item.sales / Math.max(...analytics.revenueTrend.map((point) => point.sales), 1)) * 72)}%` }}
                            ></div>
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-[12px] border border-[#dde5da] bg-white px-3 py-2 text-center text-[10px] font-black shadow-[0_12px_26px_rgba(17,24,20,0.16)] group-hover:block">
                              <span className="block whitespace-nowrap">{currency(item.revenue)}</span>
                              <span className="block whitespace-nowrap text-[#647267]">{item.sales} sales</span>
                            </div>
                          </div>
                          <span className="text-center text-[10px] font-black text-[#647267]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-black uppercase text-[#647267]">
                      <Legend color="#173f2a" label="Revenue" />
                      <Legend color="#e0aa4a" label="Sales" />
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel className="p-4">
                <SectionTitle title="Buyer buy time" />
                <div className="grid gap-3">
                  {analytics.buyerTimes.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px] font-black">
                        <span>{item.label}</span>
                        <span className="text-[#647267]">{item.window} · {item.value}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#edf1ed]">
                        <div className="h-full rounded-full bg-[#173f2a]" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[16px] border border-[#e9b653] bg-[#fff6e9] p-3 text-[12px] font-bold text-[#6a4a10]">
                  Peak demand is evening. Keep ready-stock and staff capacity highest from 3-8 PM.
                </div>
              </Panel>
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
              <Panel className="p-4">
                <SectionTitle title="Revenue by category" />
                <DonutChart items={analytics.categoryMix} />
              </Panel>

              <Panel className="p-4">
                <SectionTitle title="Repeat buyers" />
                <div className="grid gap-3">
                  {analytics.repeatBuyerCohorts.map((item) => (
                    <div className="rounded-[15px] border border-[#dde5da] bg-[#f8faf7] p-3" key={item.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <strong className="text-[13px] font-black">{item.label}</strong>
                        <span className="text-[12px] font-black text-[#173f2a]">{item.value}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#e8eee9]">
                        <div className="h-full rounded-full bg-[#08783c]" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-4">
                <SectionTitle title="Loss analysis" />
                <div className="divide-y divide-[#eef2ee]">
                  {analytics.lossReasons.map((item) => (
                    <div className="flex items-center justify-between gap-3 py-2.5" key={item.label}>
                      <span className="text-[12px] font-bold text-[#647267]">{item.label}</span>
                      <strong className="text-[13px] font-black text-[#b63a25]">{currency(item.amount)}</strong>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
              {analytics.forecast.map((item) => (
                <Panel className="p-4" key={item.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">{item.label}</p>
                      <strong className="mt-2 block text-[22px] font-black">{item.value > 1000 ? currency(item.value) : compact(item.value)}</strong>
                    </div>
                    <Badge tone={item.confidence >= 84 ? 'green' : 'amber'}>{item.confidence}% confidence</Badge>
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-[#edf1ed]">
                    <div className="h-full rounded-full bg-[#173f2a]" style={{ width: `${item.confidence}%` }}></div>
                  </div>
                </Panel>
              ))}
            </section>

            <Panel className="p-4">
              <SectionTitle title="Top selling items" />
              <div className="overflow-hidden rounded-[16px] border border-[#dde5da]">
                <div className="grid grid-cols-[1.3fr_.6fr_.8fr_.6fr] gap-2 border-b border-[#e6ebe6] bg-[#f8faf7] px-3 py-2 text-[10px] font-black uppercase text-[#647267]">
                  <span>Item</span>
                  <span>Sales</span>
                  <span>Revenue</span>
                  <span>Margin</span>
                </div>
                {analytics.topProducts.map((item) => (
                  <div className="grid grid-cols-[1.3fr_.6fr_.8fr_.6fr] items-center gap-2 border-b border-[#eef2ee] px-3 py-3 text-[12px] last:border-b-0" key={item.name}>
                    <strong className="truncate font-black">{item.name}</strong>
                    <span className="font-bold text-[#647267]">{item.sales}</span>
                    <strong>{currency(item.revenue)}</strong>
                    <Badge tone={item.margin >= 25 ? 'green' : 'amber'}>{item.margin}%</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </main>
    </div>
  )
}

function MetricCard({ label, value, tone, icon, delta, negative = false }) {
  const styles = {
    green: 'border-[#9ed7b3] bg-[#f0fff5]',
    blue: 'border-[#a7d6b5] bg-[#edf5ed]',
    amber: 'border-[#f3d38d] bg-[#fff8e6]',
    red: 'border-[#f1b0a6] bg-[#fff0ee]',
  }
  const isTrend = delta?.startsWith('+') || delta?.startsWith('-')

  return (
    <div className={`rounded-[18px] border p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)] ${styles[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-white text-[#173f2a]">
          <Icon name={icon} className="h-[17px] w-[17px]" />
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-black ${negative ? 'text-[#b63a25]' : 'text-[#08783c]'}`}>
          {isTrend && (negative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />)}
          {delta}
        </span>
      </div>
      <strong className="mt-3 block truncate text-[20px] font-black leading-none text-[#101814]">{value}</strong>
      <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.05em] text-[#647267]">{label}</span>
    </div>
  )
}

function HealthRow({ label, value, warning = false }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-black">
        <span>{label}</span>
        <span className={warning ? 'text-[#9a6500]' : 'text-[#173f2a]'}>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#edf1ed]">
        <div className={`h-full rounded-full ${warning ? 'bg-[#e0aa4a]' : 'bg-[#173f2a]'}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
  const styles = {
    green: 'border-[#9ed7b3] bg-[#f0fff5]',
    amber: 'border-[#f3d38d] bg-[#fff8e6]',
    blue: 'border-[#a7d6b5] bg-[#edf5ed]',
  }

  return (
    <article className={`rounded-[16px] border p-3 ${styles[insight.tone]}`}>
      <strong className="block text-[13px] font-black leading-snug">{insight.title}</strong>
      <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[#647267]">{insight.detail}</p>
    </article>
  )
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}></span>
      {label}
    </span>
  )
}

function DonutChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.revenue, 0)
  const displayTotal = items[0]?.label === 'No sales yet' ? 0 : total
  let running = 0

  const gradient = items.map((item) => {
    const start = (running / total) * 100
    running += item.revenue
    const end = (running / total) * 100
    return `${item.color} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
      <div className="relative mx-auto h-[150px] w-[150px] rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-[26px] grid place-items-center rounded-full bg-white text-center">
          <strong className="text-[18px] font-black">{currency(displayTotal)}</strong>
          <span className="text-[9px] font-black uppercase text-[#647267]">Total mix</span>
        </div>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <div className="flex items-center justify-between gap-2 rounded-[13px] bg-[#f8faf7] px-3 py-2" key={item.label}>
            <Legend color={item.color} label={item.label} />
            <strong className="text-[12px] font-black">{displayTotal ? Math.round((item.revenue / total) * 100) : 0}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
