import { getCategories, getMasterProducts, getSellerProducts } from './productService'
import { calculateOfferDiscount, getOfferBlockReason } from './offerService'
import { joinProductData } from '../utils/productUtils'

const ORDERS_STORAGE_KEY = 'simplifyliving:seller-orders'

const seededOrders = [
  {
    id: 'ord-0002',
    code: 'FF-ORD...0002',
    shortCode: '#0002',
    buyerName: 'asdad',
    buyerPhone: '+919161381477',
    buyerAddress: 'adada',
    status: 'Preparing',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    createdAt: '18 Jul 2026, 3:58 pm',
    updatedAt: '18 Jul 2026, 3:58 pm',
    items: [
      { productId: 'sp-2', name: 'Toast', quantity: 2, unit: 'Piece', price: 8.42 },
    ],
  },
  {
    id: 'ord-0001',
    code: 'FF-ORD...0001',
    shortCode: '#0001',
    buyerName: 'doga',
    buyerPhone: '+919163184177',
    buyerAddress: 'Near main road',
    status: 'Completed',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    createdAt: '17 Jul 2026, 1:25 am',
    updatedAt: '17 Jul 2026, 1:38 am',
    items: [
      { productId: 'sp-4', name: 'Basmati Rice', quantity: 1, unit: 'kg', price: 110 },
    ],
  },
]

const wait = (data) => new Promise((resolve) => window.setTimeout(() => resolve(data), 180))

function readStoredOrders() {
  try {
    const stored = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function saveSellerOrders(orders) {
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function getOrderInventory() {
  return Promise.all([getCategories(), getMasterProducts(), getSellerProducts()]).then(([categories, masterProducts, sellerProducts]) => (
    joinProductData(sellerProducts, masterProducts, categories).map((product) => ({
      id: product.id,
      categoryId: product.category?.id || '',
      categoryName: product.category?.name || 'Uncategorized',
      subcategory: product.master?.subcategory || 'General',
      name: product.master?.name || 'Unnamed item',
      variant: [product.type, product.sku || product.priceUnit].filter(Boolean).join(' - '),
      price: Number(product.sellingPrice || 0),
      quantity: Number(product.inventoryQuantity || 0),
      unit: product.inventoryUnit || product.priceUnit || 'Unit',
      sellerStatus: product.status,
    }))
  ))
}

export function getOrderCategories() {
  return getCategories()
}

export function getSellerOrders() {
  return wait(readStoredOrders() || seededOrders)
}

export function createBuyerOrder(form, stock, offers = []) {
  const selectedItem = stock.find((item) => item.id === form.productId)
  const quantity = Number(form.quantity || 1)

  if (!selectedItem || selectedItem.quantity <= 0 || quantity > selectedItem.quantity) {
    return Promise.reject(new Error('Selected item is not available in seller inventory.'))
  }

  const remaining = selectedItem.quantity - quantity
  const subtotal = quantity * selectedItem.price
  const appliedOffer = offers.find((offer) => offer.id === form.offerId)
  const offerBlockReason = getOfferBlockReason(appliedOffer, selectedItem, subtotal)
  if (appliedOffer && offerBlockReason) {
    return Promise.reject(new Error(offerBlockReason))
  }

  const discountAmount = calculateOfferDiscount(appliedOffer, selectedItem, subtotal)
  const totalAmount = Math.max(0, subtotal - discountAmount)

  return wait({
    order: {
      id: `ord-${Date.now()}`,
      code: `FF-ORD...${String(Date.now()).slice(-4)}`,
      shortCode: `#${String(Date.now()).slice(-4)}`,
      buyerName: form.buyerName,
      buyerPhone: form.buyerPhone,
      buyerAddress: form.buyerAddress,
      status: 'New',
      paymentMethod: form.paymentMethod,
      paymentStatus: 'Pending',
      appliedOffer: appliedOffer
        ? {
            id: appliedOffer.id,
            title: appliedOffer.title,
            source: appliedOffer.source || 'Seller',
          }
        : null,
      subtotal,
      discountAmount,
      totalAmount,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      items: [
        {
          productId: selectedItem.id,
          name: selectedItem.name,
          quantity,
          unit: selectedItem.unit,
          price: selectedItem.price,
        },
      ],
    },
    inventoryPatch: {
      productId: selectedItem.id,
      quantity: remaining,
      availability: remaining <= 0 ? 'Drained' : remaining <= 5 ? 'Low stock' : 'Available',
    },
  })
}

export function updateOrderStatus(order, nextStatus, patch = {}) {
  return wait({
    ...order,
    ...patch,
    status: nextStatus,
    updatedAt: 'Just now',
  })
}
