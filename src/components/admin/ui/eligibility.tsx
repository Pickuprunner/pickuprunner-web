
import { AlertCircle } from 'lucide-react'

type Eligibility = { eligible: boolean; code?: string | null; reason?: string | null }

const ELIGIBILITY: Record<string, { label: string; color: string; explain: string }> = {
  not_started: { label: 'Not started', color: '#8891A8', explain: "Hasn't started the driver application." },
  in_progress: { label: 'Application unfinished', color: '#6699FF', explain: "Hasn't submitted the application yet." },
  under_review: { label: 'Waiting for review', color: '#F5C400', explain: 'Submitted — waiting for an admin to approve or reject it.' },
  rejected: { label: 'Application rejected', color: '#EF4444', explain: 'An admin rejected the application. The driver can fix it and resubmit.' },
  license_not_approved: { label: 'Licence not approved', color: '#F5C400', explain: "The driver's licence hasn't been approved." },
  license_expired: { label: 'Licence expired', color: '#EF4444', explain: 'The licence on file has expired — they need to upload a current one.' },
  insurance_not_approved: { label: 'Insurance not approved', color: '#F5C400', explain: "The insurance hasn't been approved." },
  insurance_expired: { label: 'Insurance expired', color: '#EF4444', explain: 'The insurance on file has expired — they need to upload a current policy.' },
  background_not_approved: { label: 'Background check pending', color: '#F5C400', explain: "The background check hasn't been approved." },
}

export function eligibilityInfo(eligibility?: Eligibility | null) {
  if (eligibility?.eligible) {
    return { label: 'Can take orders', color: '#22C55E', explain: 'Fully approved — can take deliveries.' }
  }
  const known = eligibility?.code ? ELIGIBILITY[eligibility.code] : undefined
  return known ?? {
    label: "Can't take orders",
    color: '#EF4444',
    explain: eligibility?.reason || 'Not approved to take deliveries.',
  }
}

export function EligibilityBadge({ eligibility }: { eligibility?: Eligibility | null }) {
  const { label, color, explain } = eligibilityInfo(eligibility)

  return (
    <span
      title={explain}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: `${color}1A`, border: `1px solid ${color}59`, color }}
    >
      {label}
    </span>
  )
}

export function EligibilityNote({ eligibility }: { eligibility?: Eligibility | null }) {
  if (!eligibility || eligibility.eligible) return null

  return (
    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
      <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
      {eligibilityInfo(eligibility).explain}
    </p>
  )
}
