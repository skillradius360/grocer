import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, Loader2 } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import {
  DeleteDialog,
  FilterBar,
  InventoryModal,
  MasterListModal,
  ProductCard,
  ProductFilterModal,
  ProductForm,
  ProductTable,
  StatsCard,
} from '../components/products/ProductComponents'
import { useProducts } from '../hooks/useProducts'
import {
  createMasterProduct,
  createSellerProduct,
  deleteSellerProduct,
  updateInventory,
  updateSellerProduct,
} from '../services/productService'
import { groupProducts } from '../utils/productUtils'

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

export function MenuProductsPage({ sellerSession, theme, onToggleTheme }) {
  const [filters, setFilters] = useState(defaultFilters)
  const [viewMode, setViewMode] = useState('grid')
  const [formMode, setFormMode] = useState('')
  const [selectedMasterProduct, setSelectedMasterProduct] = useState(null)
  const [masterListOpen, setMasterListOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [inventoryProduct, setInventoryProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [message, setMessage] = useState('')

  const {
    categories,
    error,
    filteredProducts,
    loading,
    masterProducts,
    setMasterProducts,
    setSellerProducts,
    stats,
  } = useProducts(filters)

  const visibleProducts = useMemo(
    () => filteredProducts.filter((product) => filters.diet === 'all' || product.master.dietType === filters.diet),
    [filteredProducts, filters.diet],
  )
  const groupedProducts = useMemo(() => groupProducts(visibleProducts), [visibleProducts])

  const patchFilter = (patch) => setFilters((current) => ({ ...current, ...patch }))

  useEffect(() => {
    const openAddProduct = (event) => {
      if (event.detail === '/products') setFormMode('add')
    }

    window.addEventListener('simplifyliving:footer-add', openAddProduct)
    return () => window.removeEventListener('simplifyliving:footer-add', openAddProduct)
  }, [])

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  const saveProduct = async (form) => {
    if (formMode === 'edit') {
      await updateSellerProduct(selectedProduct.id, form)
      setSellerProducts((current) => current.map((product) => (
        product.id === selectedProduct.id
          ? {
              ...product,
              ...form,
              sellingPrice: Number(form.sellingPrice),
              mrp: Number(form.mrp || 0),
              inventoryQuantity: Number(form.inventoryQuantity),
              inventoryUnit: form.type === 'Packed' ? 'Packets' : form.inventoryUnit,
              updatedAt: 'Just now',
            }
          : product
      )))
      showMessage('Product updated.')
    } else {
      let masterProductId = form.masterProductId

      if (!masterProductId) {
        const masterProduct = await createMasterProduct({
          name: form.name,
          brand: form.brand,
          description: form.description,
          categoryId: form.categoryId,
          subcategory: form.subcategory,
          imageUrl: '',
          dietType: 'Veg',
        })
        masterProductId = masterProduct.id
        setMasterProducts((current) => [masterProduct, ...current])
      }

      const sellerProduct = await createSellerProduct({
        masterProductId,
        type: form.type,
        sellingPrice: Number(form.sellingPrice),
        mrp: Number(form.mrp || 0),
        inventoryQuantity: Number(form.inventoryQuantity),
        inventoryUnit: form.type === 'Packed' ? 'Packets' : form.inventoryUnit,
        sku: form.sku,
        priceUnit: form.priceUnit,
        minimumOrderQuantity: Number(form.minimumOrderQuantity || 0),
        maximumOrderQuantity: Number(form.maximumOrderQuantity || 0),
        availability: form.availability,
        status: 'Active',
      })
      setSellerProducts((current) => [sellerProduct, ...current])
      showMessage('Product added.')
    }

    setFormMode('')
    setSelectedProduct(null)
  }

  const saveInventory = async (quantity) => {
    await updateInventory(inventoryProduct.id, { quantity })
    setSellerProducts((current) => current.map((product) => (
      product.id === inventoryProduct.id ? { ...product, inventoryQuantity: quantity, updatedAt: 'Just now' } : product
    )))
    setInventoryProduct(null)
    showMessage('Inventory updated.')
  }

  const confirmDelete = async () => {
    await deleteSellerProduct(deleteProduct.id)
    setSellerProducts((current) => current.filter((product) => product.id !== deleteProduct.id))
    setDeleteProduct(null)
    showMessage('Seller product deleted.')
  }

  const toggleProduct = async (product) => {
    const nextStatus = product.status === 'Hidden' ? 'Active' : 'Hidden'
    await updateSellerProduct(product.id, { status: nextStatus })
    setSellerProducts((current) => current.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item)))
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f3f6f4] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Products" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <div className="grid grid-cols-5 gap-2">
          <StatsCard label="Total" value={stats.total} tone="blue" />
          <StatsCard label="Active" value={stats.active} />
          <StatsCard label="Low" value={stats.low} tone="amber" />
          <StatsCard label="Out" value={stats.out} tone="red" />
          <StatsCard label="Hidden" value={stats.hidden} tone="blue" />
        </div>

        <FilterBar filters={filters} onFilter={patchFilter} onOpenFilters={() => setFilterModalOpen(true)} onOpenMasterList={() => setMasterListOpen(true)} />

        <div className="flex flex-wrap gap-2 rounded-[16px] border border-[#dde5da] bg-white p-3">
          <select className="h-10 flex-1 rounded-[12px] border border-[#dde5da] px-3 text-[12px] font-bold" value={filters.stock} onChange={(event) => patchFilter({ stock: event.target.value })}>
            <option value="all">All stock</option>
            <option value="In stock">In stock</option>
            <option value="Low stock">Low stock</option>
            <option value="Out of stock">Out of stock</option>
          </select>
          <select className="h-10 flex-1 rounded-[12px] border border-[#dde5da] px-3 text-[12px] font-bold" value={filters.availability} onChange={(event) => patchFilter({ availability: event.target.value })}>
            <option value="all">All status</option>
            <option value="Active">Active</option>
            <option value="Hidden">Hidden</option>
          </select>
          <select className="h-10 flex-1 rounded-[12px] border border-[#dde5da] px-3 text-[12px] font-bold" value={filters.sort} onChange={(event) => patchFilter({ sort: event.target.value })}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="inventory">Inventory</option>
          </select>
          <div className="flex h-10 shrink-0 items-center gap-1 rounded-[12px] bg-[#edf1ed] p-1">
            <button className={`grid h-8 w-8 place-items-center rounded-[10px] ${viewMode === 'grid' ? 'bg-white text-[#173f2a] shadow-[0_8px_18px_rgba(23,63,42,0.12)]' : 'text-[#647267]'}`} type="button" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button className={`grid h-8 w-8 place-items-center rounded-[10px] ${viewMode === 'table' ? 'bg-white text-[#173f2a] shadow-[0_8px_18px_rgba(23,63,42,0.12)]' : 'text-[#647267]'}`} type="button" onClick={() => setViewMode('table')} aria-label="Table view">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {message && <div className="rounded-[14px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">{message}</div>}
        {error && <div className="rounded-[14px] border border-[#efafa3] bg-[#fff2ef] px-3 py-2 text-[12px] font-bold text-[#b63a25]">{error}</div>}

        {loading ? (
          <div className="grid min-h-[180px] place-items-center rounded-[18px] border border-[#dde5da] bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-[#173f2a]" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[18px] border border-[#dde5da] bg-white p-6 text-center">
            <strong className="block text-[15px] font-black">No products found</strong>
            <p className="mt-1 text-[12px] font-semibold text-[#647267]">Try another filter or add a product.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <section className="grid gap-4">
              {Object.entries(groupedProducts).map(([category, collections]) => (
                <div className="grid gap-3" key={category}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#173f2a] shadow-[0_0_0_4px_rgba(23,63,42,0.08)]"></span>
                    <h2 className="truncate text-[15px] font-black text-[#173f2a]">{category}</h2>
                  </div>
                  {Object.entries(collections).map(([collection, products]) => (
                    <div className="rounded-[18px] border border-white/70 bg-white/70 p-3 shadow-[0_12px_28px_rgba(23,63,42,0.08)]" key={collection}>
                      <div className="mb-3 flex min-w-0 items-center gap-2">
                        <span className="h-px w-5 shrink-0 bg-[#b8c8bc]"></span>
                        <h3 className="truncate text-[13px] font-black text-[#111814]">{collection}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onEdit={() => {
                              setSelectedProduct(product)
                              setFormMode('edit')
                            }}
                            onInventory={() => setInventoryProduct(product)}
                            onDelete={() => setDeleteProduct(product)}
                            onToggle={() => toggleProduct(product)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ) : (
            <ProductTable
              products={visibleProducts}
              onEdit={(product) => {
                setSelectedProduct(product)
                setFormMode('edit')
              }}
              onInventory={setInventoryProduct}
              onDelete={setDeleteProduct}
              onToggle={toggleProduct}
            />
          )
        )}
      </main>

      {formMode && (
        <ProductForm
          categories={categories}
          masterProducts={masterProducts}
          mode={formMode}
          product={selectedProduct}
          selectedMasterProduct={selectedMasterProduct}
          onClose={() => {
            setFormMode('')
            setSelectedProduct(null)
            setSelectedMasterProduct(null)
          }}
          onSave={saveProduct}
        />
      )}
      {masterListOpen && (
        <MasterListModal
          categories={categories}
          masterProducts={masterProducts}
          onClose={() => setMasterListOpen(false)}
          onUseProduct={(product) => {
            setSelectedMasterProduct(product)
            setSelectedProduct(null)
            setFormMode('add')
            setMasterListOpen(false)
          }}
        />
      )}
      {filterModalOpen && <ProductFilterModal categories={categories} filters={filters} onClose={() => setFilterModalOpen(false)} onFilter={patchFilter} />}
      {inventoryProduct && <InventoryModal product={inventoryProduct} onClose={() => setInventoryProduct(null)} onSave={saveInventory} />}
      {deleteProduct && <DeleteDialog product={deleteProduct} onCancel={() => setDeleteProduct(null)} onConfirm={confirmDelete} />}
    </div>
  )
}
