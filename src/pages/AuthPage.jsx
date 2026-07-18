import { Field } from '../components/Field'
import { Icon } from '../components/Icon'

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
          <div className="icon-chip mb-7 grid h-[58px] w-[58px] place-items-center rounded-[18px] bg-white/12 text-[#fbfcf8] shadow-[0_18px_42px_rgba(4,32,20,0.28)]">
            <Icon name="store" />
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
            <div className="icon-chip soft-pulse mb-3 grid h-[50px] w-[50px] place-items-center rounded-[16px] bg-[#173f2a] text-[#f8fbf4] shadow-[0_14px_34px_rgba(23,63,42,0.28)]">
              <Icon name="store" />
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
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[15px] font-black text-[#173f2a] shadow-[0_6px_14px_rgba(23,63,42,0.1)]">G</span>
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
                  <span className={`flex h-14 overflow-hidden rounded-[16px] border bg-white shadow-[0_10px_24px_rgba(23,63,42,0.05)] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${errors.phone ? 'border-[#d56b56]' : 'border-[#dde5da]'}`}>
                    <span className="grid w-[64px] place-items-center border-r border-[#e6ebe6] text-[15px] font-black text-[#647267]">+91</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-4 text-center text-[17px] font-bold tracking-[0.02em] text-[#111814] outline-none placeholder:text-[#9aa79d]"
                      value={form.phone}
                      onChange={onFieldChange('phone')}
                      placeholder="9876543210"
                      inputMode="tel"
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
                      placeholder="0000"
                      inputMode="numeric"
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
