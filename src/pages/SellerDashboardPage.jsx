import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { AppHeader } from '../components/AppHeader'
import {
  Badge,
  IconButton,
  NavTile,
  Panel,
  PipelineCard,
  SectionTitle,
  StatCard,
  StatusCard,
  StockCard,
} from '../components/dashboard/DashboardComponents'

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
  const shopName = shop.shopName || 'Fresh Basket Mart'

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

  const shareUrl = `${window.location.origin}/menu`

  const quickActions = [
    {
      icon: 'download',
      label: 'Install App',
      onClick: () => {
        updateDashboard({ installBannerVisible: false })
        setActionNotice('Install prompt saved locally.')
      },
    },
    {
      icon: dashboard.notificationsEnabled ? 'bell' : 'bellOff',
      label: dashboard.notificationsEnabled ? 'Alerts On' : 'Alerts Off',
      onClick: () => {
        updateDashboard({ notificationsEnabled: !dashboard.notificationsEnabled })
        setActionNotice(dashboard.notificationsEnabled ? 'Notifications paused.' : 'Notifications enabled.')
      },
    },
    {
      icon: 'help',
      label: 'Support',
      onClick: () => navigate('/settings'),
    },
  ]

  const quickLinks = [
    { icon: 'orders', label: 'Orders', path: '/orders' },
    { icon: 'box', label: 'Menu', path: '/menu' },
    { icon: 'customers', label: 'Customers', path: '/customers' },
    { icon: 'tag', label: 'Offers', path: '/offers' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ]

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setActionNotice('Share link copied.')
    } catch {
      setActionNotice('Share link ready: /menu')
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
          <Panel className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Section</p>
              <h1 className="text-[22px] font-black leading-tight">{activePage}</h1>
            </div>
            <IconButton icon="back" label="Dashboard" onClick={() => navigate('/dashboard')} />
          </Panel>
        )}

        {dashboard.installBannerVisible && (
          <Panel className="flex items-center gap-3 p-3">
            <span className="icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-[15px] bg-[#edf5ed] text-[#173f2a]">
              <Icon name="download" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-[14px] font-black">Install App</strong>
              <p className="text-[12px] font-medium leading-snug text-[#647267]">Install the seller app for faster order handling.</p>
            </div>
            <button
              className="tap-lift min-h-11 rounded-[14px] bg-[#173f2a] px-4 text-[12px] font-black text-white shadow-[0_10px_22px_rgba(23,63,42,0.24)] active:bg-[#08783c]"
              type="button"
              onClick={() => updateDashboard({ installBannerVisible: false })}
            >
              Install
            </button>
          </Panel>
        )}

        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Dashboard</p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="min-w-0 truncate text-[24px] font-black leading-none">{shopName}</h1>
            <Badge tone={shop.isLive ? 'green' : 'red'}>{shop.isLive ? 'Live' : 'Offline'}</Badge>
          </div>
          <p className="mt-1 text-[12px] font-medium text-[#647267]">
            {shop.isLive ? 'Customers can currently place orders from your shop.' : 'Your shop is hidden from customer ordering.'}
          </p>
        </section>

        {notice && (
          <div className="ui-enter rounded-[14px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">
            {notice}
          </div>
        )}

        <div className="rounded-[15px] border border-[#e9b653] bg-[#fff6e9] p-4 text-[12px] font-semibold text-[#6a4a10]">
          <strong className="text-[#111814]">1 low stock</strong> and <strong className="text-[#111814]">2 out of stock</strong> items need attention.
        </div>

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
          <SectionTitle title="Share Menu" />
          <div className="grid grid-cols-3 gap-2">
            <IconButton icon="external" label="Open" variant="primary" onClick={() => navigate('/menu')} />
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

        <Panel className="p-4">
          <SectionTitle
            title="Orders Pipeline"
            action={<button className="tap-lift rounded-[12px] border border-[#dde5da] bg-white px-3 py-2 text-[11px] font-black" type="button" onClick={() => navigate('/orders')}>View all</button>}
          />
          <p className="-mt-2 mb-3 text-[11px] font-medium text-[#647267]">0 active in workflow</p>
          <div className="grid grid-cols-3 gap-2">
            <PipelineCard count="0" title="New" copy="Needs confirm" tone="blue" />
            <PipelineCard count="0" title="Preparing" copy="In kitchen" tone="amber" />
            <PipelineCard count="0" title="Ready" copy="Pickup / delivery" tone="green" />
          </div>
        </Panel>

        <section>
          <SectionTitle title="Quick Actions" />
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((item) => (
              <NavTile key={item.label} icon={item.icon} label={item.label} onClick={item.onClick} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Quick Links" />
          <div className="grid grid-cols-5 gap-2">
            {quickLinks.map((item) => (
              <NavTile key={item.label} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
            ))}
          </div>
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
              <IconButton icon="box" label="Manage inventory" variant="soft" onClick={() => navigate('/menu')} />
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
