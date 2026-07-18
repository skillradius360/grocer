import { useMemo, useState } from 'react'
import { MapPin, Save, Store, UserRound } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { decimalOnly, digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

export function ProfilePage({ sellerSession, setSellerSession, theme, onToggleTheme }) {
  const shop = sellerSession.shop
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [profile, setProfile] = useState({
    shopName: shop.shopName || 'Fresh Basket Mart',
    ownerName: shop.ownerName || '',
    phone: shop.phone || '',
    address: shop.address || '',
    pincode: shop.pincode || '',
    gst: shop.gst || '',
    latitude: shop.location?.geoPoint?.latitude?.toString() || shop.latitude || '',
    longitude: shop.location?.geoPoint?.longitude?.toString() || shop.longitude || '',
  })

  const completion = useMemo(() => {
    const fields = Object.values(profile)
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [profile])

  const update = (field, value) => {
    const nextValue = {
      phone: value.replace(/[^\d+\s-]/g, '').slice(0, 16),
      pincode: digitsOnly(value, 6),
      latitude: decimalOnly(value, 12),
      longitude: decimalOnly(value, 12),
      gst: value.toUpperCase().replace(/\s/g, '').slice(0, 15),
    }[field] ?? value
    setProfile((current) => ({ ...current, [field]: nextValue }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const saveProfile = () => {
    const nextErrors = validateFieldsByRules(profile, {
      shopName: { required: true, pattern: patterns.shopName, message: 'Invalid shop name' },
      ownerName: { required: true, pattern: patterns.alphanumericName, message: 'Invalid owner name' },
      phone: { required: true, pattern: patterns.phone, message: 'Invalid phone' },
      gst: { required: false, pattern: patterns.gst, message: 'Invalid GST' },
      address: { required: true, pattern: /^.{8,180}$/, message: 'Add full address' },
      pincode: { required: true, pattern: patterns.pincode, message: '6 digit pincode' },
      latitude: { required: true, pattern: patterns.decimal, min: -90, max: 90, message: 'Invalid latitude' },
      longitude: { required: true, pattern: patterns.decimal, min: -180, max: 180, message: 'Invalid longitude' },
    })

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setMessage('Please fix highlighted fields.')
      window.setTimeout(() => setMessage(''), 2200)
      return
    }

    setSellerSession((current) => ({
      ...current,
      shop: {
        ...current.shop,
        ...profile,
        location: {
          address: profile.address,
          pincode: profile.pincode,
          geoPoint: {
            latitude: Number(profile.latitude || 0),
            longitude: Number(profile.longitude || 0),
          },
          provider: 'seller-profile',
          updatedAt: new Date().toISOString(),
        },
      },
    }))
    setMessage('Profile saved locally. Firebase can map this to shops/{shopId}.')
    window.setTimeout(() => setMessage(''), 2200)
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f4f7f3] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Profile" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />
      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <section className="rounded-[16px] border border-[#dde5da] bg-white p-2.5 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[#173f2a]">
              <UserRound className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Profile</p>
              <h1 className="truncate text-[17px] font-black sm:text-[19px]">Seller details</h1>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-[22px] border border-[#dde5da] bg-white p-4 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField error={errors.shopName} label="Shop name" value={profile.shopName} onChange={(value) => update('shopName', value)} placeholder="Fresh Basket Mart" />
            <TextField error={errors.ownerName} label="Owner name" value={profile.ownerName} onChange={(value) => update('ownerName', value)} placeholder="Owner full name" />
            <TextField error={errors.phone} label="Phone number" value={profile.phone} onChange={(value) => update('phone', value)} placeholder="+91 98765 43210" inputMode="tel" />
            <TextField error={errors.gst} label="GST (optional)" value={profile.gst} onChange={(value) => update('gst', value)} placeholder="22AAAAA0000A1Z5" />
          </div>
          <TextField error={errors.address} label="Shop location / address" value={profile.address} onChange={(value) => update('address', value)} placeholder="Street, area, landmark" multiline />
          <div className="grid gap-3 md:grid-cols-3">
            <TextField error={errors.pincode} label="Pincode" value={profile.pincode} onChange={(value) => update('pincode', value)} placeholder="700001" inputMode="numeric" />
            <TextField error={errors.latitude} label="Latitude" value={profile.latitude} onChange={(value) => update('latitude', value)} placeholder="22.572645" inputMode="decimal" />
            <TextField error={errors.longitude} label="Longitude" value={profile.longitude} onChange={(value) => update('longitude', value)} placeholder="88.363892" inputMode="decimal" />
          </div>
          <div className="rounded-[16px] border border-[#dde5da] bg-[#f8faf7] p-3">
            <div className="mb-2 flex items-center gap-2 text-[#173f2a]">
              <MapPin className="h-4 w-4" />
              <strong className="text-[12px] font-black">Profile readiness</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e2e9df]">
              <span className="block h-full rounded-full bg-[#173f2a]" style={{ width: `${completion}%` }}></span>
            </div>
            <p className="mt-2 text-[11px] font-bold text-[#647267]">{completion}% profile details complete</p>
          </div>
        </section>

        {message && <div className="ui-enter rounded-[16px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">{message}</div>}

        <button className="tap-lift inline-flex min-h-13 items-center justify-center gap-2 rounded-[17px] bg-[#173f2a] px-4 py-3 text-[13px] font-black text-white active:bg-[#08783c]" type="button" onClick={saveProfile}>
          <Save className="h-4 w-4" />
          Save profile
        </button>
      </main>
    </div>
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
