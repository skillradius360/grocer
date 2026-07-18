import { Icon } from '../Icon'

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
    <section className={`rounded-[18px] border border-[#dde5da] bg-white shadow-[0_12px_26px_rgba(23,63,42,0.07)] ${className}`}>
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
    primary: 'border-[#173f2a] bg-[#173f2a] text-white shadow-[0_10px_22px_rgba(23,63,42,0.22)] active:bg-[#08783c]',
    plain: 'border-[#dfe5df] bg-white text-[#111814] active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]',
    soft: 'border-[#dfe5df] bg-[#f8faf7] text-[#111814] active:border-[#e0aa4a] active:bg-[#fff6e9] active:text-[#9a6500]',
  }

  return (
    <button
      className={`tap-lift inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[14px] border px-3 text-center text-[12px] font-black leading-tight hover:shadow-[0_10px_18px_rgba(31,48,39,0.08)] ${variants[variant]}`}
      type="button"
      onClick={onClick}
    >
      {icon && <Icon name={icon} className="h-[18px] w-[18px] shrink-0" />}
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
      className={`tap-lift grid min-h-[68px] place-items-center gap-1 rounded-[14px] border px-2.5 text-center hover:shadow-[0_10px_18px_rgba(31,48,39,0.08)] active:brightness-[0.97] ${tones[tone]}`}
      type="button"
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center justify-center gap-1 text-[8px] font-black uppercase tracking-[0.06em] text-[#536258]">
        {icon && <Icon name={icon} className="h-[12px] w-[12px] shrink-0" />}
        {title}
      </span>
      <strong className="max-w-full text-[12px] font-black uppercase leading-tight text-[#101814]">{value}</strong>
    </button>
  )
}

export function StatCard({ value, label, icon }) {
  return (
    <Panel className="tap-lift grid min-h-[72px] place-items-center p-3 text-center hover:border-[#b8c8bc] hover:shadow-[0_14px_28px_rgba(23,63,42,0.1)]">
      {icon && <span className="icon-chip mb-1 grid h-8 w-8 place-items-center rounded-[11px] bg-[#edf5ed] text-[#173f2a]"><Icon name={icon} className="h-[16px] w-[16px]" /></span>}
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
    <div className={`tap-lift rounded-[14px] border p-3 ${tones[tone]}`}>
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
      <span className="icon-chip grid h-7 w-7 place-items-center rounded-[10px] bg-[#edf5ed] text-[#173f2a]">
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
    <div className={`tap-lift grid min-h-[52px] place-items-center rounded-[13px] border px-2 text-center ${tones[tone]}`}>
      <strong className="text-[18px] font-black leading-none text-[#101814]">{count}</strong>
      <span className="text-[9px] font-black uppercase tracking-[0.05em] text-[#667369]">{label}</span>
    </div>
  )
}
