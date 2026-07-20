import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, Save } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { MapPicker } from '../components/MapPicker'
import { digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

export function ProfilePage({ sellerSession, setSellerSession, theme, onToggleTheme }) {
  const shop = sellerSession.shop
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [locating, setLocating] = useState(false)
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
      gst: value.toUpperCase().replace(/\s/g, '').slice(0, 15),
    }[field] ?? value
    setProfile((current) => ({ ...current, [field]: nextValue }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const updateLocationPoint = (latitude, longitude, nextMessage = 'Map pin updated.') => {
    update('latitude', Number(latitude).toFixed(6))
    update('longitude', Number(longitude).toFixed(6))
    setMessage(nextMessage)
    window.setTimeout(() => setMessage(''), 2200)
  }

  const locateShop = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not supported in this browser.')
      return
    }

    setLocating(true)
    setMessage('Locating shop position...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationPoint(position.coords.latitude, position.coords.longitude, 'Location captured. Review the map pin before saving.')
        setLocating(false)
      },
      () => {
        setMessage('Unable to access location. Please allow browser location permission.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    )
  }

  const searchLocation = useCallback(async () => {
    const query = locationQuery.trim()
    if (query.length < 3) {
      setLocationResults([])
      return
    }

    try {
      setSearchingLocation(true)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`)
      const results = await response.json()
      setLocationResults(results)
    } catch {
      setMessage('Location search failed. Check internet connection and try again.')
      window.setTimeout(() => setMessage(''), 2200)
    } finally {
      setSearchingLocation(false)
    }
  }, [locationQuery])

  const selectLocationResult = (result) => {
    update('address', result.display_name || profile.address)
    updateLocationPoint(result.lat, result.lon, 'Map result selected. Review the pin before saving.')
  }

  useEffect(() => {
    const query = locationQuery.trim()
    if (query.length < 3) return undefined

    const timeoutId = window.setTimeout(() => {
      searchLocation()
    }, 650)

    return () => window.clearTimeout(timeoutId)
  }, [locationQuery, searchLocation])

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
        <section className="grid gap-3 rounded-[22px] border border-white/70 bg-white p-4 shadow-[0_18px_44px_rgba(23,63,42,0.11),0_1px_0_rgba(255,255,255,0.86)_inset]">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField error={errors.shopName} label="Shop name" value={profile.shopName} onChange={(value) => update('shopName', value)} placeholder="Fresh Basket Mart" />
            <TextField error={errors.ownerName} label="Owner name" value={profile.ownerName} onChange={(value) => update('ownerName', value)} placeholder="Owner full name" />
            <TextField error={errors.phone} label="Phone number" value={profile.phone} onChange={(value) => update('phone', value)} placeholder="+91 98765 43210" inputMode="tel" />
            <TextField error={errors.gst} label="GST (optional)" value={profile.gst} onChange={(value) => update('gst', value)} placeholder="22AAAAA0000A1Z5" />
          </div>
          <TextField error={errors.address} label="Shop location / address" value={profile.address} onChange={(value) => update('address', value)} placeholder="Street, area, landmark" multiline />
          <div className="grid gap-3 md:grid-cols-1">
            <TextField error={errors.pincode} label="Pincode" value={profile.pincode} onChange={(value) => update('pincode', value)} placeholder="700001" inputMode="numeric" />
          </div>
          <div className="grid gap-3 rounded-[18px] border border-white/70 bg-[#f8faf7] p-3 shadow-[0_12px_30px_rgba(23,63,42,0.08),0_1px_0_rgba(255,255,255,0.78)_inset]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[#173f2a]">
                  <MapPin className="h-4 w-4" />
                  <strong className="text-[12px] font-black">Shop map location</strong>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-[#647267]">Search an area, use GPS, or tap and drag the pin to update your shop location.</p>
              </div>
              <button className="tap-lift shrink-0 rounded-[14px] bg-[#173f2a] px-3 py-2 text-[11px] font-black text-white active:bg-[#08783c]" type="button" onClick={locateShop} disabled={locating}>
                {locating ? 'Locating...' : 'Use current'}
              </button>
            </div>
            <input
              className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-white px-3 text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]"
              value={locationQuery}
              onChange={(event) => {
                setLocationQuery(event.target.value)
                if (event.target.value.trim().length < 3) setLocationResults([])
              }}
              placeholder="Search area, landmark, street, city..."
            />
            {searchingLocation && <p className="text-[11px] font-bold text-[#647267]">Searching location...</p>}
            {locationResults.length > 0 && (
              <div className="grid max-h-[190px] gap-2 overflow-auto rounded-[16px] border border-[#dde5da] bg-[#fbfcf8] p-2">
                {locationResults.map((result) => (
                  <button className="tap-lift flex items-start gap-2 rounded-[14px] border border-[#edf1ed] bg-white p-3 text-left shadow-[0_8px_18px_rgba(23,63,42,0.05)] active:border-[#173f2a] active:bg-[#edf5ed]" key={`${result.place_id}-${result.lat}-${result.lon}`} type="button" onClick={() => selectLocationResult(result)}>
                    <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[#173f2a]" />
                    <span className="min-w-0">
                      <strong className="block text-[12px] font-black text-[#111814]">{result.name || result.type || 'Map location'}</strong>
                      <small className="block text-[11px] font-semibold leading-snug text-[#647267]">{result.display_name}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {(errors.latitude || errors.longitude) && <p className="rounded-[14px] border border-[#efafa3] bg-[#fff2ef] px-3 py-2 text-[11px] font-bold text-[#b63a25]">Select a shop pin on the map before saving.</p>}
            <MapPicker latitude={profile.latitude} longitude={profile.longitude} onChange={updateLocationPoint} />
            {!profile.latitude && !profile.longitude && <p className="text-[11px] font-semibold text-[#647267]">Showing New Delhi as a map preview until you set your shop pin.</p>}
          </div>
          <div className="rounded-[16px] border border-white/70 bg-[#f8faf7] p-3 shadow-[0_10px_24px_rgba(23,63,42,0.07)]">
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

        <button className="tap-lift inline-flex min-h-13 items-center justify-center gap-2 rounded-[17px] bg-[#173f2a] px-4 py-3 text-[13px] font-black text-white shadow-[0_16px_30px_rgba(23,63,42,0.22)] hover:shadow-[0_20px_36px_rgba(23,63,42,0.28)] active:bg-[#08783c]" type="button" onClick={saveProfile}>
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
        className={`tap-lift min-h-12 rounded-[15px] border bg-[#fbfcf8] px-3 py-3 text-[13px] font-bold text-[#111814] shadow-[0_8px_18px_rgba(23,63,42,0.05)] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1),0_12px_24px_rgba(23,63,42,0.1)] ${error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
      />
    </label>
  )
}
