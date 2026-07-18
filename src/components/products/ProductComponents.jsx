import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  Edit3,
  EyeOff,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { decimalOnly, validateFieldsByRules, patterns } from '../../utils/validation'

export function StatusBadge({ status }) {
  const styles = {
    Active: 'border-[#97d7aa] bg-[#f0fff5] text-[#08783c]',
    Hidden: 'border-[#d7d7d0] bg-[#f8faf7] text-[#647267]',
    Available: 'border-[#97d7aa] bg-[#f0fff5] text-[#08783c]',
    'Low stock': 'border-[#edc26e] bg-[#fff6e9] text-[#9a6500]',
    'Out of stock': 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black ${styles[status] || styles.Hidden}`}>
      {status}
    </span>
  )
}

export function StatsCard({ label, value, tone = 'green' }) {
  const tones = {
    green: 'bg-[#edf5ed] text-[#173f2a]',
    amber: 'bg-[#fff6e9] text-[#9a6500]',
    red: 'bg-[#fff2ef] text-[#b63a25]',
    blue: 'bg-[#edf5ed] text-[#173f2a]',
  }

  return (
    <div className="tap-lift rounded-[16px] border border-[#dde5da] bg-white p-3 shadow-[0_8px_20px_rgba(23,63,42,0.06)] hover:border-[#b8c8bc] hover:shadow-[0_14px_28px_rgba(23,63,42,0.1)]">
      <span className={`icon-chip mb-2 grid h-8 w-8 place-items-center rounded-[11px] ${tones[tone]}`}>
        <Boxes className="h-4 w-4" />
      </span>
      <strong className="block text-[20px] font-black leading-none">{value}</strong>
      <span className="mt-1 block text-[9px] font-black uppercase leading-tight tracking-[0.05em] text-[#647267]">{label}</span>
    </div>
  )
}

export function SearchBar({ value, onChange }) {
  return (
    <label className="tap-lift flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-white px-3 text-[#647267] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]">
      <Search className="h-5 w-5 shrink-0" />
      <input
        className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#111814] outline-none placeholder:text-[#8a978d]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search items, combos, product names..."
      />
    </label>
  )
}

function SelectControl({ label, value, onChange, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
      <span className="relative block">
        <select
          className="h-11 w-full appearance-none rounded-[13px] border border-[#dde5da] bg-white px-3 pr-8 text-[12px] font-bold text-[#26342b] outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647267]" />
      </span>
    </label>
  )
}

export function FilterBar({ categories, filters, onFilter, onOpenMasterList }) {
  const subcategories = categories.flatMap((category) => category.subcategories)
  const dietStyles = {
    all: 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]',
    Veg: 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]',
    'Non-veg': 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
  }

  return (
    <div className="rounded-[18px] border border-[#dde5da] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
        <SearchBar value={filters.search} onChange={(search) => onFilter({ search })} />
        <button className="tap-lift rounded-[13px] border border-[#dde5da] px-3 text-[11px] font-black active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]" type="button" onClick={onOpenMasterList}>
          Master list
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectControl label="Category" value={filters.category} onChange={(category) => onFilter({ category })}>
          <option value="all">All Categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </SelectControl>
        <SelectControl label="Collection" value={filters.subcategory} onChange={(subcategory) => onFilter({ subcategory })}>
          <option value="all">All Collections</option>
          {subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
        </SelectControl>
        <SelectControl label="Item type" value={filters.type} onChange={(type) => onFilter({ type })}>
          <option value="all">All item types</option>
          <option value="Packed">Packed</option>
          <option value="Loose">Loose</option>
        </SelectControl>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {['all', 'Veg', 'Non-veg'].map((diet) => (
          <button
            className={`tap-lift rounded-full border px-3 py-1.5 text-[11px] font-black ${filters.diet === diet ? dietStyles[diet] : 'border-[#dde5da] bg-white text-[#647267] active:border-[#b8c8bc] active:bg-[#f8faf7]'}`}
            key={diet}
            type="button"
            onClick={() => onFilter({ diet })}
          >
            {diet === 'all' ? 'All' : diet}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MasterListModal({ categories, masterProducts, onClose, onUseProduct }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const visibleProducts = masterProducts.filter((product) => (
    !normalizedQuery ||
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.brand?.toLowerCase().includes(normalizedQuery) ||
    product.subcategory.toLowerCase().includes(normalizedQuery) ||
    categoryNameById.get(product.categoryId)?.toLowerCase().includes(normalizedQuery)
  ))

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#11181466] p-4 sm:p-6">
      <section className="ui-enter grid max-h-[min(78dvh,640px)] w-full max-w-[620px] grid-rows-[auto_1fr] overflow-hidden rounded-[22px] border border-[#dde5da] bg-[#fbfcf8] shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
        <header className="border-b border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Master catalog</p>
              <h2 className="truncate text-[19px] font-black">Master product list</h2>
              <p className="mt-0.5 text-[12px] font-semibold text-[#647267]">Reusable catalog items ready to attach to this seller shop.</p>
            </div>
            <button className="tap-lift grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[#dde5da] bg-white active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose} aria-label="Close master list">
              <X className="h-4 w-4" />
            </button>
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-white px-3 text-[#647267] focus-within:border-[#173f2a]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search master products..."
            />
          </label>
        </header>

        <div className="grid min-h-0 gap-2 overflow-y-auto overscroll-contain p-3">
          {visibleProducts.map((product) => (
            <article className="rounded-[16px] border border-[#dde5da] bg-white p-3 shadow-[0_8px_18px_rgba(23,63,42,0.06)]" key={product.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-[14px] font-black text-[#111814]">{product.name}</strong>
                  <p className="mt-1 text-[11px] font-bold text-[#647267]">{categoryNameById.get(product.categoryId) || 'Uncategorized'} / {product.subcategory}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-[#647267]">{product.description || 'No description added.'}</p>
                </div>
                <StatusBadge status={product.dietType === 'Veg' ? 'Available' : 'Hidden'} />
              </div>
              <button className="tap-lift mt-3 min-h-10 w-full rounded-[13px] bg-[#173f2a] text-[12px] font-black text-white active:bg-[#08783c]" type="button" onClick={() => onUseProduct(product)}>
                Use this product
              </button>
            </article>
          ))}
          {visibleProducts.length === 0 && (
            <div className="rounded-[16px] border border-[#dde5da] bg-white p-6 text-center">
              <strong className="block text-[14px] font-black">No master products found</strong>
              <p className="mt-1 text-[12px] font-semibold text-[#647267]">Try another product, brand, or category.</p>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}

export function ProductCard({ product, index, onEdit, onInventory, onDelete, onToggle }) {
  const discount = product.mrp && product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0

  return (
    <article className="tap-lift flex min-w-0 flex-col rounded-[16px] border border-[#dde5da] bg-white p-2 shadow-[0_8px_18px_rgba(23,63,42,0.08)] hover:border-[#b8c8bc] hover:shadow-[0_14px_28px_rgba(23,63,42,0.12)]">
      <div className="relative grid aspect-[4/3] place-items-center rounded-[12px] bg-[#eef2f0] text-center text-[10px] font-black uppercase text-[#8a978d]">
        <span className="absolute left-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#647267]">#{index + 1}</span>
        {product.master.imageUrl ? <img src={product.master.imageUrl} alt="" className="h-full w-full rounded-[12px] object-cover" /> : 'No image'}
      </div>
      <h3 className="mt-2 min-h-[30px] text-[12px] font-black leading-tight">{product.master.name}</h3>
      <div className="mt-2 flex items-baseline gap-1 text-[12px] font-black text-[#173f2a]">
        <span>Rs {product.sellingPrice}</span>
        {product.mrp && <span className="text-[10px] text-[#647267] line-through">Rs {product.mrp}</span>}
      </div>
      {discount > 0 && (
        <div className="mt-1 flex gap-1">
          <span className="rounded-full bg-[#dff8e8] px-1.5 py-0.5 text-[8px] font-black text-[#08783c]">{discount}% off</span>
        </div>
      )}
      <button className="tap-lift mt-2 w-full rounded-full active:bg-[#fff6e9]" type="button" onClick={onInventory}>
        <StatusBadge status={product.stockStatus} />
      </button>
      <div className="mt-auto grid grid-cols-3 gap-1 pt-2">
        <button className="tap-lift grid h-9 place-items-center rounded-[10px] border border-[#dde5da] text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={onEdit} aria-label="Edit product">
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button className="tap-lift grid h-9 place-items-center rounded-[10px] border border-[#efafa3] text-[#b63a25] active:bg-[#fff2ef]" type="button" onClick={onDelete} aria-label="Delete product">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button className={`tap-lift grid h-9 place-items-center rounded-[10px] border ${product.status === 'Hidden' ? 'border-[#77d69c] text-[#08783c] active:bg-[#dff8e8]' : 'border-[#f3d38d] text-[#9a6500] active:bg-[#fff6e9]'}`} type="button" onClick={onToggle} aria-label={product.status === 'Hidden' ? 'Show product' : 'Hide product'}>
          <EyeOff className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}

export function ProductTable({ products, onEdit, onInventory, onDelete, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dde5da] bg-white shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[12px]">
          <thead className="border-b border-[#e6ebe6] bg-[#f8faf7] text-[10px] font-black uppercase text-[#647267]">
            <tr>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2ee]">
            {products.map((product) => (
              <tr className="hover:bg-[#f8faf7]" key={product.id}>
                <td className="px-3 py-3 font-black text-[#111814]">{product.master.name}</td>
                <td className="px-3 py-3 font-bold text-[#647267]">{product.category?.name || 'Uncategorized'} / {product.master.subcategory}</td>
                <td className="px-3 py-3 font-black text-[#173f2a]">Rs {product.sellingPrice}</td>
                <td className="px-3 py-3 font-bold text-[#647267]">{product.type}</td>
                <td className="px-3 py-3"><button type="button" onClick={() => onInventory(product)}><StatusBadge status={product.stockStatus} /></button></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="tap-lift grid h-8 w-8 place-items-center rounded-[10px] text-[#173f2a] hover:bg-[#edf5ed]" type="button" onClick={() => onEdit(product)} aria-label="Edit product"><Edit3 className="h-4 w-4" /></button>
                    <button className="tap-lift grid h-8 w-8 place-items-center rounded-[10px] text-[#b63a25] hover:bg-[#fff2ef]" type="button" onClick={() => onDelete(product)} aria-label="Delete product"><Trash2 className="h-4 w-4" /></button>
                    <button className="tap-lift grid h-8 w-8 place-items-center rounded-[10px] text-[#647267] hover:bg-[#f8faf7]" type="button" onClick={() => onToggle(product)} aria-label="Toggle product"><EyeOff className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ImageUploader() {
  return (
    <button className="tap-lift grid min-h-[110px] place-items-center rounded-[16px] border border-dashed border-[#b8c5bc] bg-[#f8faf7] text-center active:border-[#173f2a] active:bg-[#edf5ed]" type="button">
      <span>
        <Upload className="mx-auto mb-2 h-5 w-5 text-[#173f2a]" />
        <strong className="block text-[12px] font-black">Upload image</strong>
        <small className="text-[#647267]">Firebase Storage later</small>
      </span>
    </button>
  )
}

export function ProductForm({ categories, masterProducts, mode, product, selectedMasterProduct, onClose, onSave }) {
  const firstCategory = product?.category?.id || selectedMasterProduct?.categoryId || categories[0]?.id || ''
  const [form, setForm] = useState({
    categoryId: firstCategory,
    subcategory: product?.master?.subcategory || selectedMasterProduct?.subcategory || categories[0]?.subcategories[0] || '',
    masterProductId: product?.masterProductId || selectedMasterProduct?.id || '',
    name: product?.master?.name || selectedMasterProduct?.name || '',
    brand: product?.master?.brand || selectedMasterProduct?.brand || '',
    description: product?.master?.description || selectedMasterProduct?.description || '',
    type: product?.type || 'Packed',
    sellingPrice: product?.sellingPrice || '',
    mrp: product?.mrp || '',
    inventoryQuantity: product?.inventoryQuantity || '',
    inventoryUnit: product?.inventoryUnit || 'Piece',
    priceUnit: product?.priceUnit || 'kg',
    minimumOrderQuantity: product?.minimumOrderQuantity || '',
    maximumOrderQuantity: product?.maximumOrderQuantity || '',
    availability: product?.availability || 'Available',
  })
  const [errors, setErrors] = useState({})

  const category = categories.find((item) => item.id === form.categoryId)
  const categoryMasters = masterProducts.filter((item) => item.categoryId === form.categoryId)

  const update = (field, value) => {
    const numericFields = ['sellingPrice', 'mrp', 'inventoryQuantity', 'minimumOrderQuantity', 'maximumOrderQuantity']
    const nextValue = numericFields.includes(field) ? decimalOnly(value, 8) : value
    setForm((current) => ({ ...current, [field]: nextValue }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const saveForm = () => {
    const rules = {
      sellingPrice: { required: true, pattern: patterns.positiveNumber, min: 0.01, message: 'Enter valid price' },
      inventoryQuantity: { required: true, pattern: patterns.positiveNumber, min: 0, message: 'Enter stock' },
      inventoryUnit: { required: true, pattern: /^[A-Za-z][A-Za-z\s/.-]{0,19}$/, message: 'Letters only' },
      name: { required: !form.masterProductId && mode !== 'edit', pattern: /^.{2,80}$/, message: 'Required' },
      mrp: { required: form.type === 'Packed', pattern: patterns.positiveNumber, min: 0.01, message: 'Enter valid MRP' },
      sku: { required: form.type === 'Packed', pattern: /^[A-Za-z0-9-]{2,32}$/, message: 'Invalid SKU' },
      priceUnit: { required: form.type === 'Loose', pattern: /^[A-Za-z][A-Za-z\s/.-]{0,19}$/, message: 'Letters only' },
      minimumOrderQuantity: { required: form.type === 'Loose', pattern: patterns.positiveNumber, min: 0.01, message: 'Required' },
      maximumOrderQuantity: { required: form.type === 'Loose', pattern: patterns.positiveNumber, min: 0.01, message: 'Required' },
    }
    const nextErrors = validateFieldsByRules(form, rules)

    if (form.type === 'Packed' && Number(form.mrp) < Number(form.sellingPrice)) {
      nextErrors.mrp = 'MRP must be >= price'
    }
    if (form.type === 'Loose' && Number(form.maximumOrderQuantity) < Number(form.minimumOrderQuantity)) {
      nextErrors.maximumOrderQuantity = 'Must be >= minimum'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#11181466] p-4 sm:p-6">
      <section className="ui-enter grid max-h-[min(74dvh,620px)] w-full max-w-[660px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] bg-[#fbfcf8] shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
        <header className="border-b border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[#173f2a]">
                <Boxes className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">{mode === 'edit' ? 'Edit Product' : 'Add Product'}</p>
                <h2 className="truncate text-[18px] font-black">{mode === 'edit' ? product.master.name : 'Create shop item'}</h2>
                <p className="mt-0.5 text-[12px] font-semibold text-[#647267]">Attach catalog data, pricing, and inventory in one clean setup.</p>
              </div>
            </div>
            <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="grid min-h-0 gap-3 overflow-y-auto overscroll-contain p-3.5 sm:p-4">
          {mode !== 'edit' && (
            <FormSection title="Catalog placement" copy="Choose where this seller product belongs.">
              <div className="grid gap-3 md:grid-cols-3">
                <SelectField label="Category" value={form.categoryId} onChange={(value) => update('categoryId', value)}>
                  {categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </SelectField>
                <SelectField label="Subcategory" value={form.subcategory} onChange={(value) => update('subcategory', value)}>
                  {(category?.subcategories || []).map((item) => <option value={item} key={item}>{item}</option>)}
                </SelectField>
                <SelectField label="Master Product" value={form.masterProductId} onChange={(value) => update('masterProductId', value)}>
                  <option value="">Add New Product</option>
                  {categoryMasters.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </SelectField>
              </div>
            </FormSection>
          )}

          {!form.masterProductId && mode !== 'edit' && (
            <FormSection title="Product identity" copy="Name and describe the item customers will see.">
              <div className="grid gap-3 md:grid-cols-2">
                <Input error={errors.name} label="Name" value={form.name} onChange={(value) => update('name', value)} placeholder="Basmati Rice 1kg" />
                <Input label="Brand optional" value={form.brand} onChange={(value) => update('brand', value)} placeholder="Daily Gold" />
              </div>
              <Input label="Description" value={form.description} onChange={(value) => update('description', value)} placeholder="Short product details" />
              <ImageUploader />
            </FormSection>
          )}

          <FormSection title="Pricing model" copy="Packed items use MRP and SKU, loose items use quantity rules.">
            <div className="grid grid-cols-2 gap-2">
              {['Packed', 'Loose'].map((type) => (
                <button className={`tap-lift rounded-[16px] border p-3 text-left ${form.type === type ? (type === 'Loose' ? 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]' : 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]') : 'border-[#dde5da] bg-white active:bg-[#f8faf7]'}`} key={type} type="button" onClick={() => update('type', type)}>
                  <strong className="block text-[13px] font-black">{type}</strong>
                  <span className="text-[10px] font-bold opacity-75">{type === 'Packed' ? 'Fixed pack / SKU' : 'Sold by unit or weight'}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input error={errors.sellingPrice} label="Selling Price" value={form.sellingPrice} onChange={(value) => update('sellingPrice', value)} placeholder="110" inputMode="decimal" />
              {form.type === 'Packed' ? (
                <>
                  <Input error={errors.mrp} label="MRP" value={form.mrp} onChange={(value) => update('mrp', value)} placeholder="140" inputMode="decimal" />
                  <Input error={errors.sku} label="SKU" value={form.sku} onChange={(value) => update('sku', value.toUpperCase())} placeholder="SKU-001" />
                </>
              ) : (
                <>
                  <SelectField label="Price Unit" value={form.priceUnit} onChange={(value) => update('priceUnit', value)}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                  </SelectField>
                  <Input error={errors.minimumOrderQuantity} label="Minimum Qty" value={form.minimumOrderQuantity} onChange={(value) => update('minimumOrderQuantity', value)} placeholder="1" inputMode="decimal" />
                  <Input error={errors.maximumOrderQuantity} label="Maximum Qty" value={form.maximumOrderQuantity} onChange={(value) => update('maximumOrderQuantity', value)} placeholder="25" inputMode="decimal" />
                </>
              )}
            </div>
          </FormSection>

          <FormSection title="Inventory" copy="Keep seller stock and units ready for orders.">
            <div className="grid gap-3 md:grid-cols-2">
              <Input error={errors.inventoryQuantity} label="Inventory Quantity" value={form.inventoryQuantity} onChange={(value) => update('inventoryQuantity', value)} placeholder="18" inputMode="decimal" />
              <SelectField label="Inventory Unit" value={form.inventoryUnit} onChange={(value) => update('inventoryUnit', value)}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
              </SelectField>
            </div>
          </FormSection>
        </div>

        <footer className="grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <button className="tap-lift rounded-[16px] border border-[#dde5da] bg-white py-3 text-[13px] font-black active:bg-[#f8faf7]" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="tap-lift min-h-12 rounded-[16px] bg-[#173f2a] text-[13px] font-black text-white active:bg-[#08783c]" type="button" onClick={saveForm}>
            Save Product
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

function FormSection({ title, copy, children }) {
  return (
    <section className="grid gap-3 rounded-[18px] border border-[#dde5da] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)] sm:p-3.5">
      <div>
        <h3 className="text-[13px] font-black text-[#111814]">{title}</h3>
        <p className="mt-0.5 text-[11px] font-semibold text-[#647267]">{copy}</p>
      </div>
      {children}
    </section>
  )
}

function FieldLike({ label, children, error }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-[0.06em] text-[#647267]">
        {label}
        {error && <span className="normal-case tracking-normal text-[#b63a25]">{error}</span>}
      </span>
      {children}
    </label>
  )
}

function Input({ label, value, onChange, placeholder, inputMode, error }) {
  return (
    <FieldLike label={label} error={error}>
      <input
        className={`tap-lift h-12 rounded-[15px] border bg-[#fbfcf8] px-3 text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </FieldLike>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <FieldLike label={label}>
      <span className="relative block">
        <select
          className="tap-lift h-12 w-full appearance-none rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 pr-10 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647267]" />
      </span>
    </FieldLike>
  )
}

