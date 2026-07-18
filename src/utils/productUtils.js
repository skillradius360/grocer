export function joinProductData(sellerProducts, masterProducts, categories) {
  return sellerProducts.map((sellerProduct) => {
    const master = masterProducts.find((product) => product.id === sellerProduct.masterProductId)
    const category = categories.find((item) => item.id === master?.categoryId)

    return {
      ...sellerProduct,
      master,
      category,
      stockStatus: sellerProduct.inventoryQuantity <= 0 ? 'Out of stock' : sellerProduct.inventoryQuantity <= 5 ? 'Low stock' : 'In stock',
    }
  })
}

export function filterProducts(products, filters) {
  const search = filters.search.trim().toLowerCase()

  return products
    .filter((product) => !search || product.master?.name.toLowerCase().includes(search))
    .filter((product) => filters.category === 'all' || product.category?.id === filters.category)
    .filter((product) => filters.subcategory === 'all' || product.master?.subcategory === filters.subcategory)
    .filter((product) => filters.type === 'all' || product.type === filters.type)
    .filter((product) => filters.availability === 'all' || product.status === filters.availability)
    .filter((product) => filters.stock === 'all' || product.stockStatus === filters.stock)
    .sort((a, b) => {
      if (filters.sort === 'name') return a.master.name.localeCompare(b.master.name)
      if (filters.sort === 'price') return a.sellingPrice - b.sellingPrice
      if (filters.sort === 'inventory') return b.inventoryQuantity - a.inventoryQuantity
      return b.id.localeCompare(a.id)
    })
}

export function getProductStats(products) {
  return {
    total: products.length,
    active: products.filter((product) => product.status === 'Active').length,
    low: products.filter((product) => product.stockStatus === 'Low stock').length,
    out: products.filter((product) => product.stockStatus === 'Out of stock').length,
    hidden: products.filter((product) => product.status === 'Hidden').length,
  }
}

export function groupProducts(products) {
  return products.reduce((groups, product) => {
    const category = product.category?.name || 'Uncategorized'
    const subcategory = product.master?.subcategory || 'General'

    if (!groups[category]) groups[category] = {}
    if (!groups[category][subcategory]) groups[category][subcategory] = []
    groups[category][subcategory].push(product)

    return groups
  }, {})
}
