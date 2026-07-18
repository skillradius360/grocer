import { useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Badge } from './dashboard/DashboardComponents'

const drawerLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', path: '/orders', icon: 'orders' },
  { label: 'Menu', path: '/menu', icon: 'box' },
  { label: 'Customers', path: '/customers', icon: 'customers' },
  { label: 'Offers', path: '/offers', icon: 'tag' },
  { label: 'Analytics', path: '/analytics', icon: 'chart' },
  { label: 'Growth', path: '/ai-insights', icon: 'spark' },
  { label: 'Billing', path: '/billing', icon: 'wallet' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
  { label: 'Profile', path: '/profile', icon: 'user' },
]

export function AppHeader({ sellerSession, activePage, theme, onToggleTheme, notificationsEnabled, onToggleNotifications }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
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

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[58px] items-center justify-between border-b border-[#dde5da] bg-[#fbfcf8]/95 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            className="tap-lift grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#26342b] hover:bg-[#edf5ed] active:bg-[#edf5ed] active:text-[#173f2a]"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" className="h-[21px] w-[21px]" />
          </button>
          <div className="icon-chip grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[#173f2a] text-sm font-black text-[#fbfcf8] shadow-[0_12px_24px_rgba(23,63,42,0.2)]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <strong className="truncate text-[15px] font-black">{shopName}</strong>
              <Badge tone={shop.isLive ? 'green' : 'red'}>{shop.isLive ? 'Live' : 'Off'}</Badge>
            </div>
            <p className="truncate text-[11px] font-semibold text-[#647267]">{activePage.toLowerCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {typeof notificationsEnabled === 'boolean' && (
            <button
              className={`tap-lift grid h-10 w-10 place-items-center rounded-[14px] border ${notificationsEnabled ? 'border-[#77d69c] bg-[#dff8e8] text-[#08783c] active:bg-[#fff6e9] active:text-[#9a6500]' : 'border-[#f3d38d] bg-[#fff6e9] text-[#9a6500] active:bg-[#dff8e8] active:text-[#08783c]'}`}
              type="button"
              aria-label="Notifications"
              onClick={onToggleNotifications}
            >
              <Icon name={notificationsEnabled ? 'bell' : 'bellOff'} className="h-[18px] w-[18px]" />
            </button>
          )}
          <button
            className="tap-lift grid h-10 w-10 place-items-center rounded-[14px] border border-[#dde5da] bg-white text-[#173f2a] active:bg-[#edf5ed]"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="icon-chip grid h-10 w-10 place-items-center rounded-full bg-[#1d2b21] text-xs font-black text-white">
            {ownerName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-20 bg-[#11181466]" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside
            className="ui-enter h-full w-[82%] max-w-[320px] bg-[#fbfcf8] p-4 shadow-[18px_0_50px_rgba(17,24,20,0.22)]"
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
