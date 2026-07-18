const OFFERS_STORAGE_KEY = 'simplifyliving:seller-offers'

export const defaultOfferForm = {
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

export const seededOffers = [
  {
    id: 'of-1',
    title: 'Weekend Basket Saver',
    type: 'Combo Saver',
    audience: 'All customers',
    scope: '3 grocery items',
    status: 'Active',
    accent: 'green',
    source: 'Seller',
    formData: {
      ...defaultOfferForm,
      title: 'Weekend Basket Saver',
      description: 'Basket discount for selected grocery products.',
      offerType: 'bundle',
      productIds: ['sp-2', 'sp-4'],
      discountValue: 10,
      minCartValue: 10,
      audience: 'all',
      theme: 'green',
    },
  },
  {
    id: 'of-admin-1',
    title: 'Admin First Order 5%',
    type: 'Percent Off',
    audience: 'All customers',
    scope: 'All active shop items',
    status: 'Active',
    accent: 'amber',
    source: 'Admin',
    formData: {
      ...defaultOfferForm,
      title: 'Admin First Order 5%',
      description: 'Admin-level introductory discount.',
      offerType: 'percent',
      scope: 'categories',
      categoryIds: ['bengali', 'grocery'],
      discountValue: 5,
      minCartValue: 1,
      audience: 'all',
      theme: 'amber',
    },
  },
  {
    id: 'of-2',
    title: 'First Order Delight',
    type: 'Percent Off',
    audience: 'New customers',
    scope: 'Bengali category',
    status: 'Draft',
    accent: 'amber',
    source: 'Seller',
    formData: {
      ...defaultOfferForm,
      title: 'First Order Delight',
      description: 'Intro discount for first-time customers.',
      offerType: 'percent',
      active: false,
      scope: 'categories',
      categoryIds: ['bengali'],
      audience: 'new',
      theme: 'amber',
    },
  },
]

const wait = (data) => new Promise((resolve) => window.setTimeout(() => resolve(data), 120))

function readOffers() {
  try {
    const stored = window.localStorage.getItem(OFFERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : seededOffers
  } catch {
    return seededOffers
  }
}

export function getSellerOffers() {
  return wait(readOffers())
}

export function getActiveOffers() {
  return getSellerOffers().then((offers) => offers.filter((offer) => offer.status === 'Active' && offer.formData?.active !== false))
}

export function saveSellerOffers(offers) {
  window.localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers))
}

export function offerAppliesToItem(offer, item) {
  const form = offer.formData || {}
  if (!item) return false
  if (form.scope === 'products') return form.productIds?.includes(item.id)
  if (form.scope === 'categories') return form.categoryIds?.includes(item.categoryId)
  if (form.scope === 'subcategories') return form.subcategories?.some((entry) => entry.endsWith(` / ${item.subcategory}`) || entry === item.subcategory)
  return true
}

export function calculateOfferDiscount(offer, item, subtotal) {
  if (!offer || !offerAppliesToItem(offer, item)) return 0
  const form = offer.formData || {}
  if (subtotal < Number(form.minCartValue || 0)) return 0

  if (form.offerType === 'percent' || form.offerType === 'bundle') {
    return Math.min(subtotal, Number(((subtotal * Number(form.discountValue || 0)) / 100).toFixed(2)))
  }

  if (form.offerType === 'bogo') {
    const unitPrice = Number(item?.price || 0)
    const freeQty = Math.floor(Number(form.getQty || 1))
    return Math.min(subtotal, unitPrice * freeQty)
  }

  return 0
}

export function getOfferBlockReason(offer, item, subtotal) {
  if (!offer) return ''
  if (!offerAppliesToItem(offer, item)) return 'This offer does not apply to the selected item.'

  const minCartValue = Number(offer.formData?.minCartValue || 0)
  if (subtotal < minCartValue) return `Minimum order value is Rs ${minCartValue}.`

  return ''
}
