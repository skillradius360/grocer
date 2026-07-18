import { useEffect, useMemo, useState } from 'react'
import {
  BadgePercent,
  Boxes,
  Check,
  ChevronRight,
  Edit3,
  Gift,
  Layers3,
  Plus,
  Sparkles,
  Tag,
  Target,
  Trash2,
  Users,
  Wand2,
  X,
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { AppHeader } from '../components/AppHeader'
import { getSellerOffers, saveSellerOffers, seededOffers } from '../services/offerService'
import { decimalOnly, digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

const defaultFilters = {
  search: '',
  category: 'all',
  subcategory: 'all',
  type: 'all',
  availability: 'all',
  stock: 'all',
  sort: 'newest',
  diet: 'all',
}

const offerTypes = [
  { id: 'bogo', title: 'Buy 1 Get 1', copy: 'Free item after matching purchase', icon: Gift, tone: 'green' },
  { id: 'percent', title: 'Percent Off', copy: 'Flat percentage discount', icon: BadgePercent, tone: 'amber' },
  { id: 'bundle', title: 'Combo Saver', copy: 'Discount on selected group', icon: Boxes, tone: 'violet' },
  { id: 'freebie', title: 'Free Add-on', copy: 'Gift item after cart rule', icon: Sparkles, tone: 'rose' },
]

const audienceTypes = [
  { id: 'all', title: 'All customers', copy: 'Visible to every buyer', icon: Users, tone: 'green' },
  { id: 'new', title: 'New customers', copy: 'First order or first visit', icon: Sparkles, tone: 'amber' },
  { id: 'regular', title: 'Regular buyers', copy: 'Frequent repeat customers', icon: Target, tone: 'violet' },
  { id: 'inactive', title: 'Win-back', copy: 'Customers inactive recently', icon: Wand2, tone: 'rose' },
]

const toneClasses = {
  green: 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]',
  amber: 'border-[#f0c56e] bg-[#fff6e9] text-[#9a6500]',
  violet: 'border-[#c7b8ff] bg-[#f1edff] text-[#5d43bd]',
  rose: 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
}

const scopeLabels = {
  products: 'Selected Products',
  categories: 'Categories',
  subcategories: 'Subcategories',
}

const defaultOfferForm = {
  title: '',
  description: '',
  offerType: 'bogo',
  active: true,
  scope: 'products',
  productIds: [],
  categoryIds: [],
  subcategories: [],
  buyQty: 1,
  getQty: 1,
  discountValue: 10,
  minCartValue: 199,
  audience: 'all',
  usageLimit: 'once',
  badgeText: 'Limited offer',
  theme: 'green',
}

function createOfferSummary(form, products, categories) {
  const productNames = products
    .filter((product) => form.productIds.includes(product.id))
    .map((product) => product.master.name)

  const categoryNames = categories
    .filter((category) => form.categoryIds.includes(category.id))
    .map((category) => category.name)

  const scopeCount = {
    products: form.productIds.length,
    categories: form.categoryIds.length,
    subcategories: form.subcategories.length,
  }[form.scope]

  return {
    title: form.title || 'Untitled offer',
    scope: scopeCount ? `${scopeCount} ${scopeLabels[form.scope].toLowerCase()}` : 'No scope selected',
    targets: form.scope === 'products' ? productNames : form.scope === 'categories' ? categoryNames : form.subcategories,
  }
}

export function OffersPage({ sellerSession, theme, onToggleTheme }) {
  const { categories, loading, products } = useProducts(defaultFilters)
  const [activeOfferId, setActiveOfferId] = useState('of-1')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingOfferId, setEditingOfferId] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [offers, setOffers] = useState(seededOffers)
  const [form, setForm] = useState(defaultOfferForm)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    let active = true

    getSellerOffers().then((nextOffers) => {
      if (active) {
        setOffers(nextOffers)
        setActiveOfferId(nextOffers.find((offer) => offer.status === 'Active')?.id || nextOffers[0]?.id || '')
      }
    })

    return () => {
      active = false
    }
  }, [])

  const replaceOffers = (updater) => {
    setOffers((current) => {
      const nextOffers = typeof updater === 'function' ? updater(current) : updater
      saveSellerOffers(nextOffers)
      return nextOffers
    })
  }

  const subcategories = useMemo(
    () => categories.flatMap((category) => category.subcategories.map((name) => `${category.name} / ${name}`)),
    [categories],
  )

  const selectedType = offerTypes.find((item) => item.id === form.offerType) || offerTypes[0]
  const selectedAudience = audienceTypes.find((item) => item.id === form.audience) || audienceTypes[0]
  const summary = createOfferSummary(form, products, categories)

  const update = (field, value) => {
    const numericFields = ['buyQty', 'getQty', 'discountValue', 'minCartValue']
    const nextValue = numericFields.includes(field) ? decimalOnly(value, 8) : value
    setForm((current) => ({ ...current, [field]: nextValue }))
    setFormErrors((current) => ({ ...current, [field]: '' }))
  }
  const toggleArrayValue = (field, value) => {
    setForm((current) => {
      const exists = current[field].includes(value)
      return {
        ...current,
        [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value],
      }
    })
  }

  const resetForm = () => {
    setForm(defaultOfferForm)
    setStepIndex(0)
    setEditingOfferId('')
  }

  const openNewOffer = () => {
    resetForm()
    setPendingDeleteId('')
    setPanelOpen(true)
  }

  const openEditOffer = (offer) => {
    setForm({
      ...defaultOfferForm,
      ...offer.formData,
      title: offer.formData?.title || offer.title,
      active: offer.status === 'Active',
      theme: offer.formData?.theme || offer.accent,
    })
    setEditingOfferId(offer.id)
    setPendingDeleteId('')
    setStepIndex(0)
    setPanelOpen(true)
  }

  const saveOffer = () => {
    const nextErrors = validateFieldsByRules(form, {
      title: { required: true, pattern: /^.{3,80}$/, message: 'Min 3 chars' },
      buyQty: { required: true, pattern: patterns.positiveNumber, min: 1, message: 'Min 1' },
      getQty: { required: form.offerType !== 'percent', pattern: patterns.positiveNumber, min: 1, message: 'Min 1' },
      discountValue: { required: ['percent', 'bundle'].includes(form.offerType), pattern: patterns.positiveNumber, min: 1, max: 100, message: '1-100%' },
      minCartValue: { required: true, pattern: patterns.positiveNumber, min: 0, message: 'Invalid amount' },
      badgeText: { required: true, pattern: /^.{2,32}$/, message: '2-32 chars' },
    })

    if (form.scope === 'products' && form.productIds.length === 0) nextErrors.scope = 'Select products'
    if (form.scope === 'categories' && form.categoryIds.length === 0) nextErrors.scope = 'Select categories'
    if (form.scope === 'subcategories' && form.subcategories.length === 0) nextErrors.scope = 'Select subcategories'

    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const nextOffer = {
      id: editingOfferId || `of-${Date.now()}`,
      title: form.title || 'Untitled offer',
      type: selectedType.title,
      audience: selectedAudience.title,
      scope: summary.scope,
      status: form.active ? 'Active' : 'Draft',
      accent: form.theme || selectedType.tone,
      source: 'Seller',
      formData: { ...form },
    }
    replaceOffers((current) => (
      editingOfferId
        ? current.map((offer) => (offer.id === editingOfferId ? nextOffer : offer))
        : [nextOffer, ...current]
    ))
    setActiveOfferId(nextOffer.id)
    setPanelOpen(false)
    resetForm()
  }

  const deleteOffer = (offerId) => {
    replaceOffers((current) => {
      const nextOffers = current.filter((offer) => offer.id !== offerId)
      if (activeOfferId === offerId) {
        setActiveOfferId(nextOffers[0]?.id || '')
      }
      return nextOffers
    })
    setPendingDeleteId('')
  }

  const steps = ['Basics', 'Scope', 'Rules', 'Audience', 'Visual']
  const activeOffer = offers.find((offer) => offer.id === activeOfferId) || offers[0]

  return (
    <div className="ui-enter min-h-svh bg-[#f4f7f3] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Offers" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <section className="rounded-[18px] border border-[#d8e5d7] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
          <div className="flex items-center gap-3">
              <span className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#edf5ed] text-[#173f2a]">
                <Tag className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Offer Studio</p>
                <h2 className="truncate text-[17px] font-black leading-tight text-[#111814]">Build targeted seller offers</h2>
                <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-[#647267]">
                  Products, rules, audience, and preview in one guided flow.
                </p>
              </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Metric icon={Gift} value={offers.length} label="Offers" tone="green" />
          <Metric icon={Target} value={offers.filter((offer) => offer.status === 'Active').length} label="Active" tone="amber" />
          <Metric icon={Users} value="4" label="Audiences" tone="violet" />
        </section>

        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Live offers</h2>
            <button className="tap-lift rounded-[12px] border border-[#dde5da] bg-white px-3 py-2 text-[11px] font-black active:bg-[#edf5ed]" type="button" onClick={openNewOffer}>New offer</button>
          </div>
          {offers.map((offer) => (
            <button
              className={`tap-lift flex items-center gap-3 rounded-[18px] border bg-white p-3 text-left shadow-[0_10px_24px_rgba(23,63,42,0.06)] ${activeOfferId === offer.id ? toneClasses[offer.accent] : 'border-[#dde5da] active:bg-[#f8faf7]'}`}
              key={offer.id}
              type="button"
              onClick={() => setActiveOfferId(offer.id)}
            >
              <span className={`icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-[15px] ${toneClasses[offer.accent]}`}>
                <BadgePercent className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[14px] font-black text-[#111814]">{offer.title}</strong>
                <small className="block truncate text-[11px] font-bold text-[#647267]">{offer.type} · {offer.scope}</small>
              </span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${offer.status === 'Active' ? 'bg-[#dff8e8] text-[#08783c]' : 'bg-[#fff6e9] text-[#9a6500]'}`}>{offer.status}</span>
            </button>
          ))}
        </section>

        {activeOffer && (
          <section className="rounded-[20px] border border-[#dde5da] bg-white p-4 shadow-[0_12px_28px_rgba(23,63,42,0.07)]">
            <div className="mb-3 flex items-center gap-3">
              <span className={`icon-chip grid h-12 w-12 place-items-center rounded-[16px] ${toneClasses[activeOffer.accent]}`}>
                <Layers3 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Selected offer</p>
                <h3 className="text-[18px] font-black">{activeOffer.title}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <InfoPill label="Type" value={activeOffer.type} />
              <InfoPill label="Audience" value={activeOffer.audience} />
              <InfoPill label="Scope" value={activeOffer.scope} />
              <InfoPill label="Status" value={activeOffer.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#dde5da] bg-white text-[12px] font-black text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={() => openEditOffer(activeOffer)}>
                <Edit3 className="h-4 w-4" />
                Edit offer
              </button>
              {pendingDeleteId === activeOffer.id ? (
                <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#b63a25] text-[12px] font-black text-white active:bg-[#8f2d1d]" type="button" onClick={() => deleteOffer(activeOffer.id)}>
                  <Trash2 className="h-4 w-4" />
                  Confirm delete
                </button>
              ) : (
                <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#efafa3] bg-white text-[12px] font-black text-[#b63a25] active:bg-[#fff2ef]" type="button" onClick={() => setPendingDeleteId(activeOffer.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete offer
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {panelOpen && (
        <OfferFormPanel
          categories={categories}
          form={form}
          formErrors={formErrors}
          loading={loading}
          offerTypes={offerTypes}
          products={products}
          selectedAudience={selectedAudience}
          selectedType={selectedType}
          setPanelOpen={setPanelOpen}
          setStepIndex={setStepIndex}
          stepIndex={stepIndex}
          steps={steps}
          subcategories={subcategories}
          summary={summary}
          toggleArrayValue={toggleArrayValue}
          update={update}
          onSave={saveOffer}
          editing={Boolean(editingOfferId)}
        />
      )}
    </div>
  )
}

function Metric({ icon: Icon, value, label, tone }) {
  return (
    <div className="tap-lift rounded-[18px] border border-[#dde5da] bg-white p-3 text-center shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
      <span className={`icon-chip mx-auto mb-2 grid h-9 w-9 place-items-center rounded-[13px] ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <strong className="block text-[20px] font-black leading-none">{value}</strong>
      <span className="text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
    </div>
  )
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#f8faf7] p-3">
      <span className="block text-[9px] font-black uppercase tracking-[0.08em] text-[#647267]">{label}</span>
      <strong className="mt-1 block leading-tight text-[#111814]">{value}</strong>
    </div>
  )
}

function OfferFormPanel({
  categories,
  editing,
  form,
  formErrors,
  loading,
  offerTypes,
  products,
  selectedAudience,
  selectedType,
  setPanelOpen,
  setStepIndex,
  stepIndex,
  steps,
  subcategories,
  summary,
  toggleArrayValue,
  update,
  onSave,
}) {
  const SelectedTypeIcon = selectedType.icon
  const canSave = form.title.trim() && (
    form.scope === 'products'
      ? form.productIds.length
      : form.scope === 'categories'
        ? form.categoryIds.length
        : form.subcategories.length
  )

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1)
    else onSave()
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-end bg-[#11181466] sm:place-items-center">
      <section className="ui-enter max-h-[94svh] w-full overflow-auto rounded-t-[28px] bg-[#fbfcf8] shadow-[0_-20px_60px_rgba(17,24,20,0.22)] sm:max-w-[760px] sm:rounded-[28px]">
        <header className="sticky top-0 z-10 border-b border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-black">{editing ? 'Edit offer' : 'Create offer'}</h2>
              <p className="text-[12px] font-bold text-[#647267]">Step {stepIndex + 1} of 5: {steps[stepIndex]}</p>
            </div>
            <button className="tap-lift grid h-11 w-11 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={() => setPanelOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => (
              <button
                className={`tap-lift shrink-0 rounded-full border px-3 py-2 text-[11px] font-black ${index === stepIndex ? toneClasses[index === 0 ? 'green' : index === 1 ? 'amber' : index === 2 ? 'violet' : index === 3 ? 'rose' : form.theme] : 'border-[#dde5da] bg-white text-[#647267] active:bg-[#f8faf7]'}`}
                key={step}
                type="button"
                onClick={() => setStepIndex(index)}
              >
                {step}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 p-4">
          <section className={`rounded-[22px] border p-4 text-center ${toneClasses[selectedType.tone]}`}>
            <SelectedTypeIcon className="mx-auto mb-2 h-7 w-7" />
            <strong className="block text-[12px] font-black uppercase tracking-[0.08em]">{selectedType.title}</strong>
            <span className="text-[11px] font-bold">{selectedType.copy}</span>
          </section>

          <div className="rounded-[16px] border border-[#dde5da] bg-white px-3 py-2 text-[11px] font-bold text-[#647267]">
            <span className="mr-2 rounded-full bg-[#edf5ed] px-2 py-1 text-[9px] font-black text-[#173f2a]">DRAFT</span>
            {summary.title} · {selectedType.title} · {summary.scope}
          </div>

          {stepIndex === 0 && (
            <div className="grid gap-3">
              <TextInput error={formErrors.title} label="Title" value={form.title} onChange={(value) => update('title', value)} placeholder="Weekend Basket Saver" />
              <TextInput label="Description" value={form.description} onChange={(value) => update('description', value)} placeholder="Short seller-facing note for this campaign" multiline />
              <div className="grid grid-cols-2 gap-2">
                {offerTypes.map((type) => (
                  <ChoiceCard
                    active={form.offerType === type.id}
                    icon={type.icon}
                    key={type.id}
                    title={type.title}
                    copy={type.copy}
                    tone={type.tone}
                    onClick={() => {
                      update('offerType', type.id)
                      update('theme', type.tone)
                    }}
                  />
                ))}
              </div>
              <label className="tap-lift flex items-center justify-between rounded-[16px] border border-[#dde5da] bg-white p-3 active:bg-[#edf5ed]">
                <span>
                  <strong className="block text-[13px] font-black">Offer active</strong>
                  <small className="font-bold text-[#647267]">Publish after saving</small>
                </span>
                <input checked={form.active} onChange={(event) => update('active', event.target.checked)} type="checkbox" />
              </label>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid gap-3">
              <SegmentedScope form={form} update={update} />
              {formErrors.scope && <p className="rounded-[14px] border border-[#efafa3] bg-[#fff2ef] px-3 py-2 text-[11px] font-bold text-[#b63a25]">{formErrors.scope}</p>}
              {form.scope === 'products' && (
                <SelectableGrid loading={loading} emptyText="No products ready yet.">
                  {products.map((product) => (
                    <SelectRow
                      active={form.productIds.includes(product.id)}
                      key={product.id}
                      title={product.master.name}
                      copy={`${product.category.name} · ${product.master.subcategory} · Rs ${product.sellingPrice}`}
                      tone={product.master.dietType === 'Non-veg' ? 'rose' : 'green'}
                      onClick={() => toggleArrayValue('productIds', product.id)}
                    />
                  ))}
                </SelectableGrid>
              )}
              {form.scope === 'categories' && (
                <SelectableGrid loading={loading} emptyText="No categories ready yet.">
                  {categories.map((category) => (
                    <SelectRow
                      active={form.categoryIds.includes(category.id)}
                      key={category.id}
                      title={category.name}
                      copy={`${category.subcategories.length} subcategories`}
                      tone="amber"
                      onClick={() => toggleArrayValue('categoryIds', category.id)}
                    />
                  ))}
                </SelectableGrid>
              )}
              {form.scope === 'subcategories' && (
                <SelectableGrid loading={loading} emptyText="No subcategories ready yet.">
                  {subcategories.map((subcategory) => (
                    <SelectRow
                      active={form.subcategories.includes(subcategory)}
                      key={subcategory}
                      title={subcategory}
                      copy="Apply offer to this collection"
                      tone="violet"
                      onClick={() => toggleArrayValue('subcategories', subcategory)}
                    />
                  ))}
                </SelectableGrid>
              )}
            </div>
          )}

          {stepIndex === 2 && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <TextInput error={formErrors.buyQty} label="Buy quantity" value={form.buyQty} onChange={(value) => update('buyQty', digitsOnly(value, 4))} inputMode="numeric" />
                <TextInput error={selectedType.id === 'percent' ? formErrors.discountValue : formErrors.getQty} label="Get / discount" value={selectedType.id === 'percent' ? form.discountValue : form.getQty} onChange={(value) => update(selectedType.id === 'percent' ? 'discountValue' : 'getQty', digitsOnly(value, 4))} inputMode="numeric" />
              </div>
              <TextInput error={formErrors.minCartValue} label="Minimum cart value" value={form.minCartValue} onChange={(value) => update('minCartValue', digitsOnly(value, 6))} inputMode="numeric" />
              <div className="rounded-[18px] border border-[#f0c56e] bg-[#fff6e9] p-3 text-[12px] font-bold text-[#7a540c]">
                Admin-created offer types can plug into this rule area later without changing the seller flow.
              </div>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="grid gap-2">
              {audienceTypes.map((audience) => (
                <ChoiceCard
                  active={form.audience === audience.id}
                  copy={audience.copy}
                  icon={audience.icon}
                  key={audience.id}
                  title={audience.title}
                  tone={audience.tone}
                  onClick={() => update('audience', audience.id)}
                />
              ))}
              <select className="h-12 rounded-[15px] border border-[#dde5da] bg-white px-3 text-[12px] font-black outline-none" value={form.usageLimit} onChange={(event) => update('usageLimit', event.target.value)}>
                <option value="once">Once per customer</option>
                <option value="daily">Once per day</option>
                <option value="unlimited">Unlimited uses</option>
              </select>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="grid gap-3">
              <TextInput error={formErrors.badgeText} label="Customer badge text" value={form.badgeText} onChange={(value) => update('badgeText', value)} placeholder="Limited offer" />
              <div className="grid grid-cols-4 gap-2">
                {['green', 'amber', 'violet', 'rose'].map((tone) => (
                  <button className={`tap-lift h-14 rounded-[16px] border ${form.theme === tone ? toneClasses[tone] : 'border-[#dde5da] bg-white active:bg-[#f8faf7]'}`} key={tone} type="button" onClick={() => update('theme', tone)} aria-label={`${tone} theme`}>
                    <Check className={`mx-auto h-5 w-5 ${form.theme === tone ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
              <div className={`rounded-[22px] border p-4 ${toneClasses[form.theme]}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.08em]">{form.badgeText || 'Limited offer'}</p>
                <h3 className="mt-2 text-[22px] font-black leading-tight">{form.title || selectedType.title}</h3>
                <p className="mt-1 text-[12px] font-bold">{selectedAudience.title} · {summary.scope}</p>
              </div>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          <button className="tap-lift rounded-[16px] border border-[#dde5da] bg-white py-3 text-[13px] font-black active:bg-[#f8faf7]" type="button" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}>
            Back
          </button>
          <button className={`tap-lift inline-flex items-center justify-center gap-2 rounded-[16px] py-3 text-[13px] font-black text-white ${stepIndex === steps.length - 1 && !canSave ? 'bg-[#a7b1aa]' : 'bg-[#173f2a] active:bg-[#08783c]'}`} disabled={stepIndex === steps.length - 1 && !canSave} type="button" onClick={goNext}>
            {stepIndex === steps.length - 1 ? (editing ? 'Update offer' : 'Save offer') : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, multiline, inputMode, error }) {
  const Control = multiline ? 'textarea' : 'input'

  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[12px] font-black text-[#26342b]">
        {label}
        {error && <span className="text-[11px] text-[#b63a25]">{error}</span>}
      </span>
      <Control
        className={`tap-lift min-h-12 rounded-[15px] border bg-white px-3 py-3 text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'}`}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function ChoiceCard({ active, icon: Icon, title, copy, tone, onClick }) {
  return (
    <button className={`tap-lift flex min-h-[82px] items-center gap-3 rounded-[18px] border p-3 text-left ${active ? toneClasses[tone] : 'border-[#dde5da] bg-white active:bg-[#f8faf7]'}`} type="button" onClick={onClick}>
      <span className={`icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-[14px] ${active ? 'bg-white/70' : toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <strong className="block text-[13px] font-black text-[#111814]">{title}</strong>
        <small className="text-[11px] font-bold text-[#647267]">{copy}</small>
      </span>
    </button>
  )
}

function SegmentedScope({ form, update }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-[17px] border border-[#dde5da] bg-[#edf1ed] p-1">
      {[
        ['products', 'Products'],
        ['categories', 'Categories'],
        ['subcategories', 'Subcats'],
      ].map(([value, label]) => (
        <button className={`tap-lift min-h-10 rounded-[13px] text-[11px] font-black ${form.scope === value ? 'bg-white text-[#173f2a] shadow-[0_8px_18px_rgba(23,63,42,0.12)]' : 'text-[#647267] active:bg-white'}`} key={value} type="button" onClick={() => update('scope', value)}>
          {label}
        </button>
      ))}
    </div>
  )
}

function SelectableGrid({ children, loading, emptyText }) {
  if (loading) return <div className="rounded-[18px] border border-[#dde5da] bg-white p-4 text-center text-[12px] font-bold text-[#647267]">Loading choices...</div>
  if (!children.length) return <div className="rounded-[18px] border border-[#dde5da] bg-white p-4 text-center text-[12px] font-bold text-[#647267]">{emptyText}</div>
  return <div className="grid max-h-[280px] gap-2 overflow-auto rounded-[18px] border border-[#dde5da] bg-white p-2">{children}</div>
}

function SelectRow({ active, title, copy, tone, onClick }) {
  return (
    <button className={`tap-lift flex items-center gap-3 rounded-[15px] border p-3 text-left ${active ? toneClasses[tone] : 'border-[#edf1ed] bg-[#fbfcf8] active:bg-[#f8faf7]'}`} type="button" onClick={onClick}>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[10px] ${active ? 'bg-white/75' : toneClasses[tone]}`}>
        {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-[13px] font-black text-[#111814]">{title}</strong>
        <small className="block truncate text-[11px] font-bold text-[#647267]">{copy}</small>
      </span>
    </button>
  )
}
