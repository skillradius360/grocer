import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Badge } from './dashboard/DashboardComponents'
import { getShopServiceState } from '../utils/shopState'
import nomadLogo from '../assets/nomad-logo.svg'

const drawerLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', tone: 'green' },
  { label: 'Orders', path: '/orders', icon: 'orders', tone: 'amber' },
  { label: 'Products', path: '/products', icon: 'box', tone: 'cyan' },
  { label: 'Customers', path: '/customers', icon: 'customers', tone: 'violet' },
  { label: 'Offers', path: '/offers', icon: 'tag', tone: 'rose' },
  { label: 'Analytics', path: '/analytics', icon: 'chart', tone: 'blue' },
  { label: 'Billing', path: '/billing', icon: 'wallet', tone: 'lime' },
  { label: 'Settings', path: '/settings', icon: 'settings', tone: 'slate' },
  { label: 'Profile', path: '/profile', icon: 'user', tone: 'indigo' },
]

const iconToneClasses = {
  green: 'bg-[#dff8e8] text-[#08783c]',
  amber: 'bg-[#fff1bf] text-[#9a6500]',
  cyan: 'bg-[#dff7fb] text-[#087c8f]',
  violet: 'bg-[#eee8ff] text-[#5d43bd]',
  rose: 'bg-[#ffe3df] text-[#b63a25]',
  blue: 'bg-[#e4efff] text-[#145ce6]',
  lime: 'bg-[#e8fbd7] text-[#3f7f17]',
  slate: 'bg-[#eef2f0] text-[#536258]',
  indigo: 'bg-[#e9edff] text-[#3447b7]',
}

