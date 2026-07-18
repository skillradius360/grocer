import { useMemo, useState } from 'react'
import {
  Clock3,
  Heart,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'

const customers = [
  {
    id: 'cust-1',
    name: 'Ananya Sen',
    phone: '+91 98765 11042',
    email: 'ananya.sen@example.com',
    area: 'Salt Lake',
    joinedAt: 'Today',
    lastOrder: 'Today, 7:45 PM',
    segment: 'New',
    orders: 2,
    returns: 0,
    spend: 486,
    avgOrder: 243,
    favouriteItems: ['Basmati Rice', 'Toast', 'Mustard Oil'],
    searchedItems: ['Organic rice', 'Breakfast bread', 'Snacks'],
    notes: 'Prefers evening delivery and smaller packs.',
  },
  {
    id: 'cust-2',
    name: 'Rahul Agarwal',
    phone: '+91 90071 55234',
    email: 'rahul.a@example.com',
    area: 'Lake Town',
    joinedAt: '3 months ago',
    lastOrder: 'Yesterday',
    segment: 'Top buyer',
    orders: 38,
    returns: 1,
    spend: 15480,
    avgOrder: 407,
    favouriteItems: ['Chicken sandwich', 'Chicken Fried Momo', 'Cold drinks'],
    searchedItems: ['Momos', 'Chicken snacks', 'Party combo'],
    notes: 'High value customer. Frequently orders for office evenings.',
  },
  {
    id: 'cust-3',
    name: 'Priya Das',
    phone: '+91 98312 77710',
    email: 'priya.d@example.com',
    area: 'Dum Dum',
    joinedAt: '8 months ago',
    lastOrder: '5 days ago',
    segment: 'Top buyer',
    orders: 51,
    returns: 2,
    spend: 22100,
    avgOrder: 433,
    favouriteItems: ['Basmati Rice', 'Ghee', 'Rice'],
    searchedItems: ['Premium rice', 'Family pack', 'Oil offers'],
    notes: 'Responds well to grocery basket offers.',
  },
  {
    id: 'cust-4',
    name: 'Soham Mitra',
    phone: '+91 62901 44288',
    email: 'soham.m@example.com',
    area: 'Baguiati',
    joinedAt: '1 year ago',
    lastOrder: '32 days ago',
    segment: 'Inactive',
    orders: 9,
    returns: 4,
    spend: 2770,
    avgOrder: 308,
    favouriteItems: ['Toast', 'Snacks', 'Noodles'],
    searchedItems: ['Quick breakfast', 'Low price snacks', 'Noodles'],
    notes: 'Good candidate for win-back offer.',
  },
  {
    id: 'cust-5',
    name: 'Meera Nair',
    phone: '+91 81002 90222',
    email: 'meera.n@example.com',
    area: 'New Town',
    joinedAt: '2 weeks ago',
    lastOrder: '2 days ago',
    segment: 'Regular',
    orders: 7,
    returns: 0,
    spend: 3360,
    avgOrder: 480,
    favouriteItems: ['Basmati Rice', 'Soups', 'Oil'],
    searchedItems: ['Healthy soup', 'Rice discount', 'Cooking oil'],
    notes: 'Likely to convert on health and family grocery bundles.',
  },
  {
    id: 'cust-6',
    name: 'Arjun Roy',
    phone: '+91 74392 11090',
    email: 'arjun.r@example.com',
    area: 'Kestopur',
    joinedAt: '6 days ago',
    lastOrder: 'Never ordered',
    segment: 'New',
    orders: 0,
    returns: 0,
    spend: 0,
    avgOrder: 0,
    favouriteItems: ['No orders yet'],
    searchedItems: ['Momos', 'Rice', 'Offers near me'],
    notes: 'Browsed multiple items but has not checked out.',
  },
  {
    id: 'cust-7',
    name: 'Nisha Kapoor',
    phone: '+91 79804 66310',
    email: 'nisha.k@example.com',
    area: 'Ultadanga',
    joinedAt: '5 months ago',
    lastOrder: 'Today, 2:10 PM',
    segment: 'Regular',
    orders: 19,
    returns: 1,
    spend: 7320,
    avgOrder: 385,
    favouriteItems: ['Sweets', 'Toast', 'Snacks'],
    searchedItems: ['Dessert', 'Evening snacks', 'Sweets'],
    notes: 'Orders around afternoon and evening snack slots.',
  },
]

const segmentStyles = {
  New: 'border-[#f0c56e] bg-[#fff6e9] text-[#9a6500]',
  'Top buyer': 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]',
  Regular: 'border-[#c7b8ff] bg-[#f1edff] text-[#5d43bd]',
  Inactive: 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
}

