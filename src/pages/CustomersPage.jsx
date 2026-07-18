import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  Users,
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
    segment: 'new',
    orders: 2,
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
    segment: 'top',
    orders: 38,
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
    segment: 'top',
    orders: 51,
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
    segment: 'inactive',
    orders: 9,
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
    segment: 'regular',
    orders: 7,
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
    segment: 'new',
    orders: 0,
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
    segment: 'regular',
    orders: 19,
    spend: 7320,
    avgOrder: 385,
    favouriteItems: ['Sweets', 'Toast', 'Snacks'],
    searchedItems: ['Dessert', 'Evening snacks', 'Sweets'],
    notes: 'Orders around afternoon and evening snack slots.',
  },
]

const filters = [
  { id: 'all', label: 'All customers', icon: Users },
  { id: 'top', label: 'Completed most', icon: Star },
  { id: 'new', label: 'New customer', icon: Sparkles },
  { id: 'regular', label: 'Regular', icon: Heart },
  { id: 'inactive', label: 'Inactive', icon: Clock },
]

const segmentStyles = {
  new: 'border-[#f0c56e] bg-[#fff6e9] text-[#9a6500]',
  top: 'border-[#77d69c] bg-[#dff8e8] text-[#08783c]',
  regular: 'border-[#c7b8ff] bg-[#f1edff] text-[#5d43bd]',
  inactive: 'border-[#efafa3] bg-[#fff2ef] text-[#b63a25]',
}

const pageSize = 4

