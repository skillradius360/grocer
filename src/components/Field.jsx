import { Icon } from './Icon'

export function Field({ label, value, onChange, placeholder, inputMode, icon, error, maxLength, pattern, type = 'text' }) {
  return (
    <label className="grid gap-2 text-[13px] font-bold text-[#334338]">
      <span className="flex items-center justify-between">
        {label}
        {error && <span className="text-xs font-extrabold text-[#b84a36]">{error}</span>}
      </span>
      <div
        className={`tap-lift flex h-14 items-center gap-2.5 rounded-2xl border bg-white px-3.5 text-[#6a7b6f] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${
          error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'
        }`}
      >
        <span className="icon-chip grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[#edf5ed] text-[#173f2a]">
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-[#121812] outline-none placeholder:text-[#9aa79d]"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          pattern={pattern}
          type={type}
        />
      </div>
    </label>
  )
}
