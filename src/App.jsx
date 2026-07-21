import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ReadyPage } from './pages/ReadyPage'
import { SellerDashboardPage } from './pages/SellerDashboardPage'
import { MenuProductsPage } from './pages/MenuProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { OffersPage } from './pages/OffersPage'
import { CustomersPage } from './pages/CustomersPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { BillingPage } from './pages/BillingPage'
import { AppFooter } from './components/AppFooter'
import { createSellerSession, defaultSellerSession, loadSellerSession, saveSellerSession } from './lib/sellerStore'
import { decimalOnly, digitsOnly, patterns, validateFieldsByRules } from './utils/validation'

const initialForm = {
  phone: '',
  otp: '',
  shopCode: '',
  shopName: '',
  ownerName: '',
  pincode: '',
  address: '',
  latitude: '',
  longitude: '',
  gst: '',
}

const steps = {
  profile: {
    path: '/onboarding/profile',
    next: '/onboarding/location',
    previous: '/auth',
    eyebrow: 'Step 1 of 3',
    title: 'Create your shop profile',
    copy: 'This becomes the operational identity for inventory, orders, and future payouts.',
    requiredFields: ['shopName', 'ownerName'],
  },
  location: {
    path: '/onboarding/location',
    next: '/onboarding/tax',
    previous: '/onboarding/profile',
    eyebrow: 'Step 2 of 3',
    title: 'Pin the delivery location',
    copy: 'A precise map pin keeps serviceability, delivery timing, and local discovery clean.',
    requiredFields: ['address', 'pincode', 'latitude', 'longitude'],
  },
  tax: {
    path: '/onboarding/tax',
    next: '/ready',
    previous: '/onboarding/location',
    eyebrow: 'Step 3 of 3',
    title: 'Add tax details',
    copy: 'GST is captured now so Firebase and backend validation can connect without reshaping the screen.',
    requiredFields: [],
  },
}

const validationRules = {
  phone: { required: true, pattern: /^[6-9][0-9]{9}$/, message: 'Enter valid 10 digit phone' },
  otp: { required: true, pattern: /^[0-9]{6}$/, message: 'Enter 6 digit OTP' },
  shopCode: { required: true, pattern: /^[A-Za-z0-9-]{4,24}$/, message: 'Invalid shop code' },
  shopName: { required: true, pattern: patterns.shopName, message: 'Invalid shop name' },
  ownerName: { required: true, pattern: patterns.alphanumericName, message: 'Invalid owner name' },
  address: { required: true, pattern: /^.{8,180}$/, message: 'Add full address' },
  pincode: { required: true, pattern: patterns.pincode, message: '6 digit pincode' },
  latitude: { required: true, pattern: patterns.decimal, min: -90, max: 90, message: 'Invalid latitude' },
  longitude: { required: true, pattern: patterns.decimal, min: -180, max: 180, message: 'Invalid longitude' },
  gst: { required: false, pattern: patterns.gst, message: 'Invalid GST' },
}