export function CustomersPage({ sellerSession, theme, onToggleTheme }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('orders')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(customers[0].id)

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return customers
      .filter((customer) => activeFilter === 'all' || customer.segment === activeFilter)
      .filter((customer) => (
        !normalizedQuery ||
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.phone.includes(normalizedQuery) ||
        customer.area.toLowerCase().includes(normalizedQuery)
      ))
      .sort((a, b) => {
        if (sortBy === 'orders') return b.orders - a.orders
        if (sortBy === 'spend') return b.spend - a.spend
        if (sortBy === 'avg') return b.avgOrder - a.avgOrder
        return a.name.localeCompare(b.name)
      })
  }, [activeFilter, query, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const visibleCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)
  const selectedCustomer = customers.find((customer) => customer.id === selectedId) || visibleCustomers[0] || customers[0]

  const updateFilter = (filter) => {
    setActiveFilter(filter)
    setPage(1)
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f4f7f3] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Customers" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:pt-5">
        <section className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Metric value={customers.length} label="Total" tone="green" />
            <Metric value={customers.filter((customer) => customer.segment === 'new').length} label="New" tone="amber" />
            <Metric value={customers.filter((customer) => customer.segment === 'top').length} label="Top buyers" tone="violet" />
          </div>

          <div className="rounded-[18px] border border-[#dde5da] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
            <div className="flex min-h-12 items-center gap-2 rounded-[14px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[#647267] focus-within:border-[#173f2a] focus-within:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#111814] outline-none placeholder:text-[#9aa79d]" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search name, phone, area..." />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button className={`tap-lift inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black ${activeFilter === filter.id ? 'border-[#173f2a] bg-[#edf5ed] text-[#173f2a]' : 'border-[#dde5da] bg-white text-[#647267] active:bg-[#f8faf7]'}`} key={filter.id} type="button" onClick={() => updateFilter(filter.id)}>
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </button>
              ))}
            </div>
            <select className="mt-3 h-11 w-full rounded-[14px] border border-[#dde5da] bg-white px-3 text-[12px] font-black outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="orders">Sort by completed orders</option>
              <option value="spend">Sort by total spend</option>
              <option value="avg">Sort by average order</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          <div className="grid gap-2">
            {visibleCustomers.map((customer) => (
              <button className={`tap-lift flex items-center gap-3 rounded-[18px] border bg-white p-3 text-left shadow-[0_10px_24px_rgba(23,63,42,0.06)] ${selectedCustomer.id === customer.id ? segmentStyles[customer.segment] : 'border-[#dde5da] active:bg-[#f8faf7]'}`} key={customer.id} type="button" onClick={() => setSelectedId(customer.id)}>
                <span className={`icon-chip grid h-12 w-12 shrink-0 place-items-center rounded-[16px] ${segmentStyles[customer.segment]}`}>
                  <UserRound className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[14px] font-black text-[#111814]">{customer.name}</strong>
                  <small className="block truncate text-[11px] font-bold text-[#647267]">{customer.area} · {customer.lastOrder}</small>
                </span>
                <span className="rounded-full bg-[#edf5ed] px-2 py-1 text-[10px] font-black text-[#173f2a]">{customer.orders} orders</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[16px] border border-[#dde5da] bg-white p-2">
            <button className="tap-lift grid h-10 w-10 place-items-center rounded-[13px] border border-[#dde5da] bg-white disabled:opacity-40" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-[12px] font-black text-[#647267]">Page {page} of {totalPages}</span>
            <button className="tap-lift grid h-10 w-10 place-items-center rounded-[13px] border border-[#dde5da] bg-white disabled:opacity-40" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} aria-label="Next page">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <CustomerDetail customer={selectedCustomer} />
      </main>
    </div>
  )
}

function Metric({ value, label, tone }) {
  const styles = {
    green: 'bg-[#dff8e8] text-[#08783c]',
    amber: 'bg-[#fff6e9] text-[#9a6500]',
    violet: 'bg-[#f1edff] text-[#5d43bd]',
  }

  return (
    <div className="tap-lift rounded-[18px] border border-[#dde5da] bg-white p-3 text-center shadow-[0_10px_24px_rgba(23,63,42,0.06)]">
      <strong className={`mx-auto grid h-10 w-10 place-items-center rounded-[14px] text-[15px] font-black ${styles[tone]}`}>{value}</strong>
      <span className="mt-2 block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">{label}</span>
    </div>
  )
}

function CustomerDetail({ customer }) {
  return (
    <aside className="rounded-[22px] border border-[#dde5da] bg-white p-4 shadow-[0_14px_34px_rgba(23,63,42,0.08)] md:sticky md:top-[78px] md:self-start">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`icon-chip grid h-14 w-14 shrink-0 place-items-center rounded-[18px] ${segmentStyles[customer.segment]}`}>
            <UserRound className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Customer profile</p>
            <h2 className="truncate text-[20px] font-black">{customer.name}</h2>
          </div>
        </div>
        <button className="tap-lift grid h-9 w-9 place-items-center rounded-[13px] border border-[#dde5da] bg-white active:bg-[#fff2ef]" type="button" aria-label="Close profile">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ProfileStat value={customer.orders} label="Orders" />
        <ProfileStat value={`Rs ${customer.spend}`} label="Spend" />
        <ProfileStat value={`Rs ${customer.avgOrder}`} label="Avg" />
      </div>

      <div className="mt-4 grid gap-2 text-[12px] font-bold">
        <InfoLine icon={Phone} label="Phone" value={customer.phone} />
        <InfoLine icon={MapPin} label="Area" value={customer.area} />
        <InfoLine icon={Clock} label="Joined" value={customer.joinedAt} />
        <InfoLine icon={ReceiptText} label="Last order" value={customer.lastOrder} />
      </div>

      <InsightBlock icon={Heart} title="Favourite items" items={customer.favouriteItems} tone="green" />
      <InsightBlock icon={Search} title="Searched items" items={customer.searchedItems} tone="amber" />

      <div className="mt-3 rounded-[18px] border border-[#dde5da] bg-[#f8faf7] p-3">
        <div className="mb-2 flex items-center gap-2 text-[#173f2a]">
          <ShoppingBag className="h-4 w-4" />
          <strong className="text-[12px] font-black">Seller note</strong>
        </div>
        <p className="text-[12px] font-semibold leading-relaxed text-[#647267]">{customer.notes}</p>
      </div>
    </aside>
  )
}

function ProfileStat({ value, label }) {
  return (
    <div className="rounded-[15px] bg-[#f8faf7] p-3 text-center">
      <strong className="block text-[16px] font-black leading-none text-[#111814]">{value}</strong>
      <span className="mt-1 block text-[9px] font-black uppercase text-[#647267]">{label}</span>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-[#edf1ed] bg-[#fbfcf8] p-2">
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

function InsightBlock({ icon: Icon, title, items, tone }) {
  const styles = tone === 'green' ? 'bg-[#dff8e8] text-[#08783c]' : 'bg-[#fff6e9] text-[#9a6500]'

  return (
    <section className="mt-3 rounded-[18px] border border-[#dde5da] bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-[11px] ${styles}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-[12px] font-black">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="rounded-full border border-[#dde5da] bg-[#fbfcf8] px-2.5 py-1 text-[11px] font-bold text-[#26342b]" key={item}>{item}</span>
        ))}
      </div>
    </section>
  )
}
