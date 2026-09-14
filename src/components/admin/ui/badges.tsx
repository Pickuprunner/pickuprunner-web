
import { humanise } from './format'

const STATUS_COLORS: Record<string, string> = {
  approved: '#22C55E',
  delivered: '#22C55E',
  paid: '#22C55E',
  test_paid: '#22C55E',
  active: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#EF4444',
  failed: '#EF4444',
  suspended: '#EF4444',
  under_review: '#F5C400',
  in_review: '#F5C400',
  pending: '#F5C400',
  unpaid: '#F5C400',
  link_sent: '#F5C400',
  refunded: '#F5C400',
  in_progress: '#6699FF',
  assigned: '#6699FF',
  accepted: '#6699FF',
  picked_up: '#6699FF',
  en_route: '#6699FF',
  shopping: '#6699FF',
  not_started: '#8891A8',
  verified: '#22C55E',
  unverified: '#F5C400',
  on_duty: '#22C55E',
  off_duty: '#8891A8',
  you: '#6699FF',
  deleted: '#EF4444',
}

export function StatusBadge({ label, value }: { label?: string; value?: string | null }) {
  if (!value) return null

  const color = STATUS_COLORS[value] || '#8891A8'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap"
      style={{ background: `${color}1F`, color }}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: color }} />
      {label && <span className="opacity-70 font-medium">{label}</span>}
      {humanise(value)}
    </span>
  )
}
