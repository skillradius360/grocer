import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, MessageCircle, PackageCheck, Phone, Plus, X } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Badge, IconButton, Panel, SectionTitle, StatCard } from '../components/dashboard/DashboardComponents'
import { calculateOfferDiscount, getActiveOffers, getOfferBlockReason, offerAppliesToItem } from '../services/offerService'
import { createBuyerOrder, getOrderCategories, getOrderInventory, getSellerOrders, saveSellerOrders, updateOrderStatus } from '../services/orderService'
import { digitsOnly, patterns, validateFieldsByRules } from '../utils/validation'

const tabs = ['New', 'Preparing', 'Ready', 'History']

const statusTone = {
  New: 'blue',
  Preparing: 'amber',
  Ready: 'green',
  Completed: 'green',
}

const statusProgress = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Payment received', 'Completed']

const initialForm = {
  buyerName: '',
  buyerPhone: '',
  buyerAddress: '',
  categoryId: 'bengali',
  subcategory: 'Dosas',
  productId: 'sp-2',
  quantity: 1,
  paymentMethod: 'Cash',
  offerId: '',
}

function money(value) {
  return `Rs ${Number(value).toFixed(2)}`
}

function orderTotal(order) {
  if (typeof order.totalAmount === 'number') return order.totalAmount
  return order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

function itemCount(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function tabForStatus(status) {
  return status === 'Completed' ? 'History' : status
}

export function OrdersPage({ sellerSession, theme, onToggleTheme }) {
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [inventory, setInventory] = useState([])
  const [activeOffers, setActiveOffers] = useState([])
  const [activeTab, setActiveTab] = useState('New')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [stockAlertVisible, setStockAlertVisible] = useState(true)

  useEffect(() => {
    let active = true

    async function loadOrders() {
      const [nextOrders, nextCategories, nextInventory, nextOffers] = await Promise.all([getSellerOrders(), getOrderCategories(), getOrderInventory(), getActiveOffers()])
      if (active) {
        setOrders(nextOrders)
        setCategories(nextCategories)
        setInventory(nextInventory)
        setActiveOffers(nextOffers)
        setLoading(false)
      }
    }

    loadOrders()

    return () => {
      active = false
    }
  }, [])

  const filteredOrders = useMemo(
    () => orders.filter((order) => tabForStatus(order.status) === activeTab),
    [orders, activeTab],
  )

  const counts = useMemo(() => ({
    new: orders.filter((order) => order.status === 'New').length,
    preparing: orders.filter((order) => order.status === 'Preparing').length,
    ready: orders.filter((order) => order.status === 'Ready').length,
    completed: orders.filter((order) => order.status === 'Completed').length,
  }), [orders])

  const lowStockItems = inventory.filter((item) => item.quantity <= 5)

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  const replaceOrders = (updater) => {
    setOrders((current) => {
      const nextOrders = typeof updater === 'function' ? updater(current) : updater
      saveSellerOrders(nextOrders)
      return nextOrders
    })
  }

  const patchOrder = async (order, nextStatus, patch = {}) => {
    const updatedOrder = await updateOrderStatus(order, nextStatus, patch)
    replaceOrders((current) => current.map((item) => (item.id === order.id ? updatedOrder : item)))
    setSelectedOrder(null)
    setActiveTab(tabForStatus(updatedOrder.status))
  }

  const patchSelectedOrder = async (order, patch = {}) => {
    const updatedOrder = await updateOrderStatus(order, order.status, patch)
    replaceOrders((current) => current.map((item) => (item.id === order.id ? updatedOrder : item)))
    setSelectedOrder(updatedOrder)
  }

  const submitBuyerOrder = async (event) => {
    event.preventDefault()
    const selectedItem = inventory.find((item) => item.id === form.productId)
    const quantity = Number(form.quantity)

    const nextErrors = validateFieldsByRules(form, {
      buyerName: { required: true, pattern: patterns.name, message: 'Letters only' },
      buyerPhone: { required: true, pattern: patterns.phone, message: 'Invalid phone' },
      buyerAddress: { required: true, pattern: /^.{6,180}$/, message: 'Add full address' },
      quantity: { required: true, pattern: patterns.positiveNumber, min: 1, message: 'Invalid quantity' },
    })

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors)
      showMessage('Please fix highlighted fields.')
      return
    }

    if (!selectedItem || selectedItem.sellerStatus !== 'Active' || quantity < 1 || quantity > selectedItem.quantity) {
      showMessage('Choose a quantity available in inventory.')
      return
    }

    try {
      const result = await createBuyerOrder(form, inventory, activeOffers)
      replaceOrders((current) => [result.order, ...current])
      setInventory((current) => current.map((item) => (
        item.id === result.inventoryPatch.productId
          ? { ...item, quantity: result.inventoryPatch.quantity, availability: result.inventoryPatch.availability }
          : item
      )))
      setForm(initialForm)
      setFormErrors({})
      setFormOpen(false)
      setActiveTab('New')
      showMessage(`${result.order.shortCode} created. Inventory updated.`)
    } catch (error) {
      showMessage(error.message || 'Unable to apply this offer.')
    }
  }

  return (
    <div className="ui-enter min-h-svh bg-[#f3f6f4] pb-5 text-[#111814] sm:min-h-[820px]">
      <AppHeader activePage="Orders" sellerSession={sellerSession} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="grid gap-3 px-4 pt-3 md:px-6 md:pt-5">
        <Panel className="p-2.5 sm:p-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Orders</p>
              <h1 className="mt-0.5 text-[17px] font-black leading-tight sm:text-[20px]">Order processing</h1>
            </div>
            <button className="tap-lift inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-[13px] bg-[#173f2a] px-3 text-[11px] font-black text-white active:bg-[#08783c] sm:min-h-11 sm:gap-2 sm:rounded-[14px] sm:text-[12px]" type="button" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Order
            </button>
          </div>
        </Panel>

        <div className="grid grid-cols-4 gap-2">
          <StatCard value={counts.new} label="New" icon="orders" />
          <StatCard value={counts.preparing} label="Preparing" icon="chef" />
          <StatCard value={counts.ready} label="Ready" icon="box" />
          <StatCard value={counts.completed} label="Done" icon="check" />
        </div>

        {message && <div className="rounded-[14px] border border-[#b8d6c0] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#173f2a]">{message}</div>}

        <Panel className="p-2">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                className={`tap-lift min-h-11 rounded-[13px] text-[12px] font-black ${activeTab === tab ? 'bg-[#173f2a] text-white shadow-[0_10px_22px_rgba(23,63,42,0.22)]' : 'text-[#647267] active:bg-[#edf5ed] active:text-[#173f2a]'}`}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </Panel>

        {stockAlertVisible && lowStockItems.length > 0 && (
          <div className="flex items-center gap-3 rounded-[15px] border border-[#e9b653] bg-[#fff6e9] p-3 text-[12px] font-semibold text-[#6a4a10]">
            <p className="min-w-0 flex-1">
              <strong className="text-[#111814]">{lowStockItems.length} stock alert</strong> after buyer ordering. Items at 0 are drained and should be hidden from future buyer checkout.
            </p>
            <button className="tap-lift grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-[#e9b653] bg-white/70 text-[#6a4a10] active:bg-white" type="button" onClick={() => setStockAlertVisible(false)} aria-label="Dismiss stock alert">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[180px] place-items-center rounded-[18px] border border-[#dde5da] bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-[#173f2a]" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Panel className="grid min-h-[170px] place-items-center p-6 text-center">
            <PackageCheck className="mb-3 h-8 w-8 text-[#173f2a]" />
            <strong className="block text-[15px] font-black">No {activeTab.toLowerCase()} orders</strong>
            <p className="mt-1 max-w-[320px] text-[12px] font-semibold text-[#647267]">Orders will appear here as soon as the buyer app posts them into this workflow.</p>
          </Panel>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)} />
            ))}
          </section>
        )}

        <Panel className="p-4">
          <SectionTitle title="Inventory impact" />
          <div className="grid gap-2 sm:grid-cols-3">
            {inventory.map((item) => (
              <div className="rounded-[14px] border border-[#dde5da] bg-[#f8faf7] p-3" key={item.id}>
                <strong className="block truncate text-[13px] font-black">{item.name}</strong>
                <p className="mt-1 text-[11px] font-bold text-[#647267]">{item.quantity} {item.unit} left</p>
                <Badge tone={item.quantity <= 0 ? 'red' : item.quantity <= 5 ? 'amber' : 'green'}>{item.quantity <= 0 ? 'Drained' : item.quantity <= 5 ? 'Low' : 'Available'}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </main>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={() => patchOrder(selectedOrder, 'Preparing')}
          onReady={() => patchOrder(selectedOrder, 'Ready')}
          onPayment={(checked) => patchSelectedOrder(selectedOrder, { paymentStatus: checked ? 'Paid' : 'Pending' })}
          onComplete={() => {
            if (selectedOrder.paymentStatus !== 'Paid') {
              showMessage('Mark payment received before completing.')
              return
            }
            patchOrder(selectedOrder, 'Completed', { paymentStatus: 'Paid' })
          }}
        />
      )}

      {formOpen && (
        <BuyerOrderForm
          categories={categories}
          activeOffers={activeOffers}
          errors={formErrors}
          form={form}
          inventory={inventory}
          onClose={() => setFormOpen(false)}
          onChange={(patch) => {
            setForm((current) => ({ ...current, ...patch }))
            setFormErrors((current) => ({ ...current, ...Object.keys(patch).reduce((cleared, key) => ({ ...cleared, [key]: '' }), {}) }))
          }}
          onSubmit={submitBuyerOrder}
        />
      )}
    </div>
  )
}

