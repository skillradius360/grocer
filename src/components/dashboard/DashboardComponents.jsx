import { Icon } from '../Icon'

const iconTones = {
  back: 'bg-[#e9edff] text-[#3447b7]',
  box: 'bg-[#dff7fb] text-[#087c8f]',
  chef: 'bg-[#fff1bf] text-[#9a6500]',
  check: 'bg-[#dff8e8] text-[#08783c]',
  copy: 'bg-[#e9edff] text-[#3447b7]',
  external: 'bg-[#dff8e8] text-[#08783c]',
  orders: 'bg-[#fff1bf] text-[#9a6500]',
  plus: 'bg-[#dff8e8] text-[#08783c]',
  qr: 'bg-[#dff7fb] text-[#087c8f]',
  refresh: 'bg-[#fff1bf] text-[#9a6500]',
  store: 'bg-[#dff8e8] text-[#08783c]',
  tag: 'bg-[#ffe3df] text-[#b63a25]',
  truck: 'bg-[#e9edff] text-[#3447b7]',
  wallet: 'bg-[#e8fbd7] text-[#3f7f17]',
}

export function Badge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-[#dff8e8] text-[#08783c]',
    amber: 'bg-[#fff3d6] text-[#9a6500]',
    blue: 'bg-[#edf5ed] text-[#173f2a]',
    red: 'bg-[#ffe8e3] text-[#b63a25]',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-[18px] border border-white/90 bg-white shadow-[0_18px_34px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.08)] ${className}`}>
      {children}
    </section>
  )
}

export function SectionTitle({ title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[11px] font-black uppercase tracking-[0.08em] text-[#5b7567]">{title}</h2>
      {action}
    </div>
  )
}

export function IconButton({ icon, label, variant = 'plain', onClick }) {
  const variants = {
    primary: 'border-[#173f2a] bg-[#173f2a] text-white shadow-[0_2px_4px_rgba(16,24,32,0.12),0_14px_28px_rgba(7,95,54,0.24)] active:bg-[#08783c]',
    plain: 'border-[#dfe5df] bg-white text-[#111814] active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]',
    soft: 'border-[#dfe5df] bg-[#f8faf7] text-[#111814] active:border-[#e0aa4a] active:bg-[#fff6e9] active:text-[#9a6500]',
  }

  return (
    <button
      className={`tap-lift inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[14px] border px-3 text-center text-[12px] font-black leading-tight shadow-[0_6px_14px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_34px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.08)] ${variants[variant]}`}
      type="button"
      onClick={onClick}
    >
      {icon && (
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[10px] shadow-[0_6px_14px_rgba(17,24,20,0.08)] ${iconTones[icon] || 'bg-[#edf5ed] text-[#173f2a]'}`}>
          <Icon name={icon} className="h-[15px] w-[15px]" />
        </span>
      )}
      <span>{label}</span>
    </button>
  )
}

export function StatusCard({ title, value, tone = 'green', icon, onClick }) {
  const tones = {
    green: 'border-[#77d69c] bg-[#f0fff5] text-[#08783c]',
    amber: 'border-[#f2c45f] bg-[#fff9ea] text-[#8b5a00]',
    blue: 'border-[#a7d6b5] bg-[#edf5ed] text-[#173f2a]',
    red: 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
  }

  return (
    <button
      className={`tap-lift grid min-h-[68px] place-items-center gap-1 rounded-[14px] border px-2.5 text-center shadow-[0_18px_34px_rgba(0,0,0,0.16),0_3px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_24px_44px_rgba(0,0,0,0.2),0_8px_18px_rgba(0,0,0,0.1)] active:brightness-[0.97] ${tones[tone]}`}
      type="button"
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center justify-center gap-1 text-[8px] font-black uppercase tracking-[0.06em] text-[#536258]">
        {icon && <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-[7px] ${iconTones[icon] || 'bg-white/70 text-[#173f2a]'}`}><Icon name={icon} className="h-[11px] w-[11px]" /></span>}
        {title}
      </span>
      <strong className="max-w-full text-[12px] font-black uppercase leading-tight text-[#101814]">{value}</strong>
    </button>
  )
}

export function StatCard({ value, label, icon }) {
  return (
    <Panel className="tap-lift grid min-h-[72px] place-items-center p-3 text-center hover:border-[#b8c8bc] hover:shadow-[0_14px_28px_rgba(23,63,42,0.1)]">
      {icon && <span className={`icon-chip mb-1 grid h-8 w-8 place-items-center rounded-[11px] shadow-[0_8px_18px_rgba(17,24,20,0.08)] ${iconTones[icon] || 'bg-[#edf5ed] text-[#173f2a]'}`}><Icon name={icon} className="h-[16px] w-[16px]" /></span>}
      <strong className="text-[20px] font-black leading-none text-[#0f1712]">{value}</strong>
      <span className="mt-1 text-[9px] font-black uppercase leading-tight tracking-[0.05em] text-[#667369]">{label}</span>
    </Panel>
  )
}

export function PipelineCard({ count, title, copy, tone }) {
  const tones = {
    blue: 'border-[#a7d6b5] bg-[#edf5ed]',
    amber: 'border-[#efbc87] bg-[#fff4e9]',
    green: 'border-[#99d8b2] bg-[#edfbf2]',
  }

  return (
    <div className={`tap-lift rounded-[14px] border p-3 shadow-[0_10px_24px_rgba(23,63,42,0.07)] hover:shadow-[0_14px_28px_rgba(23,63,42,0.11)] ${tones[tone]}`}>
      <strong className="text-[19px] font-black leading-none text-[#101814]">{count}</strong>
      <p className="mt-1 text-[11px] font-black text-[#101814]">{title}</p>
      <span className="text-[10px] font-medium text-[#667369]">{copy}</span>
    </div>
  )
}

export function NavTile({ icon, label, onClick }) {
  return (
    <button
      className="tap-lift grid min-h-[62px] place-items-center gap-1 rounded-[14px] border border-[#dfe5df] bg-white px-1.5 text-center text-[#111814] shadow-[0_6px_16px_rgba(30,45,37,0.05)] hover:border-[#9fb7a8] hover:shadow-[0_10px_18px_rgba(23,63,42,0.08)] active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]"
      type="button"
      onClick={onClick}
    >
      <span className={`icon-chip grid h-7 w-7 place-items-center rounded-[10px] shadow-[0_6px_14px_rgba(17,24,20,0.08)] ${iconTones[icon] || 'bg-[#edf5ed] text-[#173f2a]'}`}>
        <Icon name={icon} className="h-[16px] w-[16px]" />
      </span>
      <span className="max-w-full text-[10px] font-black leading-tight">{label}</span>
    </button>
  )
}

export function StockCard({ count, label, tone }) {
  const tones = {
    red: 'border-[#f1b0a6] bg-[#fff0ee]',
    amber: 'border-[#f3d38d] bg-[#fff8e6]',
    peach: 'border-[#f0cfab] bg-[#fff5ec]',
    green: 'border-[#a7e1bd] bg-[#effbf3]',
  }

  return (
    <div className={`stock-card stock-card-${tone} tap-lift grid min-h-[52px] place-items-center rounded-[13px] border px-2 text-center shadow-[0_8px_18px_rgba(23,63,42,0.06)] ${tones[tone]}`}>
      <strong className="text-[18px] font-black leading-none text-[#101814]">{count}</strong>
      <span className="text-[9px] font-black uppercase tracking-[0.05em] text-[#667369]">{label}</span>
    </div>
  )
}
