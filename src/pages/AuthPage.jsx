import { Field } from '../components/Field'
import { Icon } from '../components/Icon'

const authMethods = [
  {
    id: 'google',
    title: 'Continue with Google',
    detail: 'Best for owners using Gmail Workspace',
    icon: 'G',
    activeClass: 'border-[#173f2a] bg-[#edf5ed] shadow-[0_12px_28px_rgba(23,63,42,0.1)]',
    iconClass: 'bg-white text-[#173f2a]',
  },
  {
    id: 'phone',
    title: 'Phone OTP',
    detail: 'Verify seller by mobile number',
    icon: 'phone',
    activeClass: 'border-[#173f2a] bg-[#edf5ed] shadow-[0_12px_28px_rgba(23,63,42,0.1)]',
    iconClass: 'bg-[#dff8e8] text-[#08783c]',
  },
  {
    id: 'shopCode',
    title: 'Shop code',
    detail: 'Use a code shared by your store admin',
    icon: 'key',
    activeClass: 'border-[#e0aa4a] bg-[#fff6e9] shadow-[0_12px_28px_rgba(189,125,43,0.12)]',
    iconClass: 'bg-[#fff0d3] text-[#9a6500]',
  },
]

export function AuthPage({ authMode, errors, form, onAuthMode, onFieldChange, onContinue }) {
  return (
    <div className="ui-enter mx-auto flex min-h-svh w-full max-w-[760px] flex-col px-5 py-6 sm:min-h-[820px] sm:px-6 md:min-h-[900px] md:justify-center">
      <header className="pt-3 sm:pt-7">
        <div className="icon-chip soft-pulse mb-5 grid h-[58px] w-[58px] place-items-center rounded-[18px] bg-[#173f2a] text-[#f8fbf4] shadow-[0_14px_34px_rgba(23,63,42,0.28)]">
          <Icon name="store" />
        </div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5b7567]">
          Seller Console
        </p>
        <h1 className="max-w-[330px] text-[31px] font-extrabold leading-[1.04] text-[#111814] sm:text-[34px]">
          Run your grocery shop from one clean place.
        </h1>
      </header>

      <div className="my-7 grid gap-2.5" role="tablist" aria-label="Authentication methods">
        {authMethods.map((method) => (
          <button
            className={`tap-lift flex w-full items-center gap-3 rounded-[18px] border bg-white p-3 text-left text-[#25342b] ${
              authMode === method.id
                ? method.activeClass
                : 'border-[#e0e7dd] active:border-[#b8c8bc] active:bg-[#f8faf7]'
            }`}
            key={method.id}
            type="button"
            onClick={() => onAuthMode(method.id)}
            role="tab"
            aria-selected={authMode === method.id}
          >
            <span className={`icon-chip grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[15px] ${authMode === method.id ? method.iconClass : 'bg-[#edf5ed] text-[#173f2a]'}`}>
              <Icon name={method.icon} />
            </span>
            <span>
              <strong className="block text-sm leading-tight text-[#121812]">{method.title}</strong>
              <small className="text-[13px] leading-snug text-[#647267]">{method.detail}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto grid gap-3.5">
        {authMode === 'google' && (
          <div className="ui-enter-delayed flex items-center gap-3 rounded-[18px] border border-[#dde5da] bg-white p-3.5">
            <span className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#edf5ed] text-lg font-black text-[#173f2a]">
              G
            </span>
            <div>
              <strong className="block text-sm leading-tight text-[#121812]">Google sign-in placeholder</strong>
              <p className="text-[13px] leading-snug text-[#647267]">
                Dummy pass for now. Firebase Auth can connect here later.
              </p>
            </div>
          </div>
        )}

        {authMode === 'phone' && (
          <>
            <Field
              error={errors.phone}
              label="Phone number"
              value={form.phone}
              onChange={onFieldChange('phone')}
              placeholder="+91 98765 43210"
              inputMode="tel"
              icon="phone"
            />
            <Field
              error={errors.otp}
              label="OTP"
              value={form.otp}
              onChange={onFieldChange('otp')}
              placeholder="Type anything for now"
              inputMode="numeric"
              icon="shield"
            />
          </>
        )}

        {authMode === 'shopCode' && (
          <Field
            error={errors.shopCode}
            label="Shop code"
            value={form.shopCode}
            onChange={onFieldChange('shopCode')}
            placeholder="SLR-2048"
            icon="key"
          />
        )}
      </div>

      <button
        className="tap-lift mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[18px] border-0 bg-[#173f2a] font-extrabold text-[#fbfcf8] shadow-[0_16px_30px_rgba(23,63,42,0.22)] hover:shadow-[0_20px_36px_rgba(23,63,42,0.28)] active:bg-[#08783c]"
        type="button"
        onClick={onContinue}
      >
        Continue
        <Icon name="arrow" />
      </button>
    </div>
  )
}
