import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  Edit3,
  EyeOff,
  SlidersHorizontal,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { decimalOnly, validateFieldsByRules, patterns } from '../../utils/validation'

function productTypeLabel(type) {
  return type === 'Packed' ? 'Sealed packets' : 'Loose product'
}

function stockUnit(productOrForm) {
  return productOrForm?.type === 'Packed' ? 'packets' : productOrForm?.inventoryUnit || 'units'
}

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
    <div className="tap-lift rounded-[16px] border border-white/90 bg-white p-3 shadow-[0_18px_34px_rgba(0,0,0,0.16),0_3px_8px_rgba(0,0,0,0.07)] hover:border-white hover:shadow-[0_24px_44px_rgba(0,0,0,0.2),0_8px_18px_rgba(0,0,0,0.1)]">
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
    <label className="tap-lift flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-white px-3 text-[#647267] shadow-[0_1px_2px_rgba(16,24,32,0.06),0_8px_18px_rgba(16,24,32,0.06)] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1),0_14px_28px_rgba(16,24,32,0.1)]">
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

export function FilterBar({ filters, onFilter, onOpenFilters, onOpenMasterList }) {
  const activeHierarchyFilters = [filters.category, filters.subcategory, filters.type].filter((value) => value !== 'all').length
  const dietStyles = {
    all: 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]',
    Veg: 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]',
    'Non-veg': 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
  }

  return (
    <div className="rounded-[18px] border border-[#dde5da] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
        <SearchBar value={filters.search} onChange={(search) => onFilter({ search })} />
        <button className="tap-lift relative grid h-12 w-12 place-items-center rounded-[14px] border border-[#dde5da] bg-white text-[#173f2a] shadow-[0_8px_18px_rgba(23,63,42,0.06)] active:border-[#173f2a] active:bg-[#edf5ed]" type="button" onClick={onOpenFilters} aria-label="Open product filters">
          <SlidersHorizontal className="h-5 w-5" />
          {activeHierarchyFilters > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#173f2a] px-1 text-[10px] font-black text-white">{activeHierarchyFilters}</span>
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="tap-lift rounded-[13px] border border-[#dde5da] px-3 text-[11px] font-black active:border-[#173f2a] active:bg-[#edf5ed] active:text-[#173f2a]" type="button" onClick={onOpenMasterList}>
          Master list
        </button>
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

function FilterChoice({ active, title, meta, onClick }) {
  return (
    <button
      className={`tap-lift flex min-h-12 items-center justify-between gap-3 rounded-[15px] border p-3 text-left shadow-[0_8px_18px_rgba(23,63,42,0.05)] ${
        active
          ? 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]'
          : 'border-[#edf1ed] bg-white text-[#26342b] active:border-[#173f2a] active:bg-[#edf5ed]'
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="min-w-0">
        <strong className="block truncate text-[13px] font-black">{title}</strong>
        {meta && <small className="block truncate text-[10px] font-bold text-[#647267]">{meta}</small>}
      </span>
      {active && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#173f2a]"></span>}
    </button>
  )
}

function DropdownFilter({ label, valueLabel, query, onQuery, children }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="grid gap-2">
      <span className="text-[12px] font-black text-[#647267]">{label}</span>
      <button
        className={`tap-lift flex min-h-12 items-center justify-between gap-3 rounded-[13px] border bg-white px-3 text-left shadow-[0_8px_18px_rgba(23,63,42,0.05)] ${
          open ? 'border-[#173f2a] shadow-[0_0_0_4px_rgba(23,63,42,0.08),0_12px_24px_rgba(23,63,42,0.1)]' : 'border-[#dde5da]'
        }`}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate text-[13px] font-bold text-[#647267]">{valueLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9aa79d] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ui-enter grid gap-2 rounded-[16px] border border-[#dde5da] bg-[#fbfcf8] p-2 shadow-[0_14px_30px_rgba(23,63,42,0.1)]">
          <label className="flex min-h-10 items-center gap-2 rounded-[13px] border border-[#dde5da] bg-white px-3 text-[#647267] focus-within:border-[#173f2a]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d]"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
            />
          </label>
          <div className="grid max-h-[170px] gap-2 overflow-y-auto overscroll-contain pr-1">
            {children}
          </div>
        </div>
      )}
    </section>
  )
}

export function ProductFilterModal({ categories, filters, onClose, onFilter }) {
  const [categoryQuery, setCategoryQuery] = useState('')
  const [subcategoryQuery, setSubcategoryQuery] = useState('')
  const [typeQuery, setTypeQuery] = useState('')
  const selectedCategory = categories.find((category) => category.id === filters.category)
  const subcategories = (selectedCategory ? selectedCategory.subcategories : categories.flatMap((category) => category.subcategories))
    .filter((item, index, list) => list.indexOf(item) === index)
  const productTypes = ['Packed', 'Loose']
  const normalizedCategoryQuery = categoryQuery.trim().toLowerCase()
  const normalizedSubcategoryQuery = subcategoryQuery.trim().toLowerCase()
  const normalizedTypeQuery = typeQuery.trim().toLowerCase()
  const visibleCategories = categories.filter((category) => !normalizedCategoryQuery || category.name.toLowerCase().includes(normalizedCategoryQuery))
  const visibleSubcategories = subcategories.filter((subcategory) => !normalizedSubcategoryQuery || subcategory.toLowerCase().includes(normalizedSubcategoryQuery))
  const visibleTypes = productTypes.filter((type) => !normalizedTypeQuery || productTypeLabel(type).toLowerCase().includes(normalizedTypeQuery) || type.toLowerCase().includes(normalizedTypeQuery))
  const selectedTypeLabel = filters.type === 'all' ? 'All products' : productTypeLabel(filters.type)
  const selectedCategoryLabel = selectedCategory?.name || 'All Categories'
  const selectedSubcategoryLabel = filters.subcategory === 'all' ? 'All Collections' : filters.subcategory

  const updateFilter = (patch) => {
    onFilter(patch)
  }

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#11181466] p-4 sm:p-6">
      <section className="ui-enter grid max-h-[min(78dvh,660px)] w-full max-w-[660px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] bg-[#fbfcf8] shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
        <header className="border-b border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="icon-chip grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[#173f2a]">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Product Filters</p>
                <h2 className="truncate text-[18px] font-black">Catalog hierarchy</h2>
                <p className="mt-0.5 text-[12px] font-semibold text-[#647267]">Filter products by category, sub-categories, and product format.</p>
              </div>
            </div>
            <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose} aria-label="Close filters"><X className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="grid min-h-0 gap-3 overflow-y-auto overscroll-contain p-3.5 sm:p-4">
          <DropdownFilter label="Category" valueLabel={selectedCategoryLabel} query={categoryQuery} onQuery={setCategoryQuery}>
            <FilterChoice active={filters.category === 'all'} title="All categories" onClick={() => updateFilter({ category: 'all', subcategory: 'all' })} />
            {visibleCategories.map((category) => (
              <FilterChoice
                active={filters.category === category.id}
                key={category.id}
                title={category.name}
                meta={`${category.subcategories.length} sub-categories`}
                onClick={() => updateFilter({ category: category.id, subcategory: 'all' })}
              />
            ))}
            {visibleCategories.length === 0 && <p className="rounded-[14px] bg-[#f8faf7] p-3 text-[12px] font-bold text-[#647267]">No categories found.</p>}
          </DropdownFilter>

          <DropdownFilter label="Collection" valueLabel={selectedSubcategoryLabel} query={subcategoryQuery} onQuery={setSubcategoryQuery}>
            <FilterChoice active={filters.subcategory === 'all'} title="All sub-categories" meta={selectedCategory?.name || 'Every category'} onClick={() => updateFilter({ subcategory: 'all' })} />
            {visibleSubcategories.map((subcategory) => (
              <FilterChoice active={filters.subcategory === subcategory} key={subcategory} title={subcategory} onClick={() => updateFilter({ subcategory })} />
            ))}
            {visibleSubcategories.length === 0 && <p className="rounded-[14px] bg-[#f8faf7] p-3 text-[12px] font-bold text-[#647267]">No sub-categories found.</p>}
          </DropdownFilter>

          <DropdownFilter label="Product" valueLabel={selectedTypeLabel} query={typeQuery} onQuery={setTypeQuery}>
            <FilterChoice active={filters.type === 'all'} title="All products" onClick={() => updateFilter({ type: 'all' })} />
            {visibleTypes.map((type) => (
              <FilterChoice active={filters.type === type} key={type} title={productTypeLabel(type)} onClick={() => updateFilter({ type })} />
            ))}
            {visibleTypes.length === 0 && <p className="rounded-[14px] bg-[#f8faf7] p-3 text-[12px] font-bold text-[#647267]">No products found.</p>}
          </DropdownFilter>
        </div>

        <footer className="grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <button className="tap-lift rounded-[16px] border border-[#dde5da] bg-white py-3 text-[13px] font-black active:bg-[#f8faf7]" type="button" onClick={() => updateFilter({ category: 'all', subcategory: 'all', type: 'all' })}>
            Reset
          </button>
          <button className="tap-lift min-h-12 rounded-[16px] bg-[#173f2a] text-[13px] font-black text-white active:bg-[#08783c]" type="button" onClick={onClose}>
            Apply filters
          </button>
        </footer>
      </section>
    </div>,
    document.body,
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
  const stockTagStyles = {
    Available: 'border-[#97d7aa] bg-[#f0fff5] text-[#08783c]',
    'Low stock': 'border-[#edc26e] bg-[#fff6e9] text-[#9a6500]',
    'Out of stock': 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
  }

  return (
    <article className="tap-lift flex min-w-0 flex-col rounded-[16px] border border-white/90 bg-white p-2 shadow-[0_18px_34px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.08)] hover:border-white hover:shadow-[0_24px_44px_rgba(0,0,0,0.22),0_8px_18px_rgba(0,0,0,0.1)]">
      <button className={`tap-lift mb-2 inline-flex min-h-8 w-fit max-w-full items-center rounded-full border px-2.5 text-[10px] font-black ${stockTagStyles[product.stockStatus] || stockTagStyles.Available}`} type="button" onClick={onInventory}>
        {product.stockStatus}
      </button>
      <div className="relative grid aspect-[4/3] place-items-center rounded-[12px] bg-[#eef2f0] text-center text-[10px] font-black uppercase text-[#8a978d]">
        <span className="absolute left-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#647267]">#{index + 1}</span>
        {product.master.imageUrl ? <img src={product.master.imageUrl} alt="" className="h-full w-full rounded-[12px] object-cover" /> : 'No image'}
      </div>
      <h3 className="mt-2 min-h-[30px] text-[12px] font-black leading-tight">{product.master.name}</h3>
      <div className="mt-2 flex items-baseline gap-1 text-[12px] font-black text-[#173f2a]">
        <span>Rs {product.sellingPrice}</span>
        <span className="text-[10px] text-[#647267]">/ {stockUnit(product)}</span>
        {product.mrp && <span className="text-[10px] text-[#647267] line-through">Rs {product.mrp}</span>}
      </div>
      <p className="mt-1 truncate text-[10px] font-bold text-[#647267]">Stock: {product.inventoryQuantity} {stockUnit(product)}</p>
      {discount > 0 && (
        <div className="mt-1 flex gap-1">
          <span className="rounded-full bg-[#dff8e8] px-1.5 py-0.5 text-[8px] font-black text-[#08783c]">{discount}% off</span>
        </div>
      )}
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
    <div className="overflow-hidden rounded-[18px] border border-white/90 bg-white shadow-[0_18px_34px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[12px]">
          <thead className="border-b border-[#e6ebe6] bg-[#f8faf7] text-[10px] font-black uppercase text-[#647267]">
            <tr>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Product</th>
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
                <td className="px-3 py-3 font-bold text-[#647267]">{productTypeLabel(product.type)}</td>
                <td className="px-3 py-3">
                  <button className="grid gap-1 text-left" type="button" onClick={() => onInventory(product)}>
                    <StatusBadge status={product.stockStatus} />
                    <span className="text-[10px] font-black text-[#647267]">{product.inventoryQuantity} {stockUnit(product)}</span>
                  </button>
                </td>
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
  const initialType = product?.type || 'Packed'
  const [form, setForm] = useState({
    categoryId: firstCategory,
    subcategory: product?.master?.subcategory || selectedMasterProduct?.subcategory || categories[0]?.subcategories[0] || '',
    masterProductId: product?.masterProductId || selectedMasterProduct?.id || '',
    name: product?.master?.name || selectedMasterProduct?.name || '',
    brand: product?.master?.brand || selectedMasterProduct?.brand || '',
    description: product?.master?.description || selectedMasterProduct?.description || '',
    type: initialType,
    sellingPrice: product?.sellingPrice || '',
    mrp: product?.mrp || '',
    inventoryQuantity: product?.inventoryQuantity || '',
    inventoryUnit: initialType === 'Packed' ? 'Packets' : product?.inventoryUnit || 'kg',
    priceUnit: product?.priceUnit || 'kg',
    minimumOrderQuantity: product?.minimumOrderQuantity || '',
    maximumOrderQuantity: product?.maximumOrderQuantity || '',
    availability: product?.availability || 'Available',
  })
  const [errors, setErrors] = useState({})

  const category = categories.find((item) => item.id === form.categoryId)
  const categoryMasters = masterProducts.filter((item) => item.categoryId === form.categoryId)
  const categoryOptions = categories.map((item) => ({ value: item.id, label: item.name, meta: `${item.subcategories.length} sub-categories` }))
  const subcategoryOptions = (category?.subcategories || []).map((item) => ({ value: item, label: item }))
  const masterProductOptions = [
    { value: '', label: 'Add New Product', meta: 'Create a fresh catalog item' },
    ...categoryMasters.map((item) => ({ value: item.id, label: item.name, meta: item.brand || item.subcategory })),
  ]
  const unitOptions = ['kg', 'g', 'mg'].map((item) => ({ value: item, label: item }))
  const inventoryUnitOptions = form.type === 'Packed'
    ? [{ value: 'Packets', label: 'Packets', meta: 'Sealed packet stock' }]
    : unitOptions

  const update = (field, value) => {
    const numericFields = ['sellingPrice', 'mrp', 'inventoryQuantity', 'minimumOrderQuantity', 'maximumOrderQuantity']
    const nextValue = numericFields.includes(field) ? decimalOnly(value, 8) : value
    setForm((current) => {
      if (field === 'type') {
        return {
          ...current,
          type: value,
          inventoryUnit: value === 'Packed' ? 'Packets' : 'kg',
        }
      }

      return { ...current, [field]: nextValue }
    })
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
                <h2 className="truncate text-[18px] font-black">{mode === 'edit' ? product.master.name : 'Create shop product'}</h2>
                <p className="mt-0.5 text-[12px] font-semibold text-[#647267]">Attach catalog data, pricing, and inventory in one clean setup.</p>
              </div>
            </div>
            <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="grid min-h-0 gap-3 overflow-y-auto overscroll-contain p-3.5 sm:p-4">
          {mode !== 'edit' && (
            <FormSection title="Catalog placement" copy="Choose where this seller product belongs.">
              <div className="grid items-start gap-3">
                <SearchableSelect
                  label="Category"
                  value={form.categoryId}
                  options={categoryOptions}
                  onChange={(value) => {
                    const nextCategory = categories.find((item) => item.id === value)
                    setForm((current) => ({
                      ...current,
                      categoryId: value,
                      subcategory: nextCategory?.subcategories[0] || '',
                      masterProductId: '',
                    }))
                  }}
                />
                <SearchableSelect
                  label="Subcategory"
                  value={form.subcategory}
                  options={subcategoryOptions}
                  onChange={(value) => {
                    setForm((current) => ({ ...current, subcategory: value, masterProductId: '' }))
                  }}
                  disabled={!subcategoryOptions.length}
                />
                <SearchableSelect label="Master Product" value={form.masterProductId} options={masterProductOptions} onChange={(value) => update('masterProductId', value)} />
              </div>
            </FormSection>
          )}

          {!form.masterProductId && mode !== 'edit' && (
            <FormSection title="Product identity" copy="Name and describe the product customers will see.">
              <div className="grid items-start gap-3 md:grid-cols-2">
                <Input error={errors.name} label="Name" value={form.name} onChange={(value) => update('name', value)} placeholder="Basmati Rice 1kg" />
                <Input label="Brand optional" value={form.brand} onChange={(value) => update('brand', value)} placeholder="Daily Gold" />
              </div>
              <Input label="Description" value={form.description} onChange={(value) => update('description', value)} placeholder="Short product details" />
              <ImageUploader />
            </FormSection>
          )}

          <FormSection title="Pricing model" copy="Sealed packets use packet stock, MRP, and SKU. Loose products use quantity rules.">
            <div className="grid grid-cols-2 gap-2">
              {['Packed', 'Loose'].map((type) => (
                <button className={`tap-lift rounded-[16px] border p-3 text-left ${form.type === type ? (type === 'Loose' ? 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]' : 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]') : 'border-[#dde5da] bg-white active:bg-[#f8faf7]'}`} key={type} type="button" onClick={() => update('type', type)}>
                  <strong className="block text-[13px] font-black">{productTypeLabel(type)}</strong>
                  <span className="text-[10px] font-bold opacity-75">{type === 'Packed' ? 'Sold as sealed packets' : 'Sold by unit or weight'}</span>
                </button>
              ))}
            </div>
            <div className="grid items-start gap-3">
              <Input error={errors.sellingPrice} label="Selling Price" value={form.sellingPrice} onChange={(value) => update('sellingPrice', value)} placeholder="110" inputMode="decimal" />
              {form.type === 'Packed' ? (
                <>
                  <Input error={errors.mrp} label="MRP" value={form.mrp} onChange={(value) => update('mrp', value)} placeholder="140" inputMode="decimal" />
                  <Input error={errors.sku} label="SKU" value={form.sku} onChange={(value) => update('sku', value.toUpperCase())} placeholder="SKU-001" />
                </>
              ) : (
                <>
                  <SearchableSelect label="Price Unit" value={form.priceUnit} options={unitOptions} onChange={(value) => update('priceUnit', value)} />
                  <Input error={errors.minimumOrderQuantity} label="Minimum Qty" value={form.minimumOrderQuantity} onChange={(value) => update('minimumOrderQuantity', value)} placeholder="1" inputMode="decimal" />
                  <Input error={errors.maximumOrderQuantity} label="Maximum Qty" value={form.maximumOrderQuantity} onChange={(value) => update('maximumOrderQuantity', value)} placeholder="25" inputMode="decimal" />
                </>
              )}
            </div>
          </FormSection>

          <FormSection title="Inventory" copy="Keep seller stock and units ready for orders.">
            <div className="grid items-start gap-3 md:grid-cols-2">
              <Input error={errors.inventoryQuantity} label={form.type === 'Packed' ? 'Inventory Packets' : 'Inventory Quantity'} value={form.inventoryQuantity} onChange={(value) => update('inventoryQuantity', value)} placeholder="18" inputMode="decimal" />
              <SearchableSelect label="Inventory Unit" value={form.inventoryUnit} options={inventoryUnitOptions} onChange={(value) => update('inventoryUnit', value)} disabled={form.type === 'Packed'} />
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
    <label className="grid self-start gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-[0.06em] text-[#647267]">
        {label}
        {error && <span className="normal-case tracking-normal text-[#b63a25]">{error}</span>}
      </span>
      {children}
    </label>
  )
}

export function SearchableSelect({
  disabled = false,
  emptyText = 'No options found.',
  label,
  onChange,
  options,
  placeholder,
  portal = false,
  value,
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const selectedOption = options.find((option) => option.value === value)
  const visibleOptions = options.filter((option) => (
    !normalizedQuery ||
    option.label.toLowerCase().includes(normalizedQuery) ||
    option.meta?.toLowerCase().includes(normalizedQuery)
  ))

  const selectOption = (option) => {
    if (option.disabled) return
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  const toggleOpen = () => {
    if (disabled) return
    setOpen((current) => {
      const nextOpen = !current
      if (nextOpen) {
        window.dispatchEvent(new CustomEvent('simplifyliving:select-open', { detail: id }))
      }
      return nextOpen
    })
  }

  useEffect(() => {
    const closePeerSelects = (event) => {
      if (event.detail !== id) setOpen(false)
    }

    window.addEventListener('simplifyliving:select-open', closePeerSelects)
    return () => window.removeEventListener('simplifyliving:select-open', closePeerSelects)
  }, [id])

  return (
    <FieldLike label={label}>
      <div className="relative">
        <button
          className={`tap-lift flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[15px] border bg-[#fbfcf8] px-3 text-left shadow-[0_8px_18px_rgba(23,63,42,0.05)] ${
            open ? 'border-[#173f2a] shadow-[0_0_0_4px_rgba(23,63,42,0.08),0_12px_24px_rgba(23,63,42,0.1)]' : 'border-[#dde5da]'
          } ${disabled ? 'opacity-60' : ''}`}
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
        >
          <span className={`min-w-0 truncate text-[13px] font-black ${selectedOption ? 'text-[#111814]' : 'text-[#8a978d]'}`}>
            {selectedOption?.label || placeholder || 'Select'}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#647267] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className={`ui-enter grid gap-2 rounded-[16px] border border-[#dde5da] bg-white p-2 shadow-[0_18px_42px_rgba(17,24,20,0.18)] ${portal ? 'absolute left-0 right-0 top-[calc(100%+6px)] z-20' : 'mt-2'}`}>
            <label className="flex min-h-10 items-center gap-2 rounded-[13px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[#647267] focus-within:border-[#173f2a]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d]"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
              />
            </label>
            <div className="grid max-h-[190px] gap-2 overflow-y-auto overscroll-contain pr-1">
              {visibleOptions.map((option) => {
                const active = option.value === value
                return (
                  <button
                    className={`tap-lift flex min-h-11 items-center justify-between gap-3 rounded-[13px] border p-2.5 text-left ${
                      active
                        ? 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]'
                        : 'border-[#edf1ed] bg-white text-[#26342b] active:border-[#173f2a] active:bg-[#edf5ed]'
                    } ${option.disabled ? 'opacity-50' : ''}`}
                    key={`${option.value}-${option.label}`}
                    type="button"
                    onClick={() => selectOption(option)}
                  >
                    <span className="min-w-0">
                      <strong className="block truncate text-[12px] font-black">{option.label}</strong>
                      {option.meta && <small className="block truncate text-[10px] font-bold text-[#647267]">{option.meta}</small>}
                    </span>
                    {active && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#173f2a]"></span>}
                  </button>
                )
              })}
              {visibleOptions.length === 0 && <p className="rounded-[13px] bg-[#f8faf7] p-3 text-[12px] font-bold text-[#647267]">{emptyText}</p>}
            </div>
          </div>
        )}
      </div>
    </FieldLike>
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

export function InventoryModal({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState(product.inventoryQuantity)

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-end bg-[#11181466] sm:place-items-center">
      <section className="w-full rounded-t-[24px] bg-[#fbfcf8] p-4 sm:max-w-[520px] sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Update Inventory</h2>
          <button className="tap-lift rounded-[10px] p-2 active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-[13px] font-bold text-[#647267]">Current stock: {product.inventoryQuantity} {stockUnit(product)}</p>
        <Input label={product.type === 'Packed' ? 'Set Exact Packets' : 'Set Exact Quantity'} value={quantity} onChange={setQuantity} />
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
