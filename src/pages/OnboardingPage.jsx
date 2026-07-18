import { Field } from '../components/Field'
import { Icon } from '../components/Icon'

export function OnboardingPage({
  errors,
  form,
  step,
  stepIndex,
  onBack,
  onFieldChange,
  onContinue,
}) {
  const completion = ((stepIndex + 1) / 3) * 100

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
            <div className="relative grid min-h-[178px] place-items-center overflow-hidden rounded-[22px] border border-[#dde5da] bg-[#dfe9db]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.48)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.48)_1px,transparent_1px),linear-gradient(135deg,rgba(23,63,42,0.12),rgba(189,125,43,0.14))] bg-[length:34px_34px,34px_34px,auto]"></div>
              <div className="icon-chip soft-pulse relative grid h-[54px] w-[54px] place-items-center rounded-[18px] bg-[#173f2a] text-white shadow-[0_16px_28px_rgba(23,63,42,0.24)]">
                <Icon name="pin" />
              </div>
              <button
                className="tap-lift absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-1.5 rounded-[14px] border border-[#173f2a24] bg-white/90 px-3 text-xs font-extrabold text-[#173f2a] active:bg-[#dff8e8]"
                type="button"
              >
                <Icon name="route" className="h-4 w-4" />
                Use current location
              </button>
            </div>
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
