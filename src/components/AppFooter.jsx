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

export function AppFooter() {
  const location = useLocation()
  const navigate = useNavigate()
  const addLabel = addActions[location.pathname]
  const firstLinks = addLabel ? footerLinks.slice(0, 2) : footerLinks
  const lastLinks = addLabel ? footerLinks.slice(2) : []

  const openAddAction = () => {
    window.dispatchEvent(new CustomEvent('simplifyliving:footer-add', { detail: location.pathname }))
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
        onClick={() => navigate(link.path)}
      >
        <span className={`grid h-[25px] w-[25px] place-items-center rounded-[9px] shadow-[0_6px_14px_rgba(17,24,20,0.08)] md:h-[23px] md:w-[23px] ${link.tone}`}>
          <Icon name={link.icon} className="h-[15px] w-[15px] md:h-[14px] md:w-[14px]" />
        </span>
        <span className="w-full truncate text-[10px] font-black leading-none sm:text-[11px] md:text-[10px]">{link.label}</span>
      </button>
    )
  }

  return (
    <footer className="seller-app-footer fixed inset-x-0 bottom-0 z-20 px-2 pb-[calc(env(safe-area-inset-bottom)+7px)] pt-1.5 backdrop-blur-2xl md:inset-x-auto md:left-[var(--seller-footer-left)] md:w-[var(--seller-footer-width)] md:px-3 md:pb-2 md:pt-1.5">
      <nav className={`seller-footer-nav mx-auto grid max-w-[520px] items-end gap-1 md:max-w-[460px] ${addLabel ? 'seller-footer-nav-add' : 'seller-footer-nav-standard'}`} aria-label="Quick links">
        {firstLinks.map(renderLink)}
        {addLabel && (
          <button
            className="seller-footer-add-button tap-lift -mt-4 mb-1 grid aspect-square h-[58px] w-[58px] shrink-0 place-items-center justify-self-center rounded-full bg-[#173f2a] text-white shadow-[0_18px_36px_rgba(23,63,42,0.28),0_1px_0_rgba(255,255,255,0.3)_inset] hover:bg-[#08783c] sm:h-16 sm:w-16 md:-mt-3 md:mb-0 md:h-14 md:w-14"
            type="button"
            aria-label={addLabel}
            title={addLabel}
            onClick={openAddAction}
          >
            <Icon name="plus" className="h-7 w-7 sm:h-8 sm:w-8 md:h-7 md:w-7" />
          </button>
        )}
        {lastLinks.map(renderLink)}
      </nav>
    </footer>
  )
}
