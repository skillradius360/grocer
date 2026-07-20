const STORAGE_KEY = 'simplifyliving:seller-session'

export const defaultSellerSession = {
  createdAt: new Date().toISOString(),
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
    latitude: '',
    longitude: '',
    gst: '',
    createdAt: new Date().toISOString(),
    isLive: true,
    shopStatus: 'Open',
    menuSession: 'All Day',
    deliveryStatus: 'Active',
  },
  dashboard: {
    inventoryWarningVisible: true,
    notificationsEnabled: true,
    lastRefreshedAt: '',
  },
  billing: {
    walletBalance: 0,
    weeklyPayoutRequirement: 99,
    currency: 'INR',
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
      billing: {
        ...defaultSellerSession.billing,
        ...parsed.billing,
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
      latitude: form.latitude,
      longitude: form.longitude,
      location: {
        address: form.address,
        pincode: form.pincode,
        geoPoint: {
          latitude: Number(form.latitude || 0),
          longitude: Number(form.longitude || 0),
        },
        provider: 'onboarding-map',
        updatedAt: new Date().toISOString(),
      },
      gst: form.gst,
      createdAt: new Date().toISOString(),
    },
    dashboard: {
      ...defaultSellerSession.dashboard,
      lastRefreshedAt: new Date().toISOString(),
    },
    billing: {
      ...defaultSellerSession.billing,
    },
  }
}