export function InventoryModal({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState(product.inventoryQuantity)

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-end bg-[#11181466] sm:place-items-center">
      <section className="w-full rounded-t-[24px] bg-[#fbfcf8] p-4 sm:max-w-[520px] sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Update Inventory</h2>
          <button className="tap-lift rounded-[10px] p-2 active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-[13px] font-bold text-[#647267]">Current stock: {product.inventoryQuantity} {product.inventoryUnit}</p>
        <Input label="Set Exact Quantity" value={quantity} onChange={setQuantity} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="tap-lift rounded-[14px] border border-[#77d69c] py-3 text-[12px] font-black text-[#08783c] active:bg-[#dff8e8]" type="button" onClick={() => setQuantity(Number(quantity) + 1)}>Add</button>
          <button className="tap-lift rounded-[14px] border border-[#efafa3] py-3 text-[12px] font-black text-[#b63a25] active:bg-[#fff2ef]" type="button" onClick={() => setQuantity(Math.max(0, Number(quantity) - 1))}>Remove</button>
          <button className="tap-lift rounded-[14px] bg-[#173f2a] py-3 text-[12px] font-black text-white active:bg-[#08783c]" type="button" onClick={() => onSave(Number(quantity))}>Save</button>
        </div>
        <div className="mt-4 rounded-[16px] border border-[#dde5da] bg-white p-3">
          <p className="text-[10px] font-black uppercase text-[#647267]">Inventory History</p>
          <p className="mt-2 text-[12px] font-bold">Mock: Stock checked today.</p>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export function DeleteDialog({ product, onCancel, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-center bg-[#11181466] p-4">
      <section className="w-full max-w-[360px] rounded-[22px] bg-white p-4">
        <AlertTriangle className="mb-3 h-7 w-7 text-[#b63a25]" />
        <h2 className="text-lg font-black">Delete seller product?</h2>
        <p className="mt-1 text-[13px] font-semibold text-[#647267]">This removes only {product.master.name} from your shop. Master product remains safe.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="tap-lift rounded-[14px] border border-[#dde5da] py-3 text-[12px] font-black active:bg-[#f8faf7]" type="button" onClick={onCancel}>Cancel</button>
          <button className="tap-lift rounded-[14px] bg-[#b63a25] py-3 text-[12px] font-black text-white active:bg-[#8f2d1d]" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
