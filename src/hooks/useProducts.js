import { useEffect, useMemo, useState } from 'react'
import { getCategories, getMasterProducts, getSellerProducts } from '../services/productService'
import { filterProducts, getProductStats, joinProductData } from '../utils/productUtils'

export function useProducts(filters) {
  const [categories, setCategories] = useState([])
  const [masterProducts, setMasterProducts] = useState([])
  const [sellerProducts, setSellerProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setLoading(true)
        const [nextCategories, nextMasterProducts, nextSellerProducts] = await Promise.all([
          getCategories(),
          getMasterProducts(),
          getSellerProducts(),
        ])

        if (active) {
          setCategories(nextCategories)
          setMasterProducts(nextMasterProducts)
          setSellerProducts(nextSellerProducts)
          setError('')
        }
      } catch {
        if (active) setError('Unable to load products.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  const products = useMemo(
    () => joinProductData(sellerProducts, masterProducts, categories),
    [sellerProducts, masterProducts, categories],
  )

  const filteredProducts = useMemo(() => filterProducts(products, filters), [products, filters])
  const stats = useMemo(() => getProductStats(products), [products])

  return {
    categories,
    error,
    filteredProducts,
    loading,
    masterProducts,
    products,
    setMasterProducts,
    setSellerProducts,
    stats,
  }
}
