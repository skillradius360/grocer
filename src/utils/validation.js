export const patterns = {
  decimal: /^-?\d+(\.\d+)?$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  name: /^[A-Za-z][A-Za-z\s.'-]{1,59}$/,
  phone: /^\+?[0-9\s-]{10,16}$/,
  pincode: /^[1-9][0-9]{5}$/,
  positiveNumber: /^(0|[1-9]\d*)(\.\d+)?$/,
  shopName: /^[A-Za-z0-9][A-Za-z0-9\s&.'-]{1,79}$/,
}

export function digitsOnly(value, maxLength) {
  const nextValue = String(value || '').replace(/\D/g, '')
  return maxLength ? nextValue.slice(0, maxLength) : nextValue
}

export function decimalOnly(value, maxLength) {
  const nextValue = String(value || '')
    .replace(/[^\d.-]/g, '')
    .replace(/(?!^)-/g, '')
    .replace(/(\..*)\./g, '$1')
  return maxLength ? nextValue.slice(0, maxLength) : nextValue
}

export function validateByRule(value, rule) {
  const nextValue = String(value ?? '').trim()
  if (rule.required && !nextValue) return 'Required'
  if (!nextValue && !rule.required) return ''
  if (rule.pattern && !rule.pattern.test(nextValue)) return rule.message
  if (typeof rule.min === 'number' && Number(nextValue) < rule.min) return rule.message
  if (typeof rule.max === 'number' && Number(nextValue) > rule.max) return rule.message
  return ''
}

export function validateFieldsByRules(values, rules, fieldNames = Object.keys(rules)) {
  return fieldNames.reduce((errors, field) => {
    const message = validateByRule(values[field], rules[field] || {})
    if (message) errors[field] = message
    return errors
  }, {})
}
