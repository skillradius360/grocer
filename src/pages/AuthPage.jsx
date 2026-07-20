import { Field } from '../components/Field'
import { Icon } from '../components/Icon'
import nomadLogo from '../assets/nomad-logo.svg'

const authMethods = [
  {
    id: 'phone',
    title: 'Phone OTP',
    detail: 'Verify seller by mobile number',
    icon: 'phone',
  },
  {
    id: 'shopCode',
    title: 'Shop code',
    detail: 'Use a code shared by your store admin',
    icon: 'key',
  },
]

export function AuthPage({ authMode, errors, form, onAuthMode, onFieldChange, onContinue, onGoogleContinue, otpRequested }) {
  const isPhone = authMode === 'phone'

  return (
    <div className="ui-enter grid h-full max-h-dvh w-full overflow-hidden bg-[#fbfcf8] lg:grid-cols-[1.02fr_0.98fr]">
      <section className="hidden min-h-full flex-col justify-between bg-[#173f2a] px-10 py-10 text-[#fbfcf8] lg:flex xl:px-12">
        <div>
          <div className="icon-chip mb-7 h-[58px] w-[58px] overflow-hidden rounded-[18px] bg-white/12 shadow-[0_18px_42px_rgba(4,32,20,0.28)]">
            <img src={nomadLogo} alt="Nomad" className="h-full w-full object-cover" />
          </div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#d8eadf]">
            Seller Console
          </p>
          <h1 className="max-w-[460px] text-[40px] font-extrabold leading-[1.02] text-[#fbfcf8] xl:text-[46px]">
            Run your grocery shop from one clean place.
          </h1>
        </div>

        <div className="grid gap-3 text-sm font-bold text-[#d8eadf]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/12">
              <Icon name="shield" className="h-[18px] w-[18px]" />
            </span>
            Secure access for store owners and staff
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/12">
              <Icon name="orders" className="h-[18px] w-[18px]" />
            </span>
            Inventory, orders, and insights in one workspace
          </div>
        </div>
      </section>

      <section className="flex h-full min-h-0 items-center justify-center overflow-hidden px-5 py-5 sm:px-8 lg:min-h-full">
        <div className="w-full max-w-[430px]">
          <header className="mb-5 text-left lg:hidden">
            <div className="icon-chip soft-pulse mb-3 h-[50px] w-[50px] overflow-hidden rounded-[16px] bg-[#173f2a] shadow-[0_14px_34px_rgba(23,63,42,0.28)]">
              <img src={nomadLogo} alt="Nomad" className="h-full w-full object-cover" />
            </div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5b7567]">
              Seller Console
            </p>
            <h1 className="max-w-[330px] text-[27px] font-extrabold leading-[1.04] text-[#111814] sm:text-[34px]">
              Run your grocery shop from one clean place.
            </h1>
          </header>

          <div className="mb-6 hidden lg:block">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5b7567]">
              Welcome back
            </p>
            <h2 className="text-[28px] font-extrabold leading-tight text-[#111814]">
              Sign in to continue
            </h2>
          </div>

          <button
            className="tap-lift flex min-h-14 w-full items-center justify-center gap-3 rounded-[16px] border border-[#4285f4] bg-white px-4 text-[14px] font-black text-[#111814] shadow-[0_10px_24px_rgba(66,133,244,0.12)] hover:border-[#34a853] hover:bg-[#f8fbff] hover:shadow-[0_14px_28px_rgba(251,188,5,0.18)]"
            type="button"
            onClick={onGoogleContinue}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white shadow-[0_6px_14px_rgba(23,63,42,0.1)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
              </svg>
            </span>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#647267]">
            <span className="h-px flex-1 bg-[#dde5da]" />
            or use another method
            <span className="h-px flex-1 bg-[#dde5da]" />
          </div>

          <div className="rounded-[16px] border border-[#dde5da] bg-[#edf1ed] p-1.5 shadow-[0_10px_24px_rgba(23,63,42,0.06)]" role="tablist" aria-label="Authentication methods">
            <div className="grid grid-cols-2 gap-1">
              {authMethods.map((method) => (
                <button
                  className={`tap-lift flex min-h-11 items-center justify-center rounded-[13px] px-2 text-center text-[12px] font-black leading-tight ${
                    authMode === method.id
                      ? 'bg-white text-[#111814] shadow-[0_8px_18px_rgba(23,63,42,0.12)]'
                      : 'text-[#647267] active:bg-white active:text-[#173f2a]'
                  }`}
                  key={method.id}
                  type="button"
                  onClick={() => onAuthMode(method.id)}
                  role="tab"
                  aria-selected={authMode === method.id}
                >
                  {method.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-h-[168px] content-start gap-3.5 pt-4">
            {authMode === 'phone' && (
              <div className="ui-enter-delayed mx-auto grid w-full gap-3">
                <label className="grid gap-2">
                  <span className="text-[12px] font-black text-[#647267]">Mobile number</span>
                  <span className={`flex h-14 overflow-hidden rounded-[16px] border bg-white shadow-[0_10px_24px_rgba(23,63,42,0.05)] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${otpRequested ? 'bg-[#f8faf7] opacity-80' : ''} ${errors.phone ? 'border-[#d56b56]' : 'border-[#dde5da]'}`}>
                    <span className="grid w-[64px] place-items-center border-r border-[#e6ebe6] text-[15px] font-black text-[#647267]">+91</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-4 text-center text-[17px] font-bold tracking-[0.02em] text-[#111814] outline-none placeholder:text-[#9aa79d]"
                      value={form.phone}
                      onChange={onFieldChange('phone')}
                      placeholder="9876543210"
                      inputMode="tel"
                      maxLength={10}
                      pattern="[0-9]*"
                      readOnly={otpRequested}
                      aria-readonly={otpRequested}
                    />
                  </span>
                  {errors.phone && <span className="text-[11px] font-bold text-[#b63a25]">{errors.phone}</span>}
                </label>

                {otpRequested && (
                  <label className="ui-enter grid gap-2">
                    <span className="text-[12px] font-black text-[#647267]">OTP</span>
                    <input
                      className={`h-14 rounded-[16px] border bg-white px-4 text-center text-[18px] font-black tracking-[0.16em] text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${errors.otp ? 'border-[#d56b56]' : 'border-[#dde5da]'}`}
                      value={form.otp}
                      onChange={onFieldChange('otp')}
                      placeholder="000000"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]*"
                    />
                    {errors.otp && <span className="text-[11px] font-bold text-[#b63a25]">{errors.otp}</span>}
                  </label>
                )}
              </div>
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
            className={`tap-lift inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border-0 bg-[#173f2a] font-extrabold text-[#fbfcf8] shadow-[0_16px_30px_rgba(23,63,42,0.22)] hover:shadow-[0_20px_36px_rgba(23,63,42,0.28)] active:bg-[#08783c] ${isPhone ? 'mx-auto' : 'mt-1'}`}
            type="button"
            onClick={onContinue}
          >
            {isPhone && !otpRequested ? 'Send OTP' : 'Continue'}
            <Icon name="arrow" />
          </button>
        </div>
      </section>
    </div>
  )
}
