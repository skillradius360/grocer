import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { AppHeader } from '../components/AppHeader'
import {
  IconButton,
  Panel,
  SectionTitle,
  StatCard,
  StatusCard,
  StockCard,
} from '../components/dashboard/DashboardComponents'
import { getShopServiceState } from '../utils/shopState'

const statusTone = {
  Open: 'green',
  Closed: 'red',
  'All Day': 'green',
  Breakfast: 'amber',
  Lunch: 'blue',
  Active: 'green',
  Paused: 'amber',
}

const insightRows = [
  ['Orders ready for pickup', '2'],
  ['Top selling item (7d)', 'Paneer Wrap'],
  ['Repeat customers (est.)', '18'],
  ['Average order value', 'Rs 214'],
  ['Peak ordering time', '7-9 PM'],
]

export function SellerDashboardPage({ sellerSession, setSellerSession, activePage = 'Dashboard', theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const [qrVisible, setQrVisible] = useState(false)

  const shop = sellerSession.shop
  const dashboard = sellerSession.dashboard
  const serviceState = getShopServiceState(sellerSession)

  const updateSession = (updater) => {
    setSellerSession((current) => {
      const next = updater(current)
      return next
    })
  }

  const updateShop = (patch) => {
    updateSession((current) => ({
      ...current,
      shop: {
        ...current.shop,
        ...patch,
      },
    }))
  }

  const updateDashboard = (patch) => {
    updateSession((current) => ({
      ...current,
      dashboard: {
        ...current.dashboard,
        ...patch,
      },
    }))
  }

  const setActionNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 1800)
  }

  const shareUrl = `${window.location.origin}/products`

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setActionNotice('Share link copied.')
    } catch {
      setActionNotice('Share link ready: /products')
    }
  }

  return (
    <div className="ui-enter min-h-svh bg-[#fbfcf8] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader
        activePage={activePage}
        sellerSession={sellerSession}
        theme={theme}
        onToggleTheme={onToggleTheme}
        notificationsEnabled={dashboard.notificationsEnabled}
        onToggleNotifications={() => updateDashboard({ notificationsEnabled: !dashboard.notificationsEnabled })}
      />

      <div className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        {activePage !== 'Dashboard' && (
          <Panel className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Section</p>
              <h1 className="text-[18px] font-black leading-tight">{activePage}</h1>
            </div>
            <IconButton icon="back" label="Dashboard" onClick={() => navigate('/dashboard')} />
          </Panel>
        )}

        {notice && (
          <div className="ui-enter rounded-[14px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">
            {notice}
          </div>
        )}

        {serviceState.status === 'recharge' && (
          <div className="flex items-center gap-3 rounded-[16px] border border-[#efafa3] bg-[#fff2ef] p-3 text-[12px] font-semibold text-[#7f2a1b] shadow-[0_14px_28px_rgba(182,58,37,0.12)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white text-[#b63a25]">
              <Icon name="wallet" className="h-5 w-5" />
            </span>
            <p className="min-w-0 flex-1">
              <strong className="text-[#111814]">Recharge first</strong> to enable services. Your wallet is below the 1-week payout requirement.
            </p>
            <button
              className="tap-lift shrink-0 rounded-[13px] bg-[#b63a25] px-3 py-2 text-[11px] font-black text-white active:bg-[#8f2d1d]"
              type="button"
              onClick={() => navigate('/billing')}
            >
              Recharge
            </button>
          </div>
        )}

        {serviceState.status === 'trial' && (
          <div className="flex items-center gap-3 rounded-[16px] border border-[#f0c56e] bg-[#fff6e9] p-3 text-[12px] font-semibold text-[#7a540c]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white text-[#9a6500]">
              <Icon name="spark" className="h-5 w-5" />
            </span>
            <p className="min-w-0 flex-1">
              <strong className="text-[#111814]">Trial active.</strong> {serviceState.reason}. Recharge before trial ends to keep services live.
            </p>
          </div>
        )}

        {dashboard.inventoryWarningVisible && (
          <div className="flex items-center gap-3 rounded-[15px] border border-[#e9b653] bg-[#fff6e9] p-3 text-[12px] font-semibold text-[#6a4a10]">
            <p className="min-w-0 flex-1">
              <strong className="text-[#111814]">1 low stock</strong> and <strong className="text-[#111814]">2 out of stock</strong> items need attention.
            </p>
            <button
              className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-[#efbc87] bg-white text-[#9a6500] active:bg-[#fff0d3]"
              type="button"
              aria-label="Dismiss inventory warning"
              onClick={() => updateDashboard({ inventoryWarningVisible: false })}
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid grid-cols-3 gap-2">
          <StatusCard
            title="Shop Status"
            value={shop.shopStatus}
            tone={statusTone[shop.shopStatus]}
            icon="store"
            onClick={() => updateShop({ shopStatus: shop.shopStatus === 'Open' ? 'Closed' : 'Open', isLive: shop.shopStatus !== 'Open' })}
          />
          <StatusCard
            title="Refresh"
            value="Sync Now"
            tone="amber"
            icon="refresh"
            onClick={() => {
              updateDashboard({ lastRefreshedAt: new Date().toISOString() })
              setActionNotice('Dashboard refreshed.')
            }}
          />
          <StatusCard
            title="Delivery"
            value={shop.deliveryStatus}
            tone={statusTone[shop.deliveryStatus]}
            icon="truck"
            onClick={() => updateShop({ deliveryStatus: shop.deliveryStatus === 'Active' ? 'Paused' : 'Active' })}
          />
        </section>

        <Panel className="p-4">
          <SectionTitle title="Share Products" />
          <div className="grid grid-cols-3 gap-2">
            <IconButton icon="external" label="Open" variant="primary" onClick={() => navigate('/products')} />
            <IconButton icon="qr" label="QR" onClick={() => setQrVisible((current) => !current)} />
            <IconButton icon="copy" label="Copy" onClick={copyShareLink} />
          </div>
          {qrVisible && (
            <div className="mt-3 grid place-items-center rounded-[16px] border border-[#dde5da] bg-[#f8faf7] p-4">
              <div className="grid h-28 w-28 grid-cols-4 gap-1 rounded-[10px] bg-white p-2 shadow-inner">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span className={`rounded-[3px] ${index % 3 === 0 || index === 5 || index === 14 ? 'bg-[#173f2a]' : 'bg-[#dfe7df]'}`} key={index}></span>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <section className="grid grid-cols-4 gap-2">
          <StatCard value="Rs 0" label="Revenue Today" icon="wallet" />
          <StatCard value="1" label="Total Orders" icon="orders" />
          <StatCard value="0" label="In Prep" icon="chef" />
          <StatCard value="1" label="Completed" icon="check" />
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Panel className="p-4">
            <SectionTitle title="Promotions" />
            <div className="grid grid-cols-3 gap-2">
              <div><strong className="block text-lg font-black">0</strong><span className="text-[9px] font-black uppercase text-[#647267]">Active</span></div>
              <div><strong className="block text-lg font-black">0</strong><span className="text-[9px] font-black uppercase text-[#647267]">Claims</span></div>
              <div><strong className="block text-lg font-black">Rs 0</strong><span className="text-[9px] font-black uppercase text-[#647267]">Savings</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <IconButton icon="plus" label="Create offer" onClick={() => navigate('/offers')} />
              <IconButton icon="tag" label="Manage offers" variant="soft" onClick={() => navigate('/offers')} />
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle title="Stock Overview" />
            <div className="grid grid-cols-4 gap-2">
              <StockCard count="2" label="Out" tone="red" />
              <StockCard count="1" label="Low" tone="amber" />
              <StockCard count="0" label="Medium" tone="peach" />
              <StockCard count="10" label="Good" tone="green" />
            </div>
            <div className="mt-4">
              <IconButton icon="box" label="Manage products" variant="soft" onClick={() => navigate('/products')} />
            </div>
          </Panel>
        </section>

        <Panel className="p-4">
          <SectionTitle title="Business Insights" />
          <div className="divide-y divide-[#e6ebe6]">
            {insightRows.map(([label, value]) => (
              <div className="flex items-center justify-between gap-3 py-2 text-[12px]" key={label}>
                <span className="font-medium text-[#647267]">{label}</span>
                <strong className="text-right font-black text-[#111814]">{value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
