import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ReadyPage } from './pages/ReadyPage'
import { SellerDashboardPage } from './pages/SellerDashboardPage'
import { MenuProductsPage } from './pages/MenuProductsPage'
import { OffersPage } from './pages/OffersPage'
import { CustomersPage } from './pages/CustomersPage'
import { SettingsPage } from './pages/SettingsPage'
import { createSellerSession, loadSellerSession, saveSellerSession } from './lib/sellerStore'

const initialForm = {
  phone: '',
  otp: '',
  shopCode: '',
  shopName: '',
  ownerName: '',
  pincode: '',
  address: '',
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
    requiredFields: ['address', 'pincode'],
  },
  tax: {
    path: '/onboarding/tax',
    next: '/ready',
    previous: '/onboarding/location',
    eyebrow: 'Step 3 of 3',
    title: 'Add tax details',
    copy: 'GST is captured now so Firebase and backend validation can connect without reshaping the screen.',
    requiredFields: ['gst'],
  },
}

function App() {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState('phone')
  const [sellerSession, setSellerSession] = useState(loadSellerSession)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('simplifyliving:theme') || 'dark')
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...loadSellerSession().shop,
  }))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    saveSellerSession(sellerSession)
  }, [sellerSession])

  useEffect(() => {
    window.localStorage.setItem('simplifyliving:theme', theme)
  }, [theme])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateFields = (fields) => {
    const nextErrors = {}

    fields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = 'Required'
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const continueAuth = () => {
    const fieldsByMode = {
      google: [],
      phone: ['phone', 'otp'],
      shopCode: ['shopCode'],
    }

    if (validateFields(fieldsByMode[authMode])) {
      navigate('/onboarding/profile')
    }
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
    <main className={`${theme === 'dark' ? 'theme-dark-orange' : ''} min-h-svh bg-[#fbfcf8] text-[#111814] md:grid md:place-items-center md:bg-[linear-gradient(135deg,rgba(25,86,57,0.1),transparent_30%),linear-gradient(315deg,rgba(233,180,87,0.14),transparent_34%),#eef2ed] md:p-6`}>
      <section
        className="min-h-svh w-full bg-[#fbfcf8] md:min-h-[min(900px,calc(100svh-48px))] md:max-w-[960px] md:overflow-hidden md:rounded-[26px] md:border md:border-[#1f30270f] md:shadow-[0_24px_70px_rgba(22,37,29,0.14)] xl:max-w-[1180px]"
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
                  setErrors({})
                }}
                onFieldChange={updateField}
                onContinue={continueAuth}
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
                onContinue={() => continueStep('tax')}
              />
            }
          />
          <Route path="/ready" element={<ReadyPage shopName={sellerSession.shop.shopName || form.shopName} onOpenDashboard={() => navigate('/dashboard')} />} />
          <Route
            path="/dashboard"
            element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />}
          />
          <Route path="/orders" element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} activePage="Orders" theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/menu" element={<MenuProductsPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/customers" element={<CustomersPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/offers" element={<OffersPage sellerSession={sellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/analytics" element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} activePage="Analytics" theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/ai-insights" element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} activePage="Growth" theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/billing" element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} activePage="Billing" theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/settings" element={<SettingsPage sellerSession={sellerSession} setSellerSession={setSellerSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="/profile" element={<SellerDashboardPage sellerSession={sellerSession} setSellerSession={setSellerSession} activePage="Profile" theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </section>
    </main>
  )
}

export default App
