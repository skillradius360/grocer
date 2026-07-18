import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Badge } from './dashboard/DashboardComponents'

const drawerLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', path: '/orders', icon: 'orders' },
  { label: 'Products', path: '/menu', icon: 'box' },
  { label: 'Customers', path: '/customers', icon: 'customers' },
  { label: 'Offers', path: '/offers', icon: 'tag' },
  { label: 'Analytics', path: '/analytics', icon: 'chart' },
  { label: 'Billing', path: '/billing', icon: 'wallet' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
  { label: 'Profile', path: '/profile', icon: 'user' },
]

export function AppHeader({ sellerSession, activePage, theme, onToggleTheme, notificationsEnabled, onToggleNotifications, leadingAction }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const shop = sellerSession.shop
  const shopName = shop.shopName || 'Fresh Basket Mart'
  const ownerName = shop.ownerName || 'Seller'
  const initials = useMemo(
    () => shopName.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
    [shopName],
  )

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
              className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#26342b] hover:bg-[#edf5ed] active:bg-[#edf5ed] active:text-[#173f2a]"
              type="button"
              aria-label={leadingAction.label}
              onClick={leadingAction.onClick}
            >
              <Icon name={leadingAction.icon} className="h-[21px] w-[21px]" />
            </button>
          ) : (
            <button
              className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#26342b] hover:bg-[#edf5ed] active:bg-[#edf5ed] active:text-[#173f2a]"
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" className="h-[21px] w-[21px]" />
            </button>
          )}
          <div className="icon-chip grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[#173f2a] text-xs font-black text-[#fbfcf8] shadow-[0_12px_24px_rgba(23,63,42,0.2)] max-[240px]:hidden">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <strong className="truncate text-[14px] font-black">{shopName}</strong>
              <Badge tone={shop.isLive ? 'green' : 'red'}>{shop.isLive ? 'Live' : 'Off'}</Badge>
            </div>
            <p className="truncate text-[10px] font-semibold text-[#647267]">{activePage.toLowerCase()}</p>
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
            className="tap-lift icon-chip grid h-9 w-9 place-items-center rounded-full bg-[#1d2b21] text-[11px] font-black text-white"
            type="button"
            aria-label="Open shop profile"
            onClick={() => setProfileOpen((current) => !current)}
          >
            {ownerName.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      {profileOpen && (
        <div className="fixed right-4 top-[64px] z-30 w-[min(360px,calc(100vw-32px))] rounded-[22px] border border-[#dde5da] bg-[#fbfcf8] p-4 shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="icon-chip grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[18px] bg-[#173f2a] text-base font-black text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Current shop</p>
                <h2 className="truncate text-[17px] font-black">{shopName}</h2>
                <p className="truncate text-[12px] font-bold text-[#647267]">{shop.address || 'Location not added'}</p>
              </div>
            </div>
            <button className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border border-[#dde5da] bg-white text-[#26342b] active:bg-[#fff2ef]" type="button" onClick={() => setProfileOpen(false)} aria-label="Close profile">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ProfilePill label="Owner" value={ownerName} />
            <ProfilePill label="Phone" value={shop.phone || 'Not added'} />
            <ProfilePill label="Shop status" value={shop.shopStatus || 'Active'} />
            <ProfilePill label="Delivery" value={shop.deliveryStatus || 'Active'} />
          </div>

          <div className="mt-3 rounded-[16px] border border-[#dde5da] bg-white p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#647267]">User session</p>
            <strong className="mt-1 block truncate text-[13px] font-black">{sellerSession.auth?.provider || 'local'} seller</strong>
            <span className="mt-0.5 block truncate text-[11px] font-bold text-[#647267]">{sellerSession.auth?.uid || 'local-seller-demo'}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="tap-lift rounded-[14px] border border-[#dde5da] bg-white py-3 text-[12px] font-black text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={() => { setProfileOpen(false); navigate('/profile') }}>
              View profile
            </button>
            <button className="tap-lift rounded-[14px] bg-[#173f2a] py-3 text-[12px] font-black text-white active:bg-[#08783c]" type="button" onClick={() => { setProfileOpen(false); navigate('/settings') }}>
              Settings
            </button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-20 h-dvh overflow-hidden bg-[#11181466]" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside
            className="ui-enter h-full w-[82%] max-w-[320px] overflow-y-auto overscroll-contain bg-[#fbfcf8] p-4 shadow-[18px_0_50px_rgba(17,24,20,0.22)]"
            aria-label="Seller navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#173f2a] text-sm font-black text-white">
                  {initials}
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
                    <span className="icon-chip grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[#f3f7f1]">
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

function ProfilePill({ label, value }) {
  return (
    <div className="rounded-[14px] bg-white p-3">
      <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
      <strong className="mt-1 block truncate text-[12px] font-black text-[#111814]">{value}</strong>
    </div>
  )
}