const customerFilters = [
  { id: 'all', label: 'All' },
  { id: 'best', label: 'Best customers' },
  { id: 'frequent', label: 'Frequent customers' },
  { id: 'returns', label: 'Most returns' },
]

export function CustomersPage({ sellerSession, theme, onToggleTheme }) {
  const [query, setQuery] = useState('')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const searchedCustomers = customers.filter((customer) => (
      !normalizedQuery ||
      customer.name.toLowerCase().includes(normalizedQuery) ||
      customer.phone.includes(normalizedQuery) ||
      customer.area.toLowerCase().includes(normalizedQuery)
    ))

    if (customerFilter === 'best') {
      return searchedCustomers.filter((customer) => customer.spend >= 7000).sort((a, b) => b.spend - a.spend)
    }

    if (customerFilter === 'frequent') {
      return searchedCustomers.filter((customer) => customer.orders >= 10).sort((a, b) => b.orders - a.orders)
    }

    if (customerFilter === 'returns') {
      return searchedCustomers.filter((customer) => customer.returns > 0).sort((a, b) => b.returns - a.returns)
    }

    return searchedCustomers
  }, [customerFilter, query])

  return (
    <div className="ui-enter min-h-svh overflow-x-hidden bg-[#f4f7f3] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Customers" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid min-w-0 gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <section className="flex items-center justify-between gap-3 rounded-[16px] border border-[#dde5da] bg-white p-2.5 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Customers</p>
            <h1 className="truncate text-[17px] font-black leading-tight sm:text-[19px]">Buyer list</h1>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#edf5ed] text-[14px] font-black text-[#173f2a]">
            {customers.length}
          </span>
        </section>

        <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-[16px] border border-[#dde5da] bg-white px-3 text-[#647267] shadow-[0_10px_24px_rgba(23,63,42,0.06)] focus-within:border-[#173f2a]">
          <Search className="h-5 w-5 shrink-0" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d]"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone, area..."
          />
        </label>

        <div className="flex min-w-0 gap-2 overflow-x-auto rounded-[16px] border border-[#dde5da] bg-white p-2 shadow-[0_10px_24px_rgba(23,63,42,0.06)]" aria-label="Customer filters">
          {customerFilters.map((filter) => (
            <button
              className={`tap-lift min-h-10 shrink-0 rounded-[13px] px-3 text-[12px] font-black ${
                customerFilter === filter.id
                  ? 'bg-[#173f2a] text-white shadow-[0_10px_20px_rgba(23,63,42,0.18)]'
                  : 'bg-[#f8faf7] text-[#647267] active:bg-[#edf5ed] active:text-[#173f2a]'
              }`}
              key={filter.id}
              type="button"
              onClick={() => setCustomerFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <section className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCustomers.map((customer) => (
            <button
              className="tap-lift flex min-w-0 items-center gap-3 rounded-[18px] border border-[#dde5da] bg-white p-3 text-left shadow-[0_10px_24px_rgba(23,63,42,0.06)] active:border-[#173f2a] active:bg-[#edf5ed]"
              key={customer.id}
              type="button"
              onClick={() => setSelectedCustomer(customer)}
            >
              <span className={`icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-[16px] ${segmentStyles[customer.segment]}`}>
                <UserRound className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[14px] font-black text-[#111814]">{customer.name}</strong>
                <small className="block truncate text-[11px] font-bold text-[#647267]">{customer.phone}</small>
                <small className="mt-1 block truncate text-[11px] font-semibold text-[#647267]">{customer.area} - {customer.lastOrder}</small>
              </span>
            </button>
          ))}
        </section>

        {visibleCustomers.length === 0 && (
          <div className="rounded-[18px] border border-[#dde5da] bg-white p-6 text-center">
            <strong className="block text-[15px] font-black">No customers found</strong>
            <p className="mt-1 text-[12px] font-semibold text-[#647267]">Try another name, phone, area, or filter.</p>
          </div>
        )}
      </main>

      {selectedCustomer && <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  )
}

function CustomerModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-[#11181466] p-3 sm:p-5" role="dialog" aria-modal="true">
      <aside className="max-h-[min(82svh,680px)] w-full max-w-[440px] overflow-x-hidden overflow-y-auto rounded-[24px] border border-[#dde5da] bg-[#fbfcf8] shadow-[0_24px_60px_rgba(17,24,20,0.24)]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`icon-chip grid h-14 w-14 shrink-0 place-items-center rounded-[18px] ${segmentStyles[customer.segment]}`}>
              <UserRound className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Customer data</p>
              <h2 className="truncate text-[20px] font-black">{customer.name}</h2>
              <p className="truncate text-[12px] font-semibold text-[#647267]">{customer.email}</p>
            </div>
          </div>
          <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose} aria-label="Close customer details">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat value={customer.orders} label="Orders" />
            <Stat value={`Rs ${customer.spend}`} label="Spend" />
            <Stat value={customer.returns} label="Returns" />
          </div>

          <section className="grid gap-2 rounded-[18px] border border-[#dde5da] bg-white p-3">
            <InfoLine icon={Phone} label="Phone" value={customer.phone} />
            <InfoLine icon={MapPin} label="Area" value={customer.area} />
            <InfoLine icon={Clock3} label="Joined" value={customer.joinedAt} />
            <InfoLine icon={ReceiptText} label="Last order" value={customer.lastOrder} />
          </section>

          <TagBlock icon={Heart} title="Favourite items" items={customer.favouriteItems} tone="green" />
          <TagBlock icon={Search} title="Searched items" items={customer.searchedItems} tone="amber" />

          <section className="rounded-[18px] border border-[#dde5da] bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-[#173f2a]">
              <ShoppingBag className="h-4 w-4" />
              <strong className="text-[12px] font-black">Seller note</strong>
            </div>
            <p className="text-[12px] font-semibold leading-relaxed text-[#647267]">{customer.notes}</p>
          </section>
        </div>
      </aside>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="min-w-0 rounded-[15px] bg-[#f8faf7] p-3 text-center">
      <strong className="block truncate text-[15px] font-black leading-none text-[#111814]">{value}</strong>
      <span className="mt-1 block text-[9px] font-black uppercase text-[#647267]">{label}</span>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[14px] border border-[#edf1ed] bg-[#fbfcf8] p-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[#edf5ed] text-[#173f2a]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <small className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</small>
        <strong className="block truncate text-[12px] text-[#111814]">{value}</strong>
      </span>
    </div>
  )
}

function TagBlock({ icon: Icon, title, items, tone }) {
  const styles = tone === 'green' ? 'bg-[#dff8e8] text-[#08783c]' : 'bg-[#fff6e9] text-[#9a6500]'

  return (
    <section className="rounded-[18px] border border-[#dde5da] bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-[11px] ${styles}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-[12px] font-black">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="max-w-full rounded-full border border-[#dde5da] bg-[#fbfcf8] px-2.5 py-1 text-[11px] font-bold text-[#26342b]" key={item}>{item}</span>
        ))}
      </div>
    </section>
  )
}