function OrderCard({ order, onOpen }) {
  return (
    <article
      className="tap-lift cursor-pointer rounded-[18px] border border-[#dde5da] bg-white p-3 shadow-[0_10px_24px_rgba(23,63,42,0.07)] hover:border-[#b8c8bc] focus-within:border-[#173f2a]"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen()
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone={statusTone[order.status]}>{order.status === 'Completed' ? 'Done' : order.status}</Badge>
        <div className="text-right">
          <p className="text-[11px] font-black text-[#334039]">{order.createdAt.split(',').at(-1)?.trim()}</p>
          <span className="mt-1 inline-flex rounded-[9px] border border-[#dde5da] bg-[#f8faf7] px-2 py-0.5 text-[9px] font-black text-[#536258]">{order.shortCode}</span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-[#eef2f0] text-[10px] font-black text-[#8a978d]">{order.buyerName.slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-black">{order.buyerName}</h2>
          <p className="truncate text-[11px] font-semibold text-[#647267]">{order.buyerAddress}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <strong className="text-[16px] font-black">{money(orderTotal(order))}</strong>
        <span className="text-[11px] font-semibold text-[#647267]">{itemCount(order)} items</span>
        <Badge tone={order.paymentStatus === 'Paid' ? 'green' : 'amber'}>{order.paymentStatus}</Badge>
      </div>
      <button className="tap-lift mt-3 text-[12px] font-black text-[#145ce6] active:text-[#173f2a]" type="button" onClick={(event) => { event.stopPropagation(); onOpen() }}>
        Open
      </button>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#eef2ee] pt-3">
        <span onClick={(event) => event.stopPropagation()}>
          <IconButton icon="phone" label="Call" />
        </span>
        <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#9ed7b3] bg-[#f0fff5] px-3 text-[12px] font-black text-[#08783c]" type="button" onClick={(event) => event.stopPropagation()}>
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
      </div>
    </article>
  )
}

function OrderDetail({ order, onClose, onConfirm, onReady, onPayment, onComplete }) {
  const progressIndex = {
    New: 0,
    Preparing: 2,
    Ready: order.paymentStatus === 'Paid' ? 4 : 3,
    Completed: 5,
  }[order.status]

  const nextAction = {
    New: 'Confirm and start preparing',
    Preparing: 'Mark ready for pickup',
    Ready: order.paymentStatus === 'Paid' ? 'Complete order' : 'Mark payment received',
    Completed: 'Order successfully completed',
  }[order.status]

  return (
    <div className="fixed inset-0 z-30 grid place-items-end bg-[#11181466] sm:place-items-center">
      <aside className="max-h-[94svh] w-full overflow-y-auto rounded-t-[24px] border border-[#dde5da] bg-[#fbfcf8] shadow-[0_-20px_60px_rgba(17,24,20,0.24)] sm:max-w-[520px] sm:rounded-[24px]">
        <header className="sticky top-0 z-10 border-b border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone[order.status]}>{order.status === 'Completed' ? 'Done' : order.status}</Badge>
                <span className="rounded-full border border-[#dde5da] bg-white px-2 py-1 text-[10px] font-black text-[#536258]">{order.code}</span>
              </div>
              <h2 className="mt-2 text-[21px] font-black">{order.buyerName}</h2>
              <p className="mt-1 text-[12px] font-semibold text-[#647267]">{itemCount(order)} items · {money(orderTotal(order))} · {order.createdAt}</p>
            </div>
            <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-3 p-4 pb-28">
          <Panel className="p-4">
            <SectionTitle title="Current stage" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge tone={statusTone[order.status]}>{order.status === 'Completed' ? 'Done' : order.status}</Badge>
                <p className="mt-2 text-[12px] font-semibold text-[#647267]">Next required action</p>
                <strong className="mt-0.5 block text-[15px] font-black">{nextAction}</strong>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#edf5ed] text-[#173f2a]">
                <PackageCheck className="h-5 w-5" />
              </div>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle title="Ordered items" />
            <div className="divide-y divide-[#eef2ee]">
              {order.items.map((item) => (
                <div className="flex items-center justify-between gap-3 py-3 text-[13px]" key={item.productId}>
                  <div className="min-w-0">
                    <strong className="block truncate font-black">{item.name}</strong>
                    <span className="text-[11px] font-semibold text-[#647267]">x{item.quantity} {item.unit}</span>
                  </div>
                  <strong className="font-black">{money(item.quantity * item.price)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#dde5da] pt-3">
              <span className="text-[14px] font-black">Subtotal</span>
              <strong className="text-[15px] font-black">{money(order.subtotal ?? order.items.reduce((sum, item) => sum + item.quantity * item.price, 0))}</strong>
            </div>
            {order.appliedOffer && (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-[14px] border border-[#9ed7b3] bg-[#f0fff5] px-3 py-2 text-[12px] font-bold text-[#08783c]">
                <span>{order.appliedOffer.title} ({order.appliedOffer.source})</span>
                <strong>-{money(order.discountAmount || 0)}</strong>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#dde5da] pt-3">
              <span className="text-[14px] font-black">Total</span>
              <strong className="text-[19px] font-black">{money(orderTotal(order))}</strong>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle title="Buyer contact" />
            <div className="flex gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf5ed] text-[13px] font-black text-[#145ce6]">{order.buyerName.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0">
                <strong className="block truncate text-[15px] font-black">{order.buyerName}</strong>
                <p className="truncate text-[12px] font-semibold text-[#647267]">{order.buyerAddress}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <IconButton icon="phone" label="Call" />
              <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#9ed7b3] bg-[#f0fff5] px-3 text-[12px] font-black text-[#08783c]" type="button">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button className="tap-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#dfe5df] bg-white px-3 text-[12px] font-black" type="button">
                <Phone className="h-4 w-4" />
                Message
              </button>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle title="Payment" />
            <div className="flex items-center justify-between gap-3">
              <strong className="text-[15px] font-black">{order.paymentMethod}</strong>
              <Badge tone={order.paymentStatus === 'Paid' ? 'green' : 'amber'}>{order.paymentStatus}</Badge>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle title="Progress" />
            <div className="grid gap-0">
              {statusProgress.map((step, index) => {
                const done = index <= progressIndex
                return (
                  <div className="grid grid-cols-[18px_1fr] gap-3" key={step}>
                    <div className="grid justify-items-center">
                      <span className={`mt-0.5 h-3.5 w-3.5 rounded-full border-2 ${done ? 'border-[#08783c] bg-[#16a75a]' : 'border-[#cbd7cf] bg-white'}`}></span>
                      {index < statusProgress.length - 1 && <span className={`h-6 w-px ${done ? 'bg-[#16a75a]' : 'bg-[#dfe5df]'}`}></span>}
                    </div>
                    <div>
                      <strong className={`text-[13px] font-black ${done ? 'text-[#111814]' : 'text-[#7b887f]'}`}>{step}</strong>
                      {index === progressIndex && <p className="text-[11px] font-semibold text-[#647267]">Updated {order.updatedAt}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>

        <footer className="sticky bottom-0 grid gap-2 border-t border-[#dde5da] bg-[#fbfcf8]/95 p-4 backdrop-blur">
          {order.status === 'New' && <button className="tap-lift min-h-12 rounded-[16px] bg-[#173f2a] text-[14px] font-black text-white active:bg-[#08783c]" type="button" onClick={onConfirm}>Confirm and start preparing</button>}
          {order.status === 'Preparing' && <button className="tap-lift min-h-12 rounded-[16px] bg-[#173f2a] text-[14px] font-black text-white active:bg-[#08783c]" type="button" onClick={onReady}>Mark ready for pickup</button>}
          {order.status === 'Ready' && (
            <>
              <label className="tap-lift flex min-h-14 items-center gap-3 rounded-[16px] border border-[#dde5da] bg-[#f8faf7] px-4">
                <input className="h-4 w-4 accent-[#173f2a]" type="checkbox" checked={order.paymentStatus === 'Paid'} onChange={(event) => onPayment(event.target.checked)} />
                <span>
                  <strong className="block text-[13px] font-black">Payment received</strong>
                  <span className="text-[11px] font-semibold text-[#647267]">Required before completing this order</span>
                </span>
              </label>
              <button className={`tap-lift min-h-12 rounded-[16px] text-[14px] font-black ${order.paymentStatus === 'Paid' ? 'bg-[#173f2a] text-white active:bg-[#08783c]' : 'bg-[#c9d1ca] text-white'}`} type="button" onClick={onComplete}>Complete order</button>
            </>
          )}
          {order.status === 'Completed' && <div className="rounded-[16px] border border-[#9ed7b3] bg-[#f0fff5] p-3 text-center text-[13px] font-black text-[#08783c]">Order successfully completed</div>}
        </footer>
      </aside>
    </div>
  )
}

function BuyerOrderForm({ activeOffers, categories, errors, form, inventory, onChange, onClose, onSubmit }) {
  const selectedCategory = categories.find((category) => category.id === form.categoryId)
  const subcategories = selectedCategory?.subcategories || []
  const variantOptions = inventory.filter((item) => item.categoryId === form.categoryId && item.subcategory === form.subcategory)
  const selectedItem = inventory.find((item) => item.id === form.productId)
  const quantityLimit = selectedItem?.quantity || 1
  const subtotal = selectedItem ? Number(form.quantity || 1) * selectedItem.price : 0
  const applicableOffers = activeOffers.filter((offer) => offerAppliesToItem(offer, selectedItem))
  const selectedOffer = applicableOffers.find((offer) => offer.id === form.offerId)
  const discountAmount = calculateOfferDiscount(selectedOffer, selectedItem, subtotal)
  const selectedOfferReason = getOfferBlockReason(selectedOffer, selectedItem, subtotal)
  const finalTotal = Math.max(0, subtotal - discountAmount)
  const stockStatus = selectedItem?.sellerStatus !== 'Active'
    ? 'Hidden'
    : selectedItem?.quantity <= 0
      ? 'Out of stock'
      : selectedItem?.quantity <= 5
        ? 'Low stock'
        : 'Available'

  const selectCategory = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId)
    const subcategory = category?.subcategories[0] || ''
    const product = inventory.find((item) => item.categoryId === categoryId && item.subcategory === subcategory && item.quantity > 0 && item.sellerStatus === 'Active')
      || inventory.find((item) => item.categoryId === categoryId && item.subcategory === subcategory)

    onChange({
      categoryId,
      subcategory,
      productId: product?.id || '',
      quantity: 1,
      offerId: '',
    })
  }

  const selectSubcategory = (subcategory) => {
    const product = inventory.find((item) => item.categoryId === form.categoryId && item.subcategory === subcategory && item.quantity > 0 && item.sellerStatus === 'Active')
      || inventory.find((item) => item.categoryId === form.categoryId && item.subcategory === subcategory)

    onChange({
      subcategory,
      productId: product?.id || '',
      quantity: 1,
      offerId: '',
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#11181466] p-4 sm:p-6">
      <form className="grid max-h-[min(74dvh,620px)] w-full max-w-[560px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] border border-[#dde5da] bg-[#fbfcf8] shadow-[0_24px_60px_rgba(17,24,20,0.24)]" onSubmit={onSubmit}>
        <header className="flex items-start justify-between gap-3 border-b border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#5b7567]">Buyer order form</p>
            <h2 className="mt-1 text-[18px] font-black">Create test order</h2>
            <p className="mt-1 text-[12px] font-semibold text-[#647267]">Mirrors the fields the buyer app should submit later.</p>
          </div>
          <button className="tap-lift grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#dde5da] bg-white active:border-[#efafa3] active:bg-[#fff2ef] active:text-[#b63a25]" type="button" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 gap-3 overflow-y-auto overscroll-contain p-3.5 sm:p-4">
          <FormInput error={errors.buyerName} label="Buyer name" value={form.buyerName} onChange={(value) => onChange({ buyerName: value })} placeholder="Customer name" />
          <FormInput error={errors.buyerPhone} label="Phone number" value={form.buyerPhone} onChange={(value) => onChange({ buyerPhone: digitsOnly(value, 10) })} placeholder="+91..." inputMode="tel" />
          <FormInput error={errors.buyerAddress} label="Pickup / delivery address" value={form.buyerAddress} onChange={(value) => onChange({ buyerAddress: value })} placeholder="Flat, lane, landmark" />

          <div className="grid gap-3 rounded-[18px] border border-[#dde5da] bg-white p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Product selection</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Category</span>
                <select className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]" value={form.categoryId} onChange={(event) => selectCategory(event.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Sub-category</span>
                <select className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]" value={form.subcategory} onChange={(event) => selectSubcategory(event.target.value)}>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Product variant</span>
              <select className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]" value={form.productId} onChange={(event) => onChange({ productId: event.target.value, quantity: 1, offerId: '' })}>
                {variantOptions.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.quantity <= 0 || item.sellerStatus !== 'Active'}>
                    {item.name} - {item.variant || 'Default'} - {item.sellerStatus !== 'Active' ? 'Hidden by seller' : item.quantity > 0 ? `${item.quantity} ${item.unit} left` : 'Out of stock'}
                  </option>
                ))}
              </select>
            </label>

            {variantOptions.length === 0 && (
              <div className="rounded-[14px] border border-[#efafa3] bg-[#fff2ef] p-3 text-[12px] font-bold text-[#b63a25]">No variants are listed for this sub-category yet.</div>
            )}

            {selectedItem && (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[14px] border border-[#dde5da] bg-[#f8faf7] p-3">
                  <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">Variant</span>
                  <strong className="mt-1 block text-[12px] font-black">{selectedItem.variant}</strong>
                </div>
                <div className="rounded-[14px] border border-[#dde5da] bg-[#f8faf7] p-3">
                  <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">Price</span>
                  <strong className="mt-1 block text-[12px] font-black">{money(selectedItem.price)}</strong>
                </div>
                <div className="rounded-[14px] border border-[#dde5da] bg-[#f8faf7] p-3">
                  <span className="block text-[9px] font-black uppercase tracking-[0.06em] text-[#647267]">Stock</span>
                  <strong className={`mt-1 block text-[12px] font-black ${selectedItem.quantity <= 0 || selectedItem.sellerStatus !== 'Active' ? 'text-[#b63a25]' : selectedItem.quantity <= 5 ? 'text-[#9a6500]' : 'text-[#08783c]'}`}>{stockStatus}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput error={errors.quantity} label="Quantity" value={form.quantity} onChange={(value) => onChange({ quantity: Math.min(quantityLimit, Number(digitsOnly(value, 4) || 1)) })} placeholder="1" type="number" min="1" max={quantityLimit} disabled={!selectedItem || selectedItem.quantity <= 0 || selectedItem.sellerStatus !== 'Active'} />
            <label className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Payment</span>
              <select className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-white px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]" value={form.paymentMethod} onChange={(event) => onChange({ paymentMethod: event.target.value })}>
                <option>Cash</option>
                <option>UPI</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 rounded-[18px] border border-[#dde5da] bg-white p-3">
            <span className="text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">Apply active offer</span>
            <select
              className="tap-lift h-12 rounded-[15px] border border-[#dde5da] bg-[#fbfcf8] px-3 text-[13px] font-black text-[#111814] outline-none focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)]"
              value={form.offerId}
              onChange={(event) => onChange({ offerId: event.target.value })}
              disabled={!selectedItem || applicableOffers.length === 0}
            >
              <option value="">No offer</option>
              {applicableOffers.map((offer) => (
                <option key={offer.id} value={offer.id} disabled={Boolean(getOfferBlockReason(offer, selectedItem, subtotal))}>
                  {offer.title} - {offer.source || 'Seller'} - {getOfferBlockReason(offer, selectedItem, subtotal) || offer.type}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-semibold text-[#647267]">
              {applicableOffers.length ? `${applicableOffers.length} active offer${applicableOffers.length > 1 ? 's' : ''} available for this item.` : 'No active seller/admin offer applies to this item.'}
            </span>
            {selectedOfferReason && (
              <span className="rounded-[12px] border border-[#f3d38d] bg-[#fff8e6] px-3 py-2 text-[11px] font-bold text-[#9a6500]">
                {selectedOfferReason}
              </span>
            )}
          </label>

          {selectedItem && selectedItem.quantity > 0 && selectedItem.sellerStatus === 'Active' && (
            <div className="grid gap-2 rounded-[16px] border border-[#dde5da] bg-white p-3 text-[12px] font-semibold text-[#647267]">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <strong className="text-[#111814]">{money(subtotal)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>{selectedOffer ? selectedOffer.title : 'Offer discount'}</span>
                <strong className={discountAmount ? 'text-[#08783c]' : 'text-[#647267]'}>-{money(discountAmount)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#eef2ee] pt-2">
                <span className="font-black text-[#111814]">Total</span>
                <strong className="text-[16px] text-[#111814]">{money(finalTotal)}</strong>
              </div>
              <p>Stock will become <strong className="text-[#111814]">{selectedItem.quantity - Number(form.quantity || 1)} {selectedItem.unit}</strong>.</p>
            </div>
          )}
        </div>

        <footer className="grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-[#dde5da] bg-[#fbfcf8]/95 p-3.5 backdrop-blur sm:p-4">
          <button className="tap-lift rounded-[16px] border border-[#dde5da] bg-white py-3 text-[13px] font-black active:bg-[#f8faf7]" type="button" onClick={onClose}>Cancel</button>
          <button className={`tap-lift rounded-[16px] py-3 text-[13px] font-black text-white ${selectedItem?.quantity > 0 && selectedItem?.sellerStatus === 'Active' ? 'bg-[#173f2a] active:bg-[#08783c]' : 'bg-[#c9d1ca]'}`} type="submit" disabled={!selectedItem || selectedItem.quantity <= 0 || selectedItem.sellerStatus !== 'Active'}>Create order</button>
        </footer>
      </form>
    </div>,
    document.body,
  )
}

function FormInput({ label, value, onChange, placeholder, type = 'text', error, ...props }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-[0.06em] text-[#5b7567]">
        {label}
        {error && <span className="normal-case tracking-normal text-[#b63a25]">{error}</span>}
      </span>
      <input
        className={`tap-lift h-12 rounded-[15px] border bg-white px-3 text-[13px] font-black text-[#111814] outline-none placeholder:text-[#9aa79d] focus:border-[#173f2a] focus:shadow-[0_0_0_4px_rgba(23,63,42,0.1)] ${error ? 'border-[#d56b56] shadow-[0_0_0_3px_rgba(213,107,86,0.12)]' : 'border-[#dde5da]'}`}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}