const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || 'https://accounts.google.com/'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const appShellRef = useRef(null)
  const isAuthRoute = location.pathname === '/auth'
  const hasFooter = ['/dashboard', '/orders', '/products', '/customers', '/offers', '/analytics', '/billing', '/settings', '/profile'].includes(location.pathname)
  const [authMode, setAuthMode] = useState('phone')
  const [sellerSession, setSellerSession] = useState(loadSellerSession)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('simplifyliving:theme') || 'light')
  const [otpRequested, setOtpRequested] = useState(false)
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...loadSellerSession().shop,
  }))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    saveSellerSession(sellerSession)
  }, [sellerSession])

  useEffect(() => {
    const logout = () => {
      setSellerSession(defaultSellerSession)
      setForm(initialForm)
      setOtpRequested(false)
      setErrors({})
      navigate('/auth')
    }

    window.addEventListener('simplifyliving:logout', logout)
    return () => window.removeEventListener('simplifyliving:logout', logout)
  }, [navigate])

  useEffect(() => {
    if (!hasFooter || !appShellRef.current) return undefined

    const updateFooterFrame = () => {
      const rect = appShellRef.current.getBoundingClientRect()
      document.documentElement.style.setProperty('--seller-footer-left', `${rect.left}px`)
      document.documentElement.style.setProperty('--seller-footer-width', `${rect.width}px`)
    }

    updateFooterFrame()
    window.addEventListener('resize', updateFooterFrame)
    window.visualViewport?.addEventListener('resize', updateFooterFrame)
    window.visualViewport?.addEventListener('scroll', updateFooterFrame)

    return () => {
      window.removeEventListener('resize', updateFooterFrame)
      window.visualViewport?.removeEventListener('resize', updateFooterFrame)
      window.visualViewport?.removeEventListener('scroll', updateFooterFrame)
      document.documentElement.style.removeProperty('--seller-footer-left')
      document.documentElement.style.removeProperty('--seller-footer-width')
    }
  }, [hasFooter, location.pathname])

  useEffect(() => {
    window.localStorage.setItem('simplifyliving:theme', theme)
    document.body.classList.toggle('theme-dark-orange', theme === 'dark')

    return () => {
      document.body.classList.remove('theme-dark-orange')
    }
  }, [theme])

  const updateField = (field) => (event) => {
    const rawValue = event.target.value
    const value = {
      phone: digitsOnly(rawValue, 10),
      otp: digitsOnly(rawValue, 6),
      pincode: digitsOnly(rawValue, 6),
      latitude: decimalOnly(rawValue, 12),
      longitude: decimalOnly(rawValue, 12),
      gst: rawValue.toUpperCase().replace(/\s/g, '').slice(0, 15),
    }[field] ?? rawValue

    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const updateFieldValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateFields = (fields) => {
    const nextErrors = validateFieldsByRules(form, validationRules, fields)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const continueAuth = () => {
    const fieldsByMode = {
      google: [],
      phone: ['phone', 'otp'],
      shopCode: ['shopCode'],
    }

    if (authMode === 'phone' && !otpRequested) {
      if (validateFields(['phone'])) {
        setOtpRequested(true)
      }
      return
    }

    if (validateFields(fieldsByMode[authMode])) {
      navigate('/onboarding/profile')
    }
  }

  const continueWithGoogle = () => {
    window.location.assign(googleAuthUrl)
  }

  const continueStep = (stepKey) => {
    const step = steps[stepKey]

    if (validateFields(step.requiredFields)) {
      if (stepKey === 'tax') {
        setSellerSession(createSellerSession(form, authMode))
      }
      navigate(step.next)
    }
  }

  return (
    <main className={`${theme === 'dark' ? 'theme-dark-orange' : ''} ${isAuthRoute ? 'fixed inset-0 h-dvh overflow-hidden' : 'min-h-svh'} bg-[#fbfcf8] text-[#111814] md:grid md:place-items-center md:bg-[linear-gradient(135deg,rgba(15,138,75,0.18),transparent_34%),linear-gradient(315deg,rgba(255,176,32,0.18),transparent_30%),linear-gradient(180deg,#f6fbf7,#edf8f0)] md:p-6`}>
      <section
        ref={appShellRef}
        className={`relative ${isAuthRoute ? 'h-full overflow-hidden md:h-[calc(100dvh-48px)] md:min-h-0' : 'min-h-svh md:min-h-[min(900px,calc(100svh-48px))]'} ${hasFooter ? 'seller-app-shell-with-footer' : ''} w-full bg-[#fbfcf8] md:max-w-[960px] md:overflow-hidden md:rounded-[26px] md:border md:border-[#1f30270f] md:shadow-[0_24px_70px_rgba(22,37,29,0.14)] xl:max-w-[1180px]`}
        aria-label="Seller app"
      >
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route
            path="/auth"
            element={
              <AuthPage
                authMode={authMode}
                errors={errors}
                form={form}
                onAuthMode={(mode) => {
                  setAuthMode(mode)
                  setOtpRequested(false)
                  setErrors({})
                }}
                onFieldChange={updateField}
                onContinue={continueAuth}
                onGoogleContinue={continueWithGoogle}
                otpRequested={otpRequested}
              />
            }
          />
          <Route
            path="/onboarding/profile"
            element={
              <OnboardingPage
                errors={errors}
                form={form}
                stepIndex={0}
                step={steps.profile}
                onBack={() => navigate(steps.profile.previous)}
                onFieldChange={updateField}
                onFieldValue={updateFieldValue}
                onContinue={() => continueStep('profile')}
              />
            }
          />
          <Route
            path="/onboarding/location"
            element={
              <OnboardingPage
                errors={errors}
                form={form}
                stepIndex={1}
                step={steps.location}
                onBack={() => navigate(steps.location.previous)}
                onFieldChange={updateField}
                onFieldValue={updateFieldValue}
                onContinue={() => continueStep('location')}
              />
            }
          />
          <Route
            path="/onboarding/tax"
            element={
              <OnboardingPage
                errors={errors}
                form={form}
                stepIndex={2}
                step={steps.tax}
                onBack={() => navigate(steps.tax.previous)}
                onFieldChange={updateField}
                onFieldValue={updateFieldValue}
                onContinue={() => continueStep('tax')}
              />
            }
          />
          <Route path="/ready" element={<ReadyPage shopName={sellerSession.shop.shopName || form.shopName} onOpenDashboard={() => navigate('/dashboard')} />} />
          <Route
            path="/dashboard"
            element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />}
          />
          <Route path="/orders" element={<OrdersPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/products" element={<MenuProductsPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/menu" element={<Navigate to="/products" replace />} />
          <Route path="/customers" element={<CustomersPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/offers" element={<OffersPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/analytics" element={<AnalyticsPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/billing" element={<BillingPage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/settings" element={<SettingsPage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/profile" element={<ProfilePage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
        {hasFooter && <AppFooter />}
      </section>
    </main>
  )
}

export default App
