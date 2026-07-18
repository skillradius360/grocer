const STORAGE_KEY = 'simplifyliving:seller-session'

export const defaultSellerSession = {
  auth: {
    provider: 'local',
    uid: 'local-seller-demo',
  },
  shop: {
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    pincode: '',
    gst: '',
    isLive: true,
    shopStatus: 'Open',
    menuSession: 'All Day',
    deliveryStatus: 'Active',
  },
  dashboard: {
    installBannerVisible: true,
    notificationsEnabled: true,
    lastRefreshedAt: '',
  },
}

export function loadSellerSession() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultSellerSession
    const parsed = JSON.parse(saved)

    return {
      ...defaultSellerSession,
      ...parsed,
      shop: {
        ...defaultSellerSession.shop,
        ...parsed.shop,
      },
      dashboard: {
        ...defaultSellerSession.dashboard,
        ...parsed.dashboard,
      },
    }
  } catch {
    return defaultSellerSession
  }
}

export function saveSellerSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function createSellerSession(form, authMode) {
  return {
    ...defaultSellerSession,
    auth: {
      provider: authMode,
      uid: `local-${Date.now()}`,
    },
    shop: {
      ...defaultSellerSession.shop,
      shopName: form.shopName || 'Fresh Basket Mart',
      ownerName: form.ownerName,
      phone: form.phone,
      address: form.address,
      pincode: form.pincode,
      gst: form.gst,
    },
    dashboard: {
      ...defaultSellerSession.dashboard,
      lastRefreshedAt: new Date().toISOString(),
    },
  }
}
