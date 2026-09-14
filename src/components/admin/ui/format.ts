
export const money = (cents?: number | null) =>
  typeof cents === 'number' ? '$' + (cents / 100).toFixed(2) : '—'

export const decimal = (value?: number | string | null) => {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export const day = (value?: string | null) => {
  if (!value) return '—'
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return (plain ? new Date(+plain[1], +plain[2] - 1, +plain[3]) : new Date(value)).toLocaleDateString()
}

export const dateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—'

export const humanise = (value: string) => value.replace(/_/g, ' ')

export const yesNo = (value?: boolean | null) =>
  value === true ? 'Yes' : value === false ? 'No' : '—'

export function itemLines(items: unknown): string[] {
  if (items == null || items === '') return []
  if (typeof items === 'string') return [items]
  if (typeof items === 'number' || typeof items === 'boolean') return [String(items)]

  if (Array.isArray(items)) {
    return items.flatMap((item) => {
      if (item == null) return []
      if (typeof item !== 'object') return [String(item)]

      const entry = item as Record<string, unknown>
      const name = entry.name ?? entry.title ?? entry.item ?? entry.description
      const qty = entry.qty ?? entry.quantity

      if (name == null) return [JSON.stringify(item)]
      return [qty != null && qty !== '' ? `${qty} × ${String(name)}` : String(name)]
    })
  }

  return [JSON.stringify(items)]
}

export const timeAgo = (value?: string | null) => {
  if (!value) return '—'
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  return dateTime(value)
}

export const mapsUrl = (lat?: number | string | null, lng?: number | string | null) => {
  const a = decimal(lat)
  const b = decimal(lng)
  return a !== null && b !== null ? `https://www.google.com/maps?q=${a},${b}` : null
}

export const safeHttpUrl = (value?: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}