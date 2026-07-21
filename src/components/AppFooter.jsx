import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

const footerLinks = [
  { icon: 'dashboard', label: 'Home', path: '/dashboard', tone: 'bg-[#dff8e8] text-[#08783c]' },
  { icon: 'orders', label: 'Orders', path: '/orders', tone: 'bg-[#fff1bf] text-[#9a6500]' },
  { icon: 'box', label: 'Products', path: '/products', tone: 'bg-[#dff7fb] text-[#087c8f]' },
  { icon: 'customers', label: 'Customers', path: '/customers', tone: 'bg-[#eee8ff] text-[#5d43bd]' },
]

const addActions = {
  '/products': 'Add product',
  '/orders': 'Add order',
  '/offers': 'Add offer',
}

const quickLinks = [
  { icon: 'tag', label: 'Offers', path: '/offers', tone: 'bg-[#ffe3df] text-[#b63a25]' },
  { icon: 'chart', label: 'Analytics', path: '/analytics', tone: 'bg-[#e4efff] text-[#145ce6]' },
  { icon: 'wallet', label: 'Billing', path: '/billing', tone: 'bg-[#e8fbd7] text-[#3f7f17]' },
  { icon: 'user', label: 'Profile', path: '/profile', tone: 'bg-[#e9edff] text-[#3447b7]' },
  { icon: 'settings', label: 'Settings', path: '/settings', tone: 'bg-[#eef2f0] text-[#536258]' },
]

export function AppFooter() {
  const location = useLocation()
  const navigate = useNavigate()
  const [quickOpen, setQuickOpen] = useState(false)
  const addLabel = addActions[location.pathname]

  const openAddAction = () => {
    setQuickOpen(false)
    window.dispatchEvent(new CustomEvent('simplifyliving:footer-add', { detail: location.pathname }))
  }

  const goTo = (path) => {
    setQuickOpen(false)
    navigate(path)
  }

  const renderLink = (link) => {
    const active = location.pathname === link.path

    return (
      <button
        className={`tap-lift grid min-h-[56px] min-w-0 place-items-center gap-1 rounded-[14px] px-1 text-center md:min-h-[44px] md:rounded-[11px] ${
          active
            ? 'bg-white/72 text-[#173f2a] shadow-[0_8px_22px_rgba(23,63,42,0.13)]'
            : 'text-[#647267] hover:bg-white/46 hover:text-[#173f2a]'
        }`}
        key={link.path}
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => goTo(link.path)}
      >
        <span className={`grid h-[25px] w-[25px] place-items-center rounded-[9px] shadow-[0_6px_14px_rgba(17,24,20,0.08)] md:h-[23px] md:w-[23px] ${link.tone}`}>
          <Icon name={link.icon} className="h-[15px] w-[15px] md:h-[14px] md:w-[14px]" />
        </span>
        <span className="w-full truncate text-[10px] font-black leading-none sm:text-[11px] md:text-[10px]">{link.label}</span>
      </button>
    )
  }

  return (
    <footer className="seller-app-footer fixed inset-x-0 bottom-0 z-[29] px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-1.5 backdrop-blur-2xl md:inset-x-auto md:left-[var(--seller-footer-left)] md:w-[var(--seller-footer-width)] md:px-3 md:pb-2 md:pt-1.5">
      {quickOpen && (
        <div className="seller-footer-quick-menu ui-enter absolute bottom-[calc(100%+10px)] right-2 w-[min(260px,calc(100vw-16px))] rounded-[18px] border border-[#dde5da] bg-[#fbfcf8] p-2 shadow-[0_24px_60px_rgba(17,24,20,0.24)] md:right-4" role="menu" aria-label="More quick links">
          {quickLinks.map((link) => {
            const active = location.pathname === link.path
            return (
              <button
                className={`tap-lift flex min-h-11 w-full items-center gap-2.5 rounded-[14px] px-2.5 text-left ${active ? 'bg-[#edf5ed] text-[#173f2a]' : 'text-[#26342b] hover:bg-white'}`}
                key={link.path}
                type="button"
                role="menuitem"
                onClick={() => goTo(link.path)}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[11px] shadow-[0_8px_18px_rgba(17,24,20,0.08)] ${link.tone}`}>
                  <Icon name={link.icon} className="h-[17px] w-[17px]" />
                </span>
                <span className="text-[12px] font-black">{link.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <nav className="seller-footer-nav mx-auto grid max-w-[520px] items-end gap-0.5 md:max-w-[460px] md:gap-1" aria-label="Quick links">
        {footerLinks.map(renderLink)}
        <button
          className={`tap-lift grid min-h-[56px] min-w-0 place-items-center gap-1 rounded-[14px] px-1 text-center md:min-h-[44px] md:rounded-[11px] ${quickOpen ? 'bg-white/72 text-[#173f2a] shadow-[0_8px_22px_rgba(23,63,42,0.13)]' : 'text-[#647267] hover:bg-white/46 hover:text-[#173f2a]'}`}
          type="button"
          aria-expanded={quickOpen}
          aria-haspopup="menu"
          aria-label="More quick links"
          onClick={() => setQuickOpen((current) => !current)}
        >
          <span className="grid h-[25px] w-[25px] place-items-center rounded-[9px] bg-[#eef2f0] text-[#536258] shadow-[0_6px_14px_rgba(17,24,20,0.08)] md:h-[23px] md:w-[23px]">
            <Icon name="settings" className="h-[15px] w-[15px] md:h-[14px] md:w-[14px]" />
          </span>
          <span className="w-full truncate text-[10px] font-black leading-none sm:text-[11px] md:text-[10px]">More</span>
        </button>
      </nav>

      {addLabel && (
        <button
          className="seller-footer-add-button tap-lift absolute bottom-[calc(env(safe-area-inset-bottom)+72px)] right-2.5 grid aspect-square h-[56px] w-[56px] shrink-0 place-items-center rounded-full bg-[#173f2a] text-white shadow-[0_18px_36px_rgba(23,63,42,0.28),0_1px_0_rgba(255,255,255,0.3)_inset] hover:bg-[#08783c] sm:right-3 sm:h-[60px] sm:w-[60px] md:bottom-[calc(env(safe-area-inset-bottom)+70px)] md:right-4 md:h-14 md:w-14"
          type="button"
          aria-label={addLabel}
          title={addLabel}
          onClick={openAddAction}
        >
          <Icon name="plus" className="h-7 w-7 sm:h-8 sm:w-8 md:h-7 md:w-7" />
        </button>
      )}
    </footer>
  )
}