export function AppHeader({ sellerSession, activePage, theme, onToggleTheme, notificationsEnabled, onToggleNotifications, leadingAction }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const shop = sellerSession.shop
  const shopName = shop.shopName || 'Fresh Basket Mart'
  const ownerName = shop.ownerName || 'Seller'
  const locationLabel = shop.location?.address || shop.address || 'Location not added'
  const serviceState = getShopServiceState(sellerSession)

  const goTo = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  useEffect(() => {
    if (!menuOpen && !profileOpen) return undefined
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior
    const previousOverflow = document.body.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyWidth = document.body.style.width
    const scrollY = window.scrollY

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${scrollY}px`

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.width = previousBodyWidth
      document.body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [menuOpen, profileOpen])

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[54px] items-center justify-between border-b border-[#dde5da] bg-[#fbfcf8]/95 px-3.5 backdrop-blur max-[240px]:px-2">
        <div className="flex min-w-0 items-center gap-2.5 max-[240px]:gap-1.5">
          {leadingAction ? (
            <button
              className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9edff] text-[#3447b7] shadow-[0_8px_18px_rgba(52,71,183,0.14)] hover:bg-[#edf5ed] active:bg-[#edf5ed] active:text-[#173f2a]"
              type="button"
              aria-label={leadingAction.label}
              onClick={leadingAction.onClick}
            >
              <Icon name={leadingAction.icon} className="h-[21px] w-[21px]" />
            </button>
          ) : (
            <button
              className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff8e8] text-[#08783c] shadow-[0_8px_18px_rgba(8,120,60,0.14)] hover:bg-[#edf5ed] active:bg-[#edf5ed] active:text-[#173f2a]"
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" className="h-[21px] w-[21px]" />
            </button>
          )}
          <div className="icon-chip h-9 w-9 shrink-0 overflow-hidden rounded-[13px] bg-[#173f2a] shadow-[0_12px_24px_rgba(23,63,42,0.2)] max-[240px]:hidden">
            <img src={nomadLogo} alt="Nomad" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <strong className="truncate text-[14px] font-black">{shopName}</strong>
              <Badge tone={serviceState.tone}>{serviceState.label}</Badge>
            </div>
            <p className="mt-0.5 inline-flex max-w-full items-center rounded-full bg-[#e8fbd7] px-2 py-0.5 text-[10px] font-black uppercase leading-none tracking-[0.04em] text-[#08783c] shadow-[0_6px_14px_rgba(8,120,60,0.12)]">
              <span className="truncate">{activePage}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 max-[240px]:gap-1.5">
          {typeof notificationsEnabled === 'boolean' && (
            <button
              className={`tap-lift grid h-9 w-9 place-items-center rounded-[13px] border ${notificationsEnabled ? 'border-[#77d69c] bg-[#dff8e8] text-[#08783c] active:bg-[#fff6e9] active:text-[#9a6500]' : 'border-[#f3d38d] bg-[#fff6e9] text-[#9a6500] active:bg-[#dff8e8] active:text-[#08783c]'}`}
              type="button"
              aria-label="Notifications"
              onClick={onToggleNotifications}
            >
              <Icon name={notificationsEnabled ? 'bell' : 'bellOff'} className="h-[18px] w-[18px]" />
            </button>
          )}
          <button
            className="tap-lift grid h-9 w-9 place-items-center rounded-[13px] border border-[#dde5da] bg-white text-[#173f2a] active:bg-[#edf5ed] max-[240px]:hidden"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="tap-lift icon-chip grid h-9 w-9 place-items-center rounded-full bg-[#1d2b21] text-[11px] font-black text-white shadow-[0_10px_22px_rgba(23,63,42,0.18)]"
            type="button"
            aria-label="Open shop profile"
            onClick={() => setProfileOpen((current) => !current)}
          >
            {ownerName.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      {profileOpen && (
        <div className="fixed right-4 top-[64px] z-50 w-[min(320px,calc(100vw-32px))] rounded-[22px] border border-[#dde5da] bg-[#fbfcf8] p-4 shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="icon-chip grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#dff8e8,#e9edff_55%,#fff1bf)] text-[#173f2a] shadow-[0_12px_26px_rgba(52,71,183,0.16)]">
                <Icon name="user" className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#dff8e8] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#08783c]">
                  <Icon name="shield" className="h-3 w-3" />
                  Owner
                </p>
                <h2 className="truncate text-[17px] font-black">{ownerName}</h2>
              </div>
            </div>
            <button className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border border-[#dde5da] bg-white text-[#26342b] active:bg-[#fff2ef]" type="button" onClick={() => setProfileOpen(false)} aria-label="Close profile">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-2 rounded-[18px] bg-white p-3">
            <ProfileLine icon="store" label="Shop" value={shopName} tone="green" />
            <ProfileLine icon="pin" label="Location" value={locationLabel} tone="blue" />
          </div>

          <button
            className="tap-lift mt-3 w-full rounded-[15px] bg-[#b63a25] py-3 text-[12px] font-black text-white shadow-[0_14px_28px_rgba(182,58,37,0.22)] active:bg-[#8f2d1d]"
            type="button"
            onClick={() => {
              setProfileOpen(false)
              window.dispatchEvent(new CustomEvent('simplifyliving:logout'))
            }}
          >
            Logout
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-40 h-dvh overflow-hidden bg-[#11181466]" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside
            className="ui-enter h-full w-[82%] max-w-[320px] overflow-y-auto overscroll-contain bg-[#fbfcf8] p-4 shadow-[18px_0_50px_rgba(17,24,20,0.22)]"
            aria-label="Seller navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="icon-chip h-11 w-11 shrink-0 overflow-hidden rounded-[15px] bg-[#173f2a] shadow-[0_12px_24px_rgba(23,63,42,0.2)]">
                  <img src={nomadLogo} alt="Nomad" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-[15px] font-black">{shopName}</strong>
                  <span className="text-[11px] font-bold text-[#647267]">Seller navigation</span>
                </div>
              </div>
              <button
                className="tap-lift grid h-10 w-10 place-items-center rounded-[14px] border border-[#dde5da] bg-white text-[#26342b] active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]"
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="close" className="h-[18px] w-[18px]" />
              </button>
            </div>

            <nav className="grid gap-2">
              {drawerLinks.map((link) => {
                const active = activePage === link.label
                return (
                  <button
                    className={`tap-lift flex min-h-12 items-center gap-3 rounded-[16px] border px-3 text-left ${
                      active
                        ? 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a] shadow-[0_10px_18px_rgba(23,63,42,0.08)]'
                        : 'border-transparent bg-white text-[#26342b] hover:border-[#dde5da]'
                    }`}
                    key={link.path}
                    type="button"
                    onClick={() => goTo(link.path)}
                  >
                    <span className={`icon-chip grid h-8 w-8 shrink-0 place-items-center rounded-[11px] shadow-[0_8px_18px_rgba(17,24,20,0.08)] ${iconToneClasses[link.tone]}`}>
                      <Icon name={link.icon} className="h-[17px] w-[17px]" />
                    </span>
                    <span className="text-[13px] font-black">{link.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

function ProfileLine({ icon, label, value, tone }) {
  const tones = {
    green: 'bg-[#dff8e8] text-[#08783c]',
    blue: 'bg-[#e4efff] text-[#145ce6]',
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[11px] shadow-[0_8px_18px_rgba(17,24,20,0.08)] ${tones[tone] || tones.green}`}>
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
        <strong className="mt-0.5 block truncate text-[12px] font-black text-[#111814]">{value}</strong>
      </span>
    </div>
  )
}
