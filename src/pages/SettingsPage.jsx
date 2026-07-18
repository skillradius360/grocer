import { useState } from 'react'
import { Clock, Save, Store, Truck } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

const defaultSettings = {
  openingTime: '09:00',
  closingTime: '22:00',
  deliveryStatus: 'Active',
  shopStatus: 'Active',
  serviceRadius: '4',
  preparationTime: '25',
}

export function SettingsPage({ sellerSession, setSellerSession, theme, onToggleTheme }) {
  const shop = sellerSession.shop
  const [savedMessage, setSavedMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [shopSettings, setShopSettings] = useState({
    ...defaultSettings,
    deliveryStatus: shop.deliveryStatus || defaultSettings.deliveryStatus,
    shopStatus: shop.shopStatus === 'Closed' ? 'Trial' : shop.shopStatus || defaultSettings.shopStatus,
  })

  const updateSetting = (field, value) => {
    const nextValue = ['serviceRadius', 'preparationTime'].includes(field) ? digitsOnly(value, 3) : value
    setShopSettings((current) => ({ ...current, [field]: nextValue }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const saveChanges = () => {
    const nextErrors = validateFieldsByRules(shopSettings, {
        serviceRadius: { required: true, pattern: patterns.positiveNumber, min: 1, max: 50, message: '1-50 km' },
        preparationTime: { required: true, pattern: patterns.positiveNumber, min: 1, max: 180, message: '1-180 min' },
      })

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      setSavedMessage('Please fix highlighted fields.')
      window.setTimeout(() => setSavedMessage(''), 2200)
      return
    }

    setSellerSession((current) => ({
      ...current,
      shop: {
        ...current.shop,
        deliveryStatus: shopSettings.deliveryStatus,
        shopStatus: shopSettings.shopStatus,
        isLive: shopSettings.shopStatus === 'Active',
        settings: {
          openingTime: shopSettings.openingTime,
          closingTime: shopSettings.closingTime,
          serviceRadius: Number(shopSettings.serviceRadius || 0),
          preparationTime: Number(shopSettings.preparationTime || 0),
        },
      },
    }))
    setSavedMessage('Settings saved locally. Firebase write can map to shops/{shopId}.')
    window.setTimeout(() => setSavedMessage(''), 2200)
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f4f7f3] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Settings" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <section className="grid gap-3">
          <div className="rounded-[16px] border border-[#dde5da] bg-white p-2.5 shadow-[0_12px_28px_rgba(23,63,42,0.07)] sm:p-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-[#edf5ed] text-[#173f2a] sm:h-10 sm:w-10 sm:rounded-[14px]">
                <Store className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Settings</p>
                <h1 className="truncate text-[17px] font-black sm:text-[19px]">Shop operations</h1>
              </div>
            </div>
          </div>

          <FormPanel icon={Clock} title="Shop operational settings" copy="Timing, availability, delivery controls, and activation state.">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField label="Opening time" value={shopSettings.openingTime} onChange={(value) => updateSetting('openingTime', value)} type="time" />
              <TextField label="Closing time" value={shopSettings.closingTime} onChange={(value) => updateSetting('closingTime', value)} type="time" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField label="Delivery status" value={shopSettings.deliveryStatus} onChange={(value) => updateSetting('deliveryStatus', value)}>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Pickup Only">Pickup Only</option>
              </SelectField>
              <SelectField label="Shop status" value={shopSettings.shopStatus} onChange={(value) => updateSetting('shopStatus', value)}>
                <option value="Trial">Trial</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </SelectField>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField error={fieldErrors.serviceRadius} label="Delivery radius km" value={shopSettings.serviceRadius} onChange={(value) => updateSetting('serviceRadius', value)} inputMode="numeric" placeholder="4" />
              <TextField error={fieldErrors.preparationTime} label="Preparation time min" value={shopSettings.preparationTime} onChange={(value) => updateSetting('preparationTime', value)} inputMode="numeric" placeholder="25" />
            </div>
          </FormPanel>
          <div className="rounded-[20px] border border-[#dde5da] bg-white p-4 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
            <div className="mb-3 flex items-center gap-2 text-[#173f2a]">
              <Truck className="h-5 w-5" />
              <h2 className="text-[15px] font-black">Operations preview</h2>
            </div>
            <p className="text-[12px] font-semibold leading-relaxed text-[#647267]">
              Shop runs from <strong className="text-[#111814]">{shopSettings.openingTime}</strong> to <strong className="text-[#111814]">{shopSettings.closingTime}</strong>, delivery is <strong className="text-[#111814]">{shopSettings.deliveryStatus}</strong>, and the shop is marked <strong className="text-[#111814]">{shopSettings.shopStatus}</strong>.
            </p>
          </div>

          {savedMessage && (
            <div className="ui-enter rounded-[16px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">
              {savedMessage}
            </div>
          )}

          <button className="tap-lift inline-flex min-h-13 items-center justify-center gap-2 rounded-[17px] bg-[#173f2a] px-4 py-3 text-[13px] font-black text-white active:bg-[#08783c]" type="button" onClick={saveChanges}>
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </section>
      </main>
    </div>
  )
}

function FormPanel({ icon: Icon, title, copy, children }) {
  return (
    <section className="grid gap-3 rounded-[22px] border border-[#dde5da] bg-white p-4 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
      <div className="flex items-start gap-3">
        <span className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#edf5ed] text-[#173f2a]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[16px] font-black">{title}</h2>
          <p className="mt-0.5 text-[12px] font-semibold text-[#647267]">{copy}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TextField({ label, value, onChange, placeholder, inputMode, multiline, type = 'text', error }) {
  const Control = multiline ? 'textarea' : 'input'
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-[0.06em] text-[#647267]">
        {label}
        {error && <span className="normal-case tracking-normal text-[#b63a25]">{error}</span>}
      </span>
      <Control
        className={`tap-lift min-h-12 rounded-[15px] border bg-[#fbfcf8] px-3 py-3 text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
      />
    </label>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
      <select className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  )
}
