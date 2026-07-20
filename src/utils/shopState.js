export const TRIAL_DAYS = 15
export const LOW_BALANCE_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

function numberOrZero(value) {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

function daysSince(dateValue) {
  const createdAt = Date.parse(dateValue || '')
  if (Number.isNaN(createdAt)) return 0
  return Math.max(0, Math.floor((Date.now() - createdAt) / DAY_MS))
}

export function getShopServiceState(sellerSession) {
  const shop = sellerSession?.shop || {}
  const billing = sellerSession?.billing || {}
  const joinedDays = daysSince(shop.createdAt || sellerSession?.createdAt)
  const walletBalance = numberOrZero(billing.walletBalance)
  const weeklyPayoutRequirement = numberOrZero(billing.weeklyPayoutRequirement || billing.weeklyServiceRequirement)
  const hasLowBalance = weeklyPayoutRequirement > 0 && walletBalance < weeklyPayoutRequirement

  if (joinedDays < TRIAL_DAYS) {
    return {
      status: 'trial',
      label: 'Trial',
      tone: 'amber',
      reason: `${TRIAL_DAYS - joinedDays} trial days left`,
      canServe: true,
      walletBalance,
      weeklyPayoutRequirement,
      joinedDays,
    }
  }

  if (hasLowBalance) {
    return {
      status: 'recharge',
      label: 'Recharge',
      tone: 'red',
      reason: 'Recharge first to enable services',
      canServe: false,
      walletBalance,
      weeklyPayoutRequirement,
      joinedDays,
    }
  }

  return {
    status: 'live',
    label: 'Live',
    tone: 'green',
    reason: 'Balance is enough for service',
    canServe: true,
    walletBalance,
    weeklyPayoutRequirement,
    joinedDays,
  }
}
