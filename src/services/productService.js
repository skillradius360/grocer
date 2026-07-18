const categories = [
  {
    id: 'bengali',
    name: 'Bengali',
    subcategories: ['Sandwiches', 'Dosas', 'Sweets'],
  },
  {
    id: 'chinese',
    name: 'Chinese',
    subcategories: ['Momos', 'Noodles', 'Soups'],
  },
  {
    id: 'grocery',
    name: 'Grocery',
    subcategories: ['Rice', 'Oil', 'Snacks'],
  },
]

const masterProducts = [
  { id: 'mp-1', name: 'Chicken sandwich', brand: '', categoryId: 'bengali', subcategory: 'Sandwiches', description: 'Fresh chicken sandwich', imageUrl: '', dietType: 'Non-veg' },
  { id: 'mp-2', name: 'Toast', brand: '', categoryId: 'bengali', subcategory: 'Dosas', description: 'Crisp breakfast toast', imageUrl: '', dietType: 'Veg' },
  { id: 'mp-3', name: 'Chicken Fried Momo', brand: '', categoryId: 'chinese', subcategory: 'Momos', description: 'Fried chicken momos', imageUrl: '', dietType: 'Non-veg' },
  { id: 'mp-4', name: 'Basmati Rice', brand: 'Daily Gold', categoryId: 'grocery', subcategory: 'Rice', description: 'Long grain basmati rice', imageUrl: '', dietType: 'Veg' },
]

const sellerProducts = [
  { id: 'sp-1', masterProductId: 'mp-1', type: 'Packed', sellingPrice: 1, mrp: 1, inventoryQuantity: 0, inventoryUnit: 'Piece', sku: 'SND-001', availability: 'Out of stock', status: 'Active', updatedAt: 'Today' },
  { id: 'sp-2', masterProductId: 'mp-2', type: 'Packed', sellingPrice: 7.92, mrp: 12, inventoryQuantity: 3, inventoryUnit: 'Piece', sku: 'TST-002', availability: 'Low stock', status: 'Active', updatedAt: 'Today' },
  { id: 'sp-3', masterProductId: 'mp-3', type: 'Loose', sellingPrice: 80, priceUnit: 'dozen', inventoryQuantity: 0, inventoryUnit: 'Piece', minimumOrderQuantity: 1, maximumOrderQuantity: 6, availability: 'Out of stock', status: 'Active', updatedAt: 'Yesterday' },
  { id: 'sp-4', masterProductId: 'mp-4', type: 'Loose', sellingPrice: 110, priceUnit: 'kg', inventoryQuantity: 18, inventoryUnit: 'kg', minimumOrderQuantity: 1, maximumOrderQuantity: 25, availability: 'Available', status: 'Hidden', updatedAt: '2 days ago' },
]

const wait = (data) => new Promise((resolve) => window.setTimeout(() => resolve(data), 250))

export function getCategories() {
  // TODO: Replace with Firestore categories collection read.
  return wait(categories)
}

export function getMasterProducts() {
  // TODO: Replace with Firestore masterProducts query by category/subcategory.
  return wait(masterProducts)
}

export function getSellerProducts() {
  // TODO: Replace with Firestore sellerProducts query by seller/shop id.
  return wait(sellerProducts)
}

export function createMasterProduct(product) {
  // TODO: Create Firestore masterProducts document after admin rules are finalized.
  return wait({ ...product, id: `mp-${Date.now()}` })
}

export function createSellerProduct(product) {
  // TODO: Create sellerProducts document linked to shopId and masterProductId.
  return wait({ ...product, id: `sp-${Date.now()}`, updatedAt: 'Just now' })
}

export function updateSellerProduct(productId, patch) {
  // TODO: Update Firestore sellerProducts/{productId}.
  return wait({ productId, ...patch })
}

export function updateInventory(productId, change) {
  // TODO: Write inventory adjustment and append inventory history document.
  return wait({ productId, ...change })
}

export function deleteSellerProduct(productId) {
  // TODO: Delete only sellerProducts/{productId}; never delete masterProducts.
  return wait({ productId, deleted: true })
}

export function uploadProductImage(file) {
  // TODO: Upload to Firebase Storage and return public download URL.
  return wait({ fileName: file?.name || 'product-image', url: '' })
}
