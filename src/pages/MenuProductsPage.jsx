import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import {
  DeleteDialog,
  FilterBar,
  InventoryModal,
  ProductCard,
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
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [activeTab, setActiveTab] = useState('Items')
  const [formMode, setFormMode] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [inventoryProduct, setInventoryProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
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
        inventoryUnit: form.inventoryUnit,
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

  const tabStyles = {
    Items: 'bg-[#edf5ed] text-[#173f2a] shadow-[0_6px_14px_rgba(23,63,42,0.12)]',
    Combos: 'bg-[#fff6e9] text-[#9a6500] shadow-[0_6px_14px_rgba(189,125,43,0.12)]',
    Menus: 'bg-[#f0fff5] text-[#08783c] shadow-[0_6px_14px_rgba(8,120,60,0.12)]',
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f3f6f4] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Menu" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-black">Products management</h1>
            <p className="text-[12px] font-bold text-[#647267]">Items, combos, menus, and stock controls</p>
          </div>
          <button className="tap-lift inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#173f2a] px-3 text-[12px] font-black text-white active:bg-[#08783c]" type="button" onClick={() => setFormMode('add')}>
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="grid grid-cols-3 rounded-[14px] border border-[#dde5da] bg-[#edf1ed] p-1">
          {['Items', 'Combos', 'Menus'].map((tab) => (
            <button
              className={`tap-lift min-h-9 rounded-[11px] text-[12px] font-black ${activeTab === tab ? tabStyles[tab] : 'text-[#647267] active:bg-white active:text-[#173f2a]'}`}
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          <StatsCard label="Total" value={stats.total} tone="blue" />
          <StatsCard label="Active" value={stats.active} />
          <StatsCard label="Low" value={stats.low} tone="amber" />
          <StatsCard label="Out" value={stats.out} tone="red" />
          <StatsCard label="Hidden" value={stats.hidden} tone="blue" />
        </div>

        <FilterBar categories={categories} filters={filters} onFilter={patchFilter} />

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
          <section className="grid gap-4">
            {Object.entries(groupedProducts).map(([category, collections]) => (
              <div className="grid gap-3" key={category}>
                <h2 className="text-[13px] font-black uppercase tracking-[0.05em] text-[#647267]">
                  Category <span className="normal-case tracking-normal text-[#173f2a]">{category}</span>
                </h2>
                {Object.entries(collections).map(([collection, products]) => (
                  <div key={collection}>
                    <h3 className="mb-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#173f2a]">Collection <span className="normal-case tracking-normal text-[#111814]">{collection}</span></h3>
                    <div className="flex flex-wrap gap-3">
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
            <ProductTable
              products={visibleProducts}
              onEdit={(product) => {
                setSelectedProduct(product)
                setFormMode('edit')
              }}
            />
          </section>
        )}
      </main>

      {formMode && (
        <ProductForm
          categories={categories}
          masterProducts={masterProducts}
          mode={formMode}
          product={selectedProduct}
          onClose={() => {
            setFormMode('')
            setSelectedProduct(null)
          }}
          onSave={saveProduct}
        />
      )}
      {inventoryProduct && <InventoryModal product={inventoryProduct} onClose={() => setInventoryProduct(null)} onSave={saveInventory} />}
      {deleteProduct && <DeleteDialog product={deleteProduct} onCancel={() => setDeleteProduct(null)} onConfirm={confirmDelete} />}
    </div>
  )
}
