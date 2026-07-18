import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BadgeIndianRupee, Banknote, CheckCircle2, Clock3, Copy, Filter, IndianRupee, Loader2, ReceiptText, Search, ShieldCheck, Smartphone, WalletCards, X, Zap } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Badge, Panel, SectionTitle } from '../components/dashboard/DashboardComponents'
import { getSellerOrders } from '../services/orderService'

const DUMMY_COMMISSION_RATE = 0.035
const DUMMY_SERVICE_FEE_RATE = 0.01
const DUMMY_WALLET_BALANCE = 0
const DUMMY_UPI_ID = 'simplifyliving@upi'
const DAY_OPTIONS = [15, 30, 60, 90, 180, 365]
const AMOUNT_OPTIONS = [49, 99, 149, 249, 499, 999]
const BILL_PERIODS = ['all', 'year', 'quarter', 'month', 'date']

function money(value) {
  return `Rs ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function orderTotal(order) {
  if (typeof order.totalAmount === 'number') return order.totalAmount
  return order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

function billForOrder(order, commissionRate) {
  const amount = orderTotal(order)
  const fee = amount * commissionRate

  return {
    id: order.id,
    code: order.shortCode || order.code,
    buyer: order.buyerName,
    date: order.updatedAt || order.createdAt,
    amount,
    fee,
    net: Math.max(0, amount - fee),
    rate: commissionRate,
    paymentMethod: order.paymentMethod,
  }
}

export function BillingPage({ sellerSession, theme, onToggleTheme }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [rechargeDays, setRechargeDays] = useState(30)
  const [selectedAmount, setSelectedAmount] = useState(99)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [billingModalOpen, setBillingModalOpen] = useState(false)
  const [billingSearch, setBillingSearch] = useState('')
  const [billingPeriod, setBillingPeriod] = useState('all')
  const [billingDate, setBillingDate] = useState('')
  const [billingPage, setBillingPage] = useState(1)
  const commissionRate = DUMMY_COMMISSION_RATE
  const walletBalance = DUMMY_WALLET_BALANCE
  const serviceFeeRate = DUMMY_SERVICE_FEE_RATE

  useEffect(() => {
    let active = true

    getSellerOrders().then((nextOrders) => {
      if (active) {
        setOrders(nextOrders)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const bills = useMemo(
    () => orders
      .filter((order) => order.status === 'Completed' && order.paymentStatus === 'Paid')
      .map((order) => billForOrder(order, commissionRate)),
    [orders, commissionRate],
  )

  const totals = useMemo(() => bills.reduce((sum, bill) => ({
    revenue: sum.revenue + bill.amount,
    fees: sum.fees + bill.fee,
    net: sum.net + bill.net,
  }), { revenue: 0, fees: 0, net: 0 }), [bills])

  const payableAmount = selectedAmount || 0
  const previewBills = bills.slice(0, 4)
  const mobilePreviewBills = bills.slice(0, 2)

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(DUMMY_UPI_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f3f6f4] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Billing" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <Panel className="overflow-hidden p-2.5 sm:p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Billing</p>
              <h1 className="mt-0.5 text-[17px] font-black leading-tight sm:text-[20px]">Billing</h1>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[#173f2a]">
              <WalletCards className="h-5 w-5" />
            </span>
          </div>
        </Panel>

        {loading ? (
          <div className="grid min-h-[280px] place-items-center rounded-[18px] border border-[#dde5da] bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#173f2a]" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <BillingStat icon={BadgeIndianRupee} label="Order revenue" value={money(totals.revenue)} tone="green" />
              <BillingStat icon={ReceiptText} label="Platform cut" value={money(totals.fees)} tone="amber" />
              <BillingStat icon={Banknote} label="Seller net" value={money(totals.net)} tone="blue" />
              <BillingStat icon={ShieldCheck} label="Rate" value={`${(commissionRate * 100).toFixed(1)}%`} tone="green" />
            </section>

            <Panel className="p-3">
              <SectionTitle
                title="Order billing"
                action={<button className="tap-lift rounded-full border border-[#dde5da] bg-white px-3 py-1.5 text-[10px] font-black text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={() => setBillingModalOpen(true)}>Show all</button>}
              />
              {bills.length === 0 ? (
                <EmptyBilling />
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {mobilePreviewBills.map((bill) => <BillingOrderCard bill={bill} key={bill.id} className="sm:hidden" />)}
                  {previewBills.map((bill) => <BillingOrderCard bill={bill} key={bill.id} className="hidden sm:block" />)}
                </div>
              )}
            </Panel>

            <section className="grid gap-3">
              <Panel className="p-4">
                <SectionTitle title="Platform fee structure" action={<Badge tone="green">Live</Badge>} />
                <div className="mt-3 grid gap-2">
                  <WalletMetric icon={WalletCards} label="Wallet balance" value={money(walletBalance)} copy="available" tone="green" />
                  <WalletMetric icon={Zap} label="Service fee" value={`${(serviceFeeRate * 100).toFixed(0)}%`} copy="of confirmed order value" tone="amber" />
                </div>
                <div className="mt-3 rounded-[18px] border border-[#dde5da] bg-[#f8faf7] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">Sync billing</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <strong className="text-[13px] font-black">Balance {money(walletBalance)}</strong>
                    <Badge tone={walletBalance > 0 ? 'green' : 'amber'}>{walletBalance > 0 ? 'Funded' : 'Recharge'}</Badge>
                  </div>
                </div>
              </Panel>

              <Panel className="p-4">
                <SectionTitle title="Recharge wallet" action={<Badge tone="amber">Charge</Badge>} />
                <div className="mt-3 grid gap-3">
                  <div className="rounded-[18px] border border-[#dde5da] bg-[#f8faf7] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">Avg usage / day</p>
                        <strong className="mt-1 block text-[22px] font-black">{money(0)}</strong>
                      </div>
                      <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-white text-[#173f2a]">
                        <IndianRupee className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Recharge for days</p>
                      <strong className="text-[12px] font-black text-[#173f2a]">{rechargeDays} days</strong>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {DAY_OPTIONS.map((days) => (
                        <button className={`tap-lift min-h-10 rounded-[13px] border text-[12px] font-black ${rechargeDays === days ? 'border-[#173f2a] bg-[#173f2a] text-white' : 'border-[#dde5da] bg-white text-[#334039] active:bg-[#edf5ed]'}`} key={days} type="button" onClick={() => setRechargeDays(days)}>
                          {days}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">
                    <span className="h-px flex-1 bg-[#dde5da]"></span>
                    OR
                    <span className="h-px flex-1 bg-[#dde5da]"></span>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Select amount</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {AMOUNT_OPTIONS.map((amount) => (
                        <button className={`tap-lift min-h-11 rounded-[13px] border text-[12px] font-black ${selectedAmount === amount ? 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a] shadow-[0_8px_18px_rgba(23,63,42,0.12)]' : 'border-[#dde5da] bg-white text-[#334039] active:bg-[#edf5ed]'}`} key={amount} type="button" onClick={() => setSelectedAmount(amount)}>
                          Rs {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[#9ed7b3] bg-[#f0fff5] p-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#08783c]">Payable amount</span>
                    <div className="mt-1 flex items-end justify-between gap-3">
                      <strong className="text-[26px] font-black leading-none">{payableAmount ? money(payableAmount) : '-'}</strong>
                      <span className="text-[11px] font-black text-[#08783c]">Wallet recharge</span>
                    </div>
                  </div>

                  <label className="tap-lift flex items-center gap-3 rounded-[15px] border border-[#dde5da] bg-white p-3 active:bg-[#f8faf7]">
                    <input className="h-4 w-4 accent-[#173f2a]" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                    <span className="text-[12px] font-bold text-[#334039]">Accept Terms & Conditions</span>
                  </label>

                  <div className="grid gap-2">
                    <button className={`tap-lift min-h-12 rounded-[15px] text-[12px] font-black ${paymentDone ? 'bg-[#08783c] text-white' : 'border border-[#9ed7b3] bg-[#f0fff5] text-[#08783c]'}`} type="button" onClick={() => setPaymentDone(true)}>
                      {paymentDone ? 'Transfer marked' : 'Payment transfer done'}
                    </button>
                    <button className={`tap-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] text-[12px] font-black text-white ${termsAccepted && payableAmount ? 'bg-[#173f2a] active:bg-[#08783c]' : 'bg-[#b7c1ba]'}`} type="button" disabled={!termsAccepted || !payableAmount}>
                      <Smartphone className="h-4 w-4" />
                      Pay via UPI
                    </button>
                    <button className="tap-lift inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[#dde5da] bg-white text-[12px] font-black active:bg-[#edf5ed]" type="button" onClick={copyUpiId}>
                      <Copy className="h-4 w-4" />
                      {copied ? 'UPI copied' : 'Copy UPI ID'}
                    </button>
                  </div>
                </div>
              </Panel>
            </section>
            {billingModalOpen && (
              <BillingModal
                bills={bills}
                date={billingDate}
                page={billingPage}
                period={billingPeriod}
                search={billingSearch}
                setDate={setBillingDate}
                setPage={setBillingPage}
                setPeriod={setBillingPeriod}
                setSearch={setBillingSearch}
                onClose={() => setBillingModalOpen(false)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function BillingStat({ icon: Icon, label, value, tone }) {
  const styles = {
    green: 'border-[#9ed7b3] bg-[#f0fff5]',
    amber: 'border-[#f3d38d] bg-[#fff8e6]',
    blue: 'border-[#a7d6b5] bg-[#edf5ed]',
  }

  return (
    <div className={`rounded-[18px] border p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)] ${styles[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-white text-[#173f2a]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <Clock3 className="h-4 w-4 text-[#647267]" />
      </div>
      <strong className="mt-3 block truncate text-[20px] font-black leading-none">{value}</strong>
      <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.05em] text-[#647267]">{label}</span>
    </div>
  )
}

function EmptyBilling() {
  return (
    <div className="mt-3 grid min-h-[180px] place-items-center rounded-[18px] border border-dashed border-[#cbd7cf] bg-[#fbfcf8] p-6 text-center">
      <ReceiptText className="mb-3 h-8 w-8 text-[#173f2a]" />
      <strong className="text-[15px] font-black">No billable orders yet</strong>
      <p className="mt-1 max-w-[320px] text-[12px] font-semibold text-[#647267]">Complete an order and mark payment paid to show it here.</p>
    </div>
  )
}

function BillingOrderCard({ bill, className = '' }) {
  return (
    <article className={`min-w-0 rounded-[14px] border border-[#dde5da] bg-white p-2 shadow-[0_8px_16px_rgba(23,63,42,0.05)] ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">Processed</Badge>
            <span className="truncate rounded-full border border-[#dde5da] bg-[#f8faf7] px-1.5 py-0.5 text-[8px] font-black text-[#536258]">{bill.code}</span>
          </div>
          <h2 className="mt-1 truncate text-[12px] font-black">{bill.buyer}</h2>
          <p className="mt-0.5 truncate text-[9px] font-semibold text-[#647267]">{bill.paymentMethod}</p>
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] bg-[#edf5ed] text-[#173f2a]">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 grid gap-1">
        <AmountPill label="Order" value={money(bill.amount)} />
        <AmountPill label={`Cut ${(bill.rate * 100).toFixed(1)}%`} value={money(bill.fee)} highlight="amber" />
        <AmountPill label="Net" value={money(bill.net)} highlight="green" />
      </div>
    </article>
  )
}

function billDateValue(bill) {
  const value = Date.parse(bill.date)
  return Number.isNaN(value) ? Date.now() : value
}

function matchesPeriod(bill, period, date) {
  if (period === 'all') return true
  const billDate = new Date(billDateValue(bill))
  const now = new Date()
  if (period === 'year') return billDate.getFullYear() === now.getFullYear()
  if (period === 'quarter') return billDate.getFullYear() === now.getFullYear() && Math.floor(billDate.getMonth() / 3) === Math.floor(now.getMonth() / 3)
  if (period === 'month') return billDate.getFullYear() === now.getFullYear() && billDate.getMonth() === now.getMonth()
  if (!date) return true
  return billDate.toISOString().slice(0, 10) === date
}

function BillingModal({ bills, date, page, period, search, setDate, setPage, setPeriod, setSearch, onClose }) {
  const pageSize = 5
  const filteredBills = bills.filter((bill) => {
    const text = `${bill.code} ${bill.buyer} ${bill.paymentMethod}`.toLowerCase()
    return text.includes(search.toLowerCase()) && matchesPeriod(bill, period, date)
  })
  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleBills = filteredBills.slice((safePage - 1) * pageSize, safePage * pageSize)

  const updateFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  return createPortal(
    <div className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-[#11181466] p-3 sm:p-6">
      <section className="grid max-h-[min(88svh,680px)] w-full max-w-[620px] grid-rows-[auto_auto_1fr_auto] overflow-hidden rounded-[22px] border border-[#dde5da] bg-[#fbfcf8] shadow-[0_24px_70px_rgba(17,24,20,0.26)] sm:rounded-[24px]">
        <header className="flex items-start justify-between gap-3 border-b border-[#dde5da] p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">Order billing</p>
            <h2 className="truncate text-[18px] font-black">All processed bills</h2>
          </div>
          <button className="tap-lift grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[#dde5da] bg-white active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose} aria-label="Close billing modal">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-2 border-b border-[#dde5da] p-3">
          <label className="flex min-w-0 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-[#647267]" />
            <input className="h-10 min-w-0 flex-1 bg-transparent text-[12px] font-bold outline-none" placeholder="Search buyer or order" value={search} onChange={(event) => updateFilter(setSearch)(event.target.value)} />
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className="flex min-w-0 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-white px-3">
              <Filter className="h-4 w-4 shrink-0 text-[#647267]" />
              <select className="h-10 min-w-0 flex-1 bg-transparent text-[12px] font-black capitalize outline-none" value={period} onChange={(event) => updateFilter(setPeriod)(event.target.value)}>
                {BILL_PERIODS.map((item) => <option key={item} value={item}>{item === 'all' ? 'All' : item}</option>)}
              </select>
            </label>
            <input className="h-10 w-[132px] rounded-[14px] border border-[#dde5da] bg-white px-2 text-[12px] font-bold outline-none" type="date" value={date} onChange={(event) => updateFilter(setDate)(event.target.value)} />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overflow-x-hidden p-3">
          {visibleBills.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleBills.map((bill) => <BillingOrderCard bill={bill} key={bill.id} />)}
            </div>
          ) : (
            <div className="grid min-h-[180px] place-items-center rounded-[18px] border border-dashed border-[#cbd7cf] bg-white p-5 text-center text-[12px] font-bold text-[#647267]">No bills match these filters.</div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-[#dde5da] p-3">
          <button className="tap-lift rounded-[13px] border border-[#dde5da] bg-white px-4 py-2 text-[12px] font-black disabled:opacity-45" type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Prev</button>
          <span className="text-[11px] font-black text-[#647267]">{safePage} / {totalPages}</span>
          <button className="tap-lift rounded-[13px] border border-[#dde5da] bg-white px-4 py-2 text-[12px] font-black disabled:opacity-45" type="button" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

function WalletMetric({ icon: Icon, label, value, copy, tone }) {
  const styles = {
    green: 'border-[#9ed7b3] bg-[#f0fff5] text-[#08783c]',
    amber: 'border-[#f3d38d] bg-[#fff8e6] text-[#9a6500]',
  }

  return (
    <div className={`rounded-[18px] border p-3 ${styles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">{label}</span>
          <strong className="mt-2 block text-[24px] font-black leading-none text-[#111814]">{value}</strong>
          <p className="mt-1 text-[11px] font-bold">{copy}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white text-[#173f2a]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

function AmountPill({ label, value, highlight }) {
  const color = highlight === 'green' ? 'text-[#08783c]' : highlight === 'amber' ? 'text-[#9a6500]' : 'text-[#111814]'

  return (
    <div className="min-w-0 rounded-[10px] border border-[#edf1ed] bg-[#f8faf7] px-1.5 py-1.5">
      <span className="block text-[8px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
      <strong className={`mt-0.5 block truncate text-[10px] font-black ${color}`}>{value}</strong>
    </div>
  )
}
