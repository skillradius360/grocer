import { useMemo, useState } from 'react'
import {
  Clock,
  Crosshair,
  MapPin,
  Save,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { MapPicker } from '../components/MapPicker'
import { decimalOnly, digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

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
  const [locationMessage, setLocationMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [shopInfo, setShopInfo] = useState({
    shopName: shop.shopName || 'Fresh Basket Mart',
    ownerName: shop.ownerName || '',
    phone: shop.phone || '',
    address: shop.address || '',
    pincode: shop.pincode || '',
    gst: shop.gst || '',
    latitude: shop.location?.geoPoint?.latitude?.toString() || shop.latitude || '',
    longitude: shop.location?.geoPoint?.longitude?.toString() || shop.longitude || '',
  })
  const [shopSettings, setShopSettings] = useState({
    ...defaultSettings,
    deliveryStatus: shop.deliveryStatus || defaultSettings.deliveryStatus,
    shopStatus: shop.shopStatus === 'Closed' ? 'Trial' : shop.shopStatus || defaultSettings.shopStatus,
  })

  const completion = useMemo(() => {
    const fields = Object.values(shopInfo)
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [shopInfo])

  const updateInfo = (field, value) => {
    const nextValue = {
      phone: value.replace(/[^\d+\s-]/g, '').slice(0, 16),
      pincode: digitsOnly(value, 6),
      latitude: decimalOnly(value, 12),
      longitude: decimalOnly(value, 12),
      gst: value.toUpperCase().replace(/\s/g, '').slice(0, 15),
    }[field] ?? value
    setShopInfo((current) => ({ ...current, [field]: nextValue }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }
  const updateSetting = (field, value) => {
    const nextValue = ['serviceRadius', 'preparationTime'].includes(field) ? digitsOnly(value, 3) : value
    setShopSettings((current) => ({ ...current, [field]: nextValue }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }
  const hasCoordinates = shopInfo.latitude && shopInfo.longitude

  const locateShop = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported in this browser.')
      return
    }

    setLocating(true)
    setLocationMessage('Locating shop position...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6)
        const longitude = position.coords.longitude.toFixed(6)
        setShopInfo((current) => ({ ...current, latitude, longitude }))
        setLocationMessage('Location captured. Review the map preview before saving.')
        setLocating(false)
      },
      () => {
        setLocationMessage('Unable to access location. Please allow browser location permission.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    )
  }

  const searchLocation = async () => {
    const query = locationQuery.trim()
    if (!query) {
      setLocationMessage('Type an area, landmark, or full address to search.')
      return
    }

    try {
      setSearchingLocation(true)
      setLocationMessage('Searching map locations...')
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`)
      const results = await response.json()
      setLocationResults(results)
      setLocationMessage(results.length ? 'Select a result to pin the shop location.' : 'No map results found. Try a more specific address.')
    } catch {
      setLocationMessage('Location search failed. Check internet connection and try again.')
    } finally {
      setSearchingLocation(false)
    }
  }

  const selectLocationResult = (result) => {
    setShopInfo((current) => ({
      ...current,
      address: result.display_name || current.address,
      latitude: Number(result.lat).toFixed(6),
      longitude: Number(result.lon).toFixed(6),
    }))
    setLocationMessage('Manual map pin selected. Review the preview before saving.')
  }

  const updateMapPoint = (latitude, longitude) => {
    setShopInfo((current) => ({
      ...current,
      latitude: Number(latitude).toFixed(6),
      longitude: Number(longitude).toFixed(6),
    }))
    setLocationMessage('Map pin updated. Save settings to store the new position.')
  }

  const saveChanges = () => {
    const nextErrors = {
      ...validateFieldsByRules(shopInfo, {
        shopName: { required: true, pattern: patterns.shopName, message: 'Invalid shop name' },
        ownerName: { required: true, pattern: patterns.alphanumericName, message: 'Invalid owner name' },
        phone: { required: true, pattern: patterns.phone, message: 'Invalid phone' },
        gst: { required: false, pattern: patterns.gst, message: 'Invalid GST' },
        address: { required: true, pattern: /^.{8,180}$/, message: 'Add full address' },
        pincode: { required: true, pattern: patterns.pincode, message: '6 digit pincode' },
        latitude: { required: true, pattern: patterns.decimal, min: -90, max: 90, message: 'Invalid latitude' },
        longitude: { required: true, pattern: patterns.decimal, min: -180, max: 180, message: 'Invalid longitude' },
      }),
      ...validateFieldsByRules(shopSettings, {
        serviceRadius: { required: true, pattern: patterns.positiveNumber, min: 1, max: 50, message: '1-50 km' },
        preparationTime: { required: true, pattern: patterns.positiveNumber, min: 1, max: 180, message: '1-180 min' },
      }),
    }

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
        ...shopInfo,
        location: {
          address: shopInfo.address,
          pincode: shopInfo.pincode,
          geoPoint: {
            latitude: Number(shopInfo.latitude || 0),
            longitude: Number(shopInfo.longitude || 0),
          },
          provider: 'browser-geolocation',
          updatedAt: new Date().toISOString(),
        },
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

      <main className="grid gap-4 px-4 pt-3 md:grid-cols-[1fr_0.85fr] md:px-6 md:pt-5">
        <section className="grid gap-4">
          <div className="rounded-[20px] border border-[#dde5da] bg-white p-3 shadow-[0_12px_28px_rgba(23,63,42,0.07)] sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[#173f2a] sm:h-12 sm:w-12 sm:rounded-[16px]">
                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Shop Settings</p>
                <h1 className="truncate text-[18px] font-black sm:text-[22px]">Manage shop profile and operations</h1>
                <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-[#647267] sm:text-[12px]">Structured for future Firebase shop documents and operational config.</p>
              </div>
            </div>
          </div>

          <FormPanel icon={UserRound} title="Shop info details" copy="Customer-facing identity, owner contact, and legal details.">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField error={fieldErrors.shopName} label="Shop name" value={shopInfo.shopName} onChange={(value) => updateInfo('shopName', value)} placeholder="Fresh Basket Mart" />
              <TextField error={fieldErrors.ownerName} label="Owner name" value={shopInfo.ownerName} onChange={(value) => updateInfo('ownerName', value)} placeholder="Owner full name" />
              <TextField error={fieldErrors.phone} label="Phone number" value={shopInfo.phone} onChange={(value) => updateInfo('phone', value)} placeholder="+91 98765 43210" inputMode="tel" />
              <TextField error={fieldErrors.gst} label="GST (optional)" value={shopInfo.gst} onChange={(value) => updateInfo('gst', value)} placeholder="22AAAAA0000A1Z5" />
            </div>
            <TextField error={fieldErrors.address} label="Shop location / address" value={shopInfo.address} onChange={(value) => updateInfo('address', value)} placeholder="Street, area, landmark" multiline />
            <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
              <TextField error={fieldErrors.pincode} label="Pincode" value={shopInfo.pincode} onChange={(value) => updateInfo('pincode', value)} placeholder="700001" inputMode="numeric" />
              <div className="rounded-[16px] border border-[#dde5da] bg-[#f8faf7] p-3">
                <div className="mb-2 flex items-center gap-2 text-[#173f2a]">
                  <MapPin className="h-4 w-4" />
                  <strong className="text-[12px] font-black">Location readiness</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e2e9df]">
                  <span className="block h-full rounded-full bg-[#173f2a]" style={{ width: `${completion}%` }}></span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-[#647267]">{completion}% profile details complete</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-[18px] border border-[#dde5da] bg-[#f8faf7] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[#173f2a]">
                    <Crosshair className="h-4 w-4" />
                    <strong className="text-[13px] font-black">Realtime map locator</strong>
                  </div>
                  <p className="text-[11px] font-semibold leading-relaxed text-[#647267]">Use current GPS or search an address, then select a result to pin latitude and longitude for Firebase GeoPoint.</p>
                </div>
                <button className="tap-lift shrink-0 rounded-[14px] bg-[#173f2a] px-3 py-2 text-[11px] font-black text-white active:bg-[#08783c]" type="button" onClick={locateShop} disabled={locating}>
                  {locating ? 'Locating...' : 'Use current'}
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]"
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') searchLocation()
                  }}
                  placeholder="Search area, landmark, street, city..."
                />
                <button className="tap-lift rounded-[15px] border border-[#dde5da] bg-white px-4 text-[12px] font-black text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={searchLocation} disabled={searchingLocation}>
                  {searchingLocation ? 'Searching...' : 'Search map'}
                </button>
              </div>
              {locationResults.length > 0 && (
                <div className="grid max-h-[220px] gap-2 overflow-auto rounded-[16px] border border-[#dde5da] bg-white p-2">
                  {locationResults.map((result) => (
                    <button
                      className="tap-lift flex items-start gap-2 rounded-[14px] border border-[#edf1ed] bg-[#fbfcf8] p-3 text-left active:border-[#173f2a] active:bg-[#edf5ed]"
                      key={`${result.place_id}-${result.lat}-${result.lon}`}
                      type="button"
                      onClick={() => selectLocationResult(result)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#173f2a]" />
                      <span className="min-w-0">
                        <strong className="block text-[12px] font-black text-[#111814]">{result.name || result.type || 'Map location'}</strong>
                        <small className="block text-[11px] font-semibold leading-snug text-[#647267]">{result.display_name}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <TextField error={fieldErrors.latitude} label="Latitude" value={shopInfo.latitude} onChange={(value) => updateInfo('latitude', value)} placeholder="22.572645" inputMode="decimal" />
                <TextField error={fieldErrors.longitude} label="Longitude" value={shopInfo.longitude} onChange={(value) => updateInfo('longitude', value)} placeholder="88.363892" inputMode="decimal" />
              </div>
              {locationMessage && <p className="rounded-[14px] border border-[#f0c56e] bg-[#fff6e9] px-3 py-2 text-[11px] font-bold text-[#9a6500]">{locationMessage}</p>}
              {hasCoordinates ? (
                <MapPicker latitude={shopInfo.latitude} longitude={shopInfo.longitude} onChange={updateMapPoint} />
              ) : (
                <div className="grid min-h-[160px] place-items-center rounded-[18px] border border-dashed border-[#b8c5bc] bg-white p-4 text-center">
                  <span>
                    <MapPin className="mx-auto mb-2 h-6 w-6 text-[#173f2a]" />
                    <strong className="block text-[13px] font-black">No coordinates captured</strong>
                    <small className="font-semibold text-[#647267]">Tap Locate or enter lat/long manually.</small>
                  </span>
                </div>
              )}
            </div>
          </FormPanel>

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
        </section>

        <aside className="grid gap-4 md:self-start">
          <div className="rounded-[20px] border border-[#dde5da] bg-white p-4 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="icon-chip grid h-12 w-12 place-items-center rounded-[16px] bg-[#fff6e9] text-[#9a6500]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Firebase-ready</p>
                <h2 className="text-[18px] font-black">Save structure</h2>
              </div>
            </div>
            <div className="grid gap-2 text-[12px] font-bold">
              <PreviewRow label="Document" value="shops/{shopId}" />
              <PreviewRow label="Profile fields" value="shopName, ownerName, phone, address" />
              <PreviewRow label="Location fields" value="location.geoPoint.latitude, location.geoPoint.longitude" />
              <PreviewRow label="Operational fields" value="settings.openingTime, deliveryStatus, shopStatus" />
              <PreviewRow label="Current state" value={shopSettings.shopStatus} />
            </div>
          </div>

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
        </aside>
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

function PreviewRow({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#f8faf7] p-3">
      <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
      <strong className="mt-1 block text-[#111814]">{value}</strong>
    </div>
  )
}
