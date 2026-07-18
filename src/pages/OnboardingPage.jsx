import { useState } from 'react'
import { Field } from '../components/Field'
import { Icon } from '../components/Icon'
import { MapPicker } from '../components/MapPicker'

export function OnboardingPage({
  errors,
  form,
  step,
  stepIndex,
  onBack,
  onFieldChange,
  onFieldValue,
  onContinue,
}) {
  const completion = ((stepIndex + 1) / 3) * 100
  const [locationMessage, setLocationMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)

  const updateLocationPoint = (latitude, longitude, message = 'Map pin updated. Continue when the address looks correct.') => {
    onFieldValue('latitude', Number(latitude).toFixed(6))
    onFieldValue('longitude', Number(longitude).toFixed(6))
    setLocationMessage(message)
  }

  const locateShop = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported in this browser.')
      return
    }

    setLocating(true)
    setLocationMessage('Locating shop position...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationPoint(position.coords.latitude, position.coords.longitude, 'Location captured. Review the map pin before continuing.')
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
    onFieldValue('address', result.display_name || form.address)
    updateLocationPoint(result.lat, result.lon, 'Map result selected. Review the pin before continuing.')
  }

  return (
    <div className="ui-enter mx-auto flex min-h-svh w-full max-w-[760px] flex-col px-5 py-5 sm:min-h-[820px] sm:px-6 md:min-h-[900px] md:py-8">
      <header className="flex items-center justify-between text-sm font-extrabold text-[#26342b]">
        <button
          className="tap-lift grid h-[42px] w-[42px] place-items-center rounded-2xl border border-[#dde5da] bg-white text-[#26342b] active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]"
          type="button"
          onClick={onBack}
          aria-label="Go back"
        >
          <Icon name="back" />
        </button>
        <span>Shop setup</span>
        <button
          className="tap-lift icon-chip grid h-[42px] w-[42px] place-items-center rounded-2xl border border-[#f3dec1] bg-[#fff6e9] text-[#bd7d2b] active:border-[#e0aa4a] active:bg-[#ffe8b8]"
          type="button"
          aria-label="Help"
        >
          <Icon name="spark" />
        </button>
      </header>

      <div className="my-6 h-1.5 overflow-hidden rounded-full bg-[#e2e9df]" aria-label={`${Math.round(completion)} percent complete`}>
        <span
          className="progress-glow block h-full rounded-full bg-[#173f2a] transition-[width]"
          style={{ width: `${completion}%` }}
        ></span>
      </div>

      <section className="mb-6 grid gap-2.5">
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#5b7567]">{step.eyebrow}</p>
        <h1 className="text-[27px] font-extrabold leading-[1.08] text-[#111814] sm:text-[29px]">
          {step.title}
        </h1>
        <p className="text-[13px] leading-relaxed text-[#647267]">{step.copy}</p>
      </section>

      <section className="grid gap-3.5">
        {stepIndex === 0 && (
          <>
            <Field
              error={errors.shopName}
              label="Shop name"
              value={form.shopName}
              onChange={onFieldChange('shopName')}
              placeholder="Fresh Basket Mart"
              icon="store"
            />
            <Field
              error={errors.ownerName}
              label="Owner name"
              value={form.ownerName}
              onChange={onFieldChange('ownerName')}
              placeholder="Dipayan Chowdhury"
              icon="user"
            />
          </>
        )}

        {stepIndex === 1 && (
          <>
            <Field
              error={errors.address}
              label="Address"
              value={form.address}
              onChange={onFieldChange('address')}
              placeholder="Street, area, landmark"
              icon="pin"
            />
            <Field
              error={errors.pincode}
              label="Pincode"
              value={form.pincode}
              onChange={onFieldChange('pincode')}
              placeholder="700001"
              inputMode="numeric"
              icon="hash"
            />
            <div className="grid gap-3 rounded-[20px] border border-[#dde5da] bg-white p-3.5 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[#173f2a]">
                    <Icon name="route" className="h-4 w-4" />
                    <strong className="text-[13px] font-black">Map location selector</strong>
                  </div>
                  <p className="text-[11px] font-semibold leading-relaxed text-[#647267]">Use GPS or search an address, then drag or tap the map to set the shop pin.</p>
                </div>
                <button
                  className="tap-lift shrink-0 rounded-[14px] bg-[#173f2a] px-3 py-2 text-[11px] font-black text-white active:bg-[#08783c]"
                  type="button"
                  onClick={locateShop}
                  disabled={locating}
                >
                  {locating ? 'Locating...' : 'Use current'}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
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
                  {searchingLocation ? 'Searching...' : 'Search'}
                </button>
              </div>

              {locationResults.length > 0 && (
                <div className="grid max-h-[190px] gap-2 overflow-auto rounded-[16px] border border-[#dde5da] bg-[#fbfcf8] p-2">
                  {locationResults.map((result) => (
                    <button
                      className="tap-lift flex items-start gap-2 rounded-[14px] border border-[#edf1ed] bg-white p-3 text-left active:border-[#173f2a] active:bg-[#edf5ed]"
                      key={`${result.place_id}-${result.lat}-${result.lon}`}
                      type="button"
                      onClick={() => selectLocationResult(result)}
                    >
                      <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[#173f2a]" />
                      <span className="min-w-0">
                        <strong className="block text-[12px] font-black text-[#111814]">{result.name || result.type || 'Map location'}</strong>
                        <small className="block text-[11px] font-semibold leading-snug text-[#647267]">{result.display_name}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  error={errors.latitude}
                  label="Latitude"
                  value={form.latitude}
                  onChange={onFieldChange('latitude')}
                  placeholder="22.572645"
                  inputMode="decimal"
                  icon="pin"
                />
                <Field
                  error={errors.longitude}
                  label="Longitude"
                  value={form.longitude}
                  onChange={onFieldChange('longitude')}
                  placeholder="88.363892"
                  inputMode="decimal"
                  icon="pin"
                />
              </div>

              {locationMessage && <p className="rounded-[14px] border border-[#f0c56e] bg-[#fff6e9] px-3 py-2 text-[11px] font-bold text-[#9a6500]">{locationMessage}</p>}
              {form.latitude && form.longitude ? (
                <MapPicker latitude={form.latitude} longitude={form.longitude} onChange={updateLocationPoint} />
              ) : (
                <div className="grid min-h-[160px] place-items-center rounded-[18px] border border-dashed border-[#b8c5bc] bg-[#f8faf7] p-4 text-center">
                  <span>
                    <span className="icon-chip mx-auto mb-2 grid h-11 w-11 place-items-center rounded-[15px] bg-[#edf5ed] text-[#173f2a]">
                      <Icon name="pin" />
                    </span>
                    <strong className="block text-[13px] font-black">No coordinates captured</strong>
                    <small className="font-semibold text-[#647267]">Use current location, search, or enter latitude and longitude.</small>
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {stepIndex === 2 && (
          <>
            <Field
              error={errors.gst}
              label="GST number"
              value={form.gst}
              onChange={onFieldChange('gst')}
              placeholder="22AAAAA0000A1Z5"
              icon="receipt"
            />
            <div className="rounded-[18px] border border-[#dde5da] bg-white p-3.5">
              <div className="flex items-center gap-3">
                <span className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#edf5ed] text-[#173f2a]">
                  <Icon name="box" />
                </span>
                <div>
                  <strong className="block text-sm leading-tight text-[#121812]">Products come next</strong>
                  <p className="text-[13px] leading-snug text-[#647267]">
                    Categories, subcategories, variants, and master items stay after onboarding.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <button
        className="tap-lift mt-auto inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[18px] border-0 bg-[#173f2a] font-extrabold text-[#fbfcf8] shadow-[0_16px_30px_rgba(23,63,42,0.22)] hover:shadow-[0_20px_36px_rgba(23,63,42,0.28)] active:bg-[#08783c]"
        type="button"
        onClick={onContinue}
      >
        {stepIndex === 2 ? 'Create shop' : 'Continue setup'}
        <Icon name="arrow" />
      </button>
    </div>
  )
}
