import { getOrderInventory, getSellerOrders } from './orderService'

const periodLabels = {
  day: 'Today',
  month: 'This month',
  quarter: 'This quarter',
  year: 'This year',
}

const chartLabels = {
  day: ['8a', '10a', '12p', '2p', '4p', '6p', '8p'],
  month: ['W1', 'W2', 'W3', 'W4'],
  quarter: ['M1', 'M2', 'M3'],
  year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
}

const buyerTimeWindows = [
  { label: 'Morning', window: '6-11 AM', from: 6, to: 11 },
  { label: 'Lunch', window: '11-3 PM', from: 11, to: 15 },
  { label: 'Evening', window: '3-8 PM', from: 15, to: 20 },
  { label: 'Night', window: '8-11 PM', from: 20, to: 23 },
]

const categoryColors = ['#173f2a', '#e0aa4a', '#08783c', '#b63a25', '#647267']

function orderTotal(order) {
  if (typeof order.totalAmount === 'number') return order.totalAmount
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
}

function orderUnits(order) {
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

function parseOrderDate(order) {
  if (order.createdAt === 'Just now') return new Date()
  const parsed = new Date(order.createdAt)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function getReferenceDate(orders) {
  return orders.reduce((latest, order) => {
    const orderDate = parseOrderDate(order)
    return orderDate > latest ? orderDate : latest
  }, new Date())
}

function filterOrdersByPeriod(orders, period) {
  const referenceDate = getReferenceDate(orders)

  return orders.filter((order) => {
    const orderDate = parseOrderDate(order)

    if (period === 'day') {
      return orderDate.toDateString() === referenceDate.toDateString()
    }

    if (period === 'month') {
      return orderDate.getFullYear() === referenceDate.getFullYear() && orderDate.getMonth() === referenceDate.getMonth()
    }

    if (period === 'quarter') {
      return orderDate.getFullYear() === referenceDate.getFullYear() && Math.floor(orderDate.getMonth() / 3) === Math.floor(referenceDate.getMonth() / 3)
    }

    return orderDate.getFullYear() === referenceDate.getFullYear()
  })
}

function getTrendBucket(order, period) {
  const date = parseOrderDate(order)
  if (period === 'day') {
    const hour = date.getHours()
    if (hour < 10) return '8a'
    if (hour < 12) return '10a'
    if (hour < 14) return '12p'
    if (hour < 16) return '2p'
    if (hour < 18) return '4p'
    if (hour < 20) return '6p'
    return '8p'
  }

  if (period === 'month') {
    const day = date.getDate()
    if (day <= 7) return 'W1'
    if (day <= 14) return 'W2'
    if (day <= 21) return 'W3'
    return 'W4'
  }

  if (period === 'quarter') {
    return `M${(date.getMonth() % 3) + 1}`
  }

  return date.toLocaleString('en-US', { month: 'short' })
}

function buildRevenueTrend(orders, period) {
  return chartLabels[period].map((label) => {
    const bucketOrders = orders.filter((order) => getTrendBucket(order, period) === label)
    return {
      label,
      revenue: bucketOrders.reduce((sum, order) => sum + orderTotal(order), 0),
      sales: bucketOrders.length,
    }
  })
}

function buildBuyerTimes(orders) {
  const total = Math.max(orders.length, 1)
  return buyerTimeWindows.map((slot) => {
    const count = orders.filter((order) => {
      const hour = parseOrderDate(order).getHours()
      return hour >= slot.from && hour < slot.to
    }).length

    return {
      label: slot.label,
      window: slot.window,
      value: Math.round((count / total) * 100),
    }
  })
}

function buildCategoryMix(orders, inventory) {
  const byProduct = new Map(inventory.map((item) => [item.id, item]))
  const totals = new Map()

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = byProduct.get(item.productId)
      const label = product?.categoryName || 'Uncategorized'
      totals.set(label, (totals.get(label) || 0) + Number(item.quantity || 0) * Number(item.price || 0))
    })
  })

  const entries = Array.from(totals.entries())
  if (entries.length === 0) return [{ label: 'No sales yet', revenue: 1, color: '#dfe5df' }]

  return entries.map(([label, revenue], index) => ({
    label,
    revenue,
    color: categoryColors[index % categoryColors.length],
  }))
}

function buildRepeatBuyers(orders) {
  const counts = new Map()
  orders.forEach((order) => {
    const buyerKey = order.buyerPhone || order.buyerName
    counts.set(buyerKey, (counts.get(buyerKey) || 0) + 1)
  })

  const buyers = Array.from(counts.values())
  const total = Math.max(buyers.length, 1)
  const newBuyers = buyers.filter((count) => count === 1).length
  const warmBuyers = buyers.filter((count) => count >= 2 && count <= 3).length
  const loyalBuyers = buyers.filter((count) => count >= 4).length

  return [
    { label: 'New buyers', value: Math.round((newBuyers / total) * 100) },
    { label: '2-3 orders', value: Math.round((warmBuyers / total) * 100) },
    { label: '4+ orders', value: Math.round((loyalBuyers / total) * 100) },
  ]
}

