import { useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  Search,
  Upload,
  X,
} from 'lucide-react'

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
        placeholder="Search items, combos, menu names..."
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

export function FilterBar({ categories, filters, onFilter }) {
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
        <button className="tap-lift rounded-[13px] border border-[#dde5da] px-3 text-[11px] font-black active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]" type="button">
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

export function ProductCard({ product, index, onEdit, onInventory, onDelete, onToggle }) {
  const discount = product.mrp && product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0

  return (
    <article className="tap-lift w-[132px] rounded-[16px] border border-[#dde5da] bg-white p-2 shadow-[0_8px_18px_rgba(23,63,42,0.08)] hover:border-[#b8c8bc] hover:shadow-[0_14px_28px_rgba(23,63,42,0.12)]">
      <div className="relative grid h-[74px] place-items-center rounded-[12px] bg-[#eef2f0] text-center text-[10px] font-black uppercase text-[#8a978d]">
        <span className="absolute left-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#647267]">#{index + 1}</span>
        {product.master.imageUrl ? <img src={product.master.imageUrl} alt="" className="h-full w-full rounded-[12px] object-cover" /> : 'No image'}
      </div>
      <h3 className="mt-2 min-h-[30px] text-[11px] font-black leading-tight">{product.master.name}</h3>
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
      <div className="mt-2 grid grid-cols-2 gap-1">
        <button className="tap-lift rounded-[10px] border border-[#dde5da] py-2 text-[10px] font-black active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]" type="button" onClick={onEdit}>Edit</button>
        <button className="tap-lift rounded-[10px] border border-[#efafa3] py-2 text-[10px] font-black text-[#b63a25] active:bg-[#fff2ef]" type="button" onClick={onDelete}>Delete</button>
      </div>
      <button className={`tap-lift mt-1 w-full rounded-[10px] border py-1.5 text-[10px] font-black ${product.status === 'Hidden' ? 'border-[#77d69c] text-[#08783c] active:bg-[#dff8e8]' : 'border-[#f3d38d] text-[#9a6500] active:bg-[#fff6e9]'}`} type="button" onClick={onToggle}>
        {product.status === 'Hidden' ? 'Show' : 'Hide'}
      </button>
    </article>
  )
}

export function ProductTable({ products, onEdit, onInventory, onDelete, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dde5da] bg-white">
      <div className="grid grid-cols-[1.4fr_.8fr_.8fr_.7fr] gap-2 border-b border-[#e6ebe6] px-3 py-2 text-[10px] font-black uppercase text-[#647267]">
        <span>Name</span><span>Type</span><span>Stock</span><span>Actions</span>
      </div>
      {products.map((product) => (
        <div className="grid grid-cols-[1.4fr_.8fr_.8fr_.7fr] items-center gap-2 border-b border-[#eef2ee] px-3 py-3 text-[11px]" key={product.id}>
          <span className="font-black">{product.master.name}</span>
          <span>{product.type}</span>
          <StatusBadge status={product.stockStatus} />
          <button className="tap-lift rounded-[10px] px-2 py-1 font-black text-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={() => onEdit(product)}>Edit</button>
        </div>
      ))}
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

export function ProductForm({ categories, masterProducts, mode, product, onClose, onSave }) {
  const firstCategory = product?.category?.id || categories[0]?.id || ''
  const [form, setForm] = useState({
    categoryId: firstCategory,
    subcategory: product?.master?.subcategory || categories[0]?.subcategories[0] || '',
    masterProductId: product?.masterProductId || '',
    name: product?.master?.name || '',
    brand: product?.master?.brand || '',
    description: product?.master?.description || '',
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

  const category = categories.find((item) => item.id === form.categoryId)
  const categoryMasters = masterProducts.filter((item) => item.categoryId === form.categoryId)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <div className="fixed inset-0 z-30 grid place-items-end bg-[#11181466] sm:place-items-center">
      <section className="max-h-[92svh] w-full overflow-auto rounded-t-[24px] bg-[#fbfcf8] p-4 sm:max-w-[720px] sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">{mode === 'edit' ? 'Edit Product' : 'Add Product'}</p>
            <h2 className="text-xl font-black">{mode === 'edit' ? product.master.name : 'Create shop item'}</h2>
          </div>
          <button className="tap-lift grid h-10 w-10 place-items-center rounded-[14px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>

        <div className="grid gap-3">
          {mode !== 'edit' && (
            <>
              <FieldLike label="Category">
                <select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} className="form-select">
                  {categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              </FieldLike>
              <FieldLike label="Subcategory">
                <select value={form.subcategory} onChange={(event) => update('subcategory', event.target.value)} className="form-select">
                  {(category?.subcategories || []).map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </FieldLike>
              <FieldLike label="Master Product">
                <select value={form.masterProductId} onChange={(event) => update('masterProductId', event.target.value)} className="form-select">
                  <option value="">Add New Product</option>
                  {categoryMasters.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              </FieldLike>
            </>
          )}

          {!form.masterProductId && mode !== 'edit' && (
            <>
              <Input label="Name" value={form.name} onChange={(value) => update('name', value)} />
              <Input label="Brand optional" value={form.brand} onChange={(value) => update('brand', value)} />
              <Input label="Description" value={form.description} onChange={(value) => update('description', value)} />
              <ImageUploader />
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            {['Packed', 'Loose'].map((type) => (
              <button className={`tap-lift rounded-[14px] border p-3 text-[12px] font-black ${form.type === type ? (type === 'Loose' ? 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]' : 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]') : 'border-[#dde5da] bg-white active:bg-[#f8faf7]'}`} key={type} type="button" onClick={() => update('type', type)}>
                {type}
              </button>
            ))}
          </div>

          <Input label="Selling Price" value={form.sellingPrice} onChange={(value) => update('sellingPrice', value)} />
          {form.type === 'Packed' ? (
            <>
              <Input label="MRP" value={form.mrp} onChange={(value) => update('mrp', value)} />
              <Input label="SKU" value={form.sku} onChange={(value) => update('sku', value)} />
            </>
          ) : (
            <>
              <Input label="Price Unit" value={form.priceUnit} onChange={(value) => update('priceUnit', value)} />
              <Input label="Minimum Order Quantity" value={form.minimumOrderQuantity} onChange={(value) => update('minimumOrderQuantity', value)} />
              <Input label="Maximum Order Quantity" value={form.maximumOrderQuantity} onChange={(value) => update('maximumOrderQuantity', value)} />
            </>
          )}
          <Input label="Inventory Quantity" value={form.inventoryQuantity} onChange={(value) => update('inventoryQuantity', value)} />
          <Input label="Inventory Unit" value={form.inventoryUnit} onChange={(value) => update('inventoryUnit', value)} />
          <button className="tap-lift min-h-12 rounded-[16px] bg-[#173f2a] text-[13px] font-black text-white active:bg-[#08783c]" type="button" onClick={() => onSave(form)}>
            Save Product
          </button>
        </div>
      </section>
    </div>
  )
}

function FieldLike({ label, children }) {
  return <label className="grid gap-1 text-[12px] font-black text-[#26342b]">{label}{children}</label>
}

function Input({ label, value, onChange }) {
  return (
    <FieldLike label={label}>
      <input className="h-11 rounded-[14px] border border-[#dde5da] bg-white px-3 text-[13px] font-bold outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </FieldLike>
  )
}

export function InventoryModal({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState(product.inventoryQuantity)

  return (
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
    </div>
  )
}

export function DeleteDialog({ product, onCancel, onConfirm }) {
  return (
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
    </div>
  )
}