function buildTopProducts(orders) {
  const products = new Map()
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const current = products.get(item.productId) || { name: item.name, sales: 0, revenue: 0 }
      current.sales += Number(item.quantity || 0)
      current.revenue += Number(item.quantity || 0) * Number(item.price || 0)
      products.set(item.productId, current)
    })
  })

  const topProducts = Array.from(products.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((item) => ({ ...item, margin: 25 }))

  return topProducts.length ? topProducts : [{ name: 'No completed sales yet', sales: 0, revenue: 0, margin: 0 }]
}

function buildLossReasons(orders, revenue) {
  const cancelled = orders.filter((order) => order.status === 'Cancelled')
  const pendingPayments = orders.filter((order) => order.paymentStatus !== 'Paid' && order.status !== 'Completed')
  const pendingAmount = pendingPayments.reduce((sum, order) => sum + orderTotal(order), 0)

  return [
    { label: 'Unpaid active orders', amount: pendingAmount },
    { label: 'Cancelled orders', amount: cancelled.reduce((sum, order) => sum + orderTotal(order), 0) },
    { label: 'Estimated wastage', amount: Math.round(revenue * 0.02) },
    { label: 'Discount leakage', amount: Math.round(revenue * 0.01) },
  ]
}

function buildHealth(revenue, sales, repeatBuyers, loss) {
  const revenueQuality = Math.min(95, Math.round(revenue / 10) + 55)
  const buyerRetention = Math.min(95, repeatBuyers * 8 + 45)
  const lossControl = Math.max(35, 92 - Math.round(loss / Math.max(revenue, 1) * 100))
  const stockControl = sales > 0 ? 78 : 55
  const score = Math.round((revenueQuality + buyerRetention + stockControl + lossControl) / 4)

  return {
    score,
    revenueQuality,
    buyerRetention,
    stockControl,
    lossControl,
  }
}

function buildInsights({ sales, revenue, repeatBuyers, loss, topProduct }) {
  if (sales === 0) {
    return [
      { title: 'No completed sales yet', detail: 'Complete paid orders to unlock real revenue, buyer, and product insights.', tone: 'amber' },
      { title: 'Order flow is ready', detail: 'New and preparing orders will not count as revenue until payment and completion happen.', tone: 'blue' },
      { title: 'Firebase-ready source', detail: 'This analysis reads from the order source now; later it can point to Firestore orders.', tone: 'green' },
    ]
  }

  return [
    { title: `${topProduct.name} leads sales`, detail: `This item is currently your strongest revenue contributor at Rs ${Math.round(topProduct.revenue).toLocaleString('en-IN')}.`, tone: 'green' },
    { title: `${repeatBuyers} repeat buyers detected`, detail: 'Use this signal for loyalty offers and buyer reactivation once Firebase buyer profiles are connected.', tone: 'blue' },
    { title: `Loss exposure is Rs ${Math.round(loss).toLocaleString('en-IN')}`, detail: 'Unpaid active orders and estimated wastage are tracked separately from completed revenue.', tone: 'amber' },
  ]
}

export async function getAnalytics(period = 'month') {
  const [orders, inventory] = await Promise.all([getSellerOrders(), getOrderInventory()])
  const periodOrders = filterOrdersByPeriod(orders, period)
  const completedOrders = periodOrders.filter((order) => order.status === 'Completed' && order.paymentStatus === 'Paid')
  const revenue = completedOrders.reduce((sum, order) => sum + orderTotal(order), 0)
  const sales = completedOrders.length
  const units = completedOrders.reduce((sum, order) => sum + orderUnits(order), 0)
  const buyerKeys = new Set(completedOrders.map((order) => order.buyerPhone || order.buyerName))
  const repeatBuyerCount = Array.from(
    completedOrders.reduce((map, order) => {
      const key = order.buyerPhone || order.buyerName
      map.set(key, (map.get(key) || 0) + 1)
      return map
    }, new Map()).values(),
  ).filter((count) => count > 1).length
  const lossReasons = buildLossReasons(periodOrders, revenue)
  const loss = lossReasons.reduce((sum, item) => sum + item.amount, 0)
  const topProducts = buildTopProducts(completedOrders)
  const profit = Math.max(0, Math.round(revenue * 0.72 - loss))

  return {
    period,
    label: periodLabels[period],
    source: 'orders',
    kpis: {
      revenue,
      sales,
      profit,
      loss,
      repeatBuyers: repeatBuyerCount,
      avgOrderValue: sales ? Math.round(revenue / sales) : 0,
      units,
      buyers: buyerKeys.size,
    },
    revenueTrend: buildRevenueTrend(completedOrders, period),
    buyerTimes: buildBuyerTimes(completedOrders),
    categoryMix: buildCategoryMix(completedOrders, inventory),
    repeatBuyerCohorts: buildRepeatBuyers(completedOrders),
    topProducts,
    lossReasons,
    forecast: [
      { label: 'Next 7d revenue', value: Math.round(revenue * 1.12), confidence: sales ? 72 : 35 },
      { label: 'Likely orders', value: Math.max(0, Math.round(sales * 1.1)), confidence: sales ? 68 : 30 },
      { label: 'Stock risk items', value: inventory.filter((item) => item.quantity <= 5).length, confidence: 86 },
    ],
    insights: buildInsights({ sales, revenue, repeatBuyers: repeatBuyerCount, loss, topProduct: topProducts[0] }),
    health: buildHealth(revenue, sales, repeatBuyerCount, loss),
  }
}
