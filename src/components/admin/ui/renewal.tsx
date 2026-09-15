
import { RefreshCw } from 'lucide-react'
import {
  type AccreditationStatus,
  type CredentialExpiry,
  type CredentialWindow,
  type ReviewStatus,
} from '../../../lib/api'
import { day } from './format'

export const RENEWAL_ORANGE = '#F97316'
const PENDING_AMBER = '#F5C400'
const EXPIRED_RED = '#EF4444'
const OK_GREEN = '#22C55E'
const MUTED = '#8891A8'

export const EXPIRING_SOON_DAYS = 30
export const EXPIRING_URGENT_DAYS = 7

export type CredentialKey = 'license' | 'insurance'

export type DocumentState =
  | 'none'
  | 'approved'
  | 'first_review'
  | 'renewal'
  | 'expired'
  | 'rejected'

export interface CredentialView {
  key: CredentialKey
  noun: string
  status: ReviewStatus | null
  state: DocumentState
  window: CredentialWindow | null
}

export interface CredentialSource {
  accreditationStatus?: AccreditationStatus | null
  licenseStatus?: ReviewStatus | null
  insuranceStatus?: ReviewStatus | null
  licenseExpirationDate?: string | null
  insuranceExpirationDate?: string | null
  accreditation?: {
    status?: AccreditationStatus | null
    license?: ReviewStatus | null
    insurance?: ReviewStatus | null
  } | null
  expiry?: CredentialExpiry | null
}

const todayIso = () => {
  const now = new Date()
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => String(part).padStart(index ? 2 : 4, '0'))
    .join('-')
}

function windowFromDate(date?: string | null): CredentialWindow | null {
  if (!date) return null
  const iso = date.slice(0, 10)
  const target = Date.parse(iso + 'T00:00:00Z')
  const daysLeft = Number.isNaN(target)
    ? null
    : Math.round((target - Date.parse(todayIso() + 'T00:00:00Z')) / 86400000)

  return {
    expirationDate: iso,
    expired: iso < todayIso(),
    daysLeft,
    expiringSoon: daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS,
  }
}

function stateOf(
  status: ReviewStatus | null,
  approvedBefore: boolean,
  window: CredentialWindow | null,
): DocumentState {
  if (!status) return 'none'
  if (status === 'rejected') return 'rejected'
  if (status === 'approved') return window?.expired ? 'expired' : 'approved'
  if (!approvedBefore) return 'first_review'
  return window?.expired ? 'expired' : 'renewal'
}

export function credentials(source?: CredentialSource | null) {
  const status = source?.accreditationStatus ?? source?.accreditation?.status ?? null
  const approvedBefore = status === 'approved'

  const read = (key: CredentialKey, noun: string, own: ReviewStatus | null | undefined, date?: string | null): CredentialView => {
    const window = source?.expiry?.[key] ?? windowFromDate(date)
    return { key, noun, status: own ?? null, state: stateOf(own ?? null, approvedBefore, window), window }
  }

  const license = read(
    'license',
    'Licence',
    source?.licenseStatus ?? source?.accreditation?.license,
    source?.licenseExpirationDate,
  )
  const insurance = read(
    'insurance',
    'Insurance',
    source?.insuranceStatus ?? source?.accreditation?.insurance,
    source?.insuranceExpirationDate,
  )

  return { license, insurance, accreditationStatus: status }
}

export type RenewalKind = 'none' | 'license' | 'insurance' | 'both'

const RENEWAL_LABELS: Record<Exclude<RenewalKind, 'none'>, string> = {
  license: 'Licence renewal pending',
  insurance: 'Insurance renewal pending',
  both: 'Document renewal pending',
}

export function renewalOf(source?: CredentialSource | null) {
  const { license, insurance } = credentials(source)
  const renewing = license.state === 'renewal'
  const insuring = insurance.state === 'renewal'

  const kind: RenewalKind =
    renewing && insuring ? 'both' : renewing ? 'license' : insuring ? 'insurance' : 'none'

  return {
    kind,
    label: kind === 'none' ? null : RENEWAL_LABELS[kind],
    license,
    insurance,
    expired: license.state === 'expired' || insurance.state === 'expired',
    expiringSoon:
      (license.state === 'approved' && Boolean(license.window?.expiringSoon)) ||
      (insurance.state === 'approved' && Boolean(insurance.window?.expiringSoon)),
  }
}

export function matchesDerived(view: string, source?: CredentialSource | null) {
  const renewal = renewalOf(source)
  if (view === 'renewal') return renewal.kind !== 'none'
  if (view === 'expired') return renewal.expired
  if (view === 'expiring') return renewal.expiringSoon
  return true
}


function Pill({ color, children, title }: { color: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: color + '1F', color }}
    >
      {children}
    </span>
  )
}

export function RenewalBadge({ source }: { source?: CredentialSource | null }) {
  const { label } = renewalOf(source)
  if (!label) return null

  return (
    <Pill
      color={RENEWAL_ORANGE}
      title="Already approved — has submitted an updated document that needs re-verification."
    >
      <RefreshCw size={11} />
      {label}
    </Pill>
  )
}

const DOCUMENT_STATE: Record<DocumentState, { text: string; color: string; explain: string } | null> = {
  none: null,
  approved: { text: 'Approved', color: OK_GREEN, explain: 'Verified and current.' },
  first_review: { text: 'Pending', color: PENDING_AMBER, explain: 'Never approved — waiting for its first review.' },
  renewal: { text: 'Renewal pending', color: RENEWAL_ORANGE, explain: 'Was approved; an updated document has been submitted and needs re-verification.' },
  expired: { text: 'Expired', color: EXPIRED_RED, explain: 'The document on file has run out — a current one is owed.' },
  rejected: { text: 'Rejected', color: EXPIRED_RED, explain: 'An admin rejected this document.' },
}

export function DocumentBadge({ credential }: { credential: CredentialView }) {
  const shown = DOCUMENT_STATE[credential.state]
  if (!shown) return null

  return (
    <Pill color={shown.color} title={shown.explain}>
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: shown.color }} />
      <span className="opacity-70 font-medium">{credential.noun}</span>
      {shown.text}
    </Pill>
  )
}

function expiryText(window: CredentialWindow) {
  const { daysLeft, expirationDate } = window
  if (window.expired) {
    return { text: 'Expired ' + day(expirationDate), color: EXPIRED_RED }
  }
  if (daysLeft === null) return { text: 'Expires ' + day(expirationDate), color: MUTED }
  if (daysLeft === 0) return { text: 'Expires today', color: EXPIRED_RED }
  if (daysLeft <= EXPIRING_URGENT_DAYS) {
    return { text: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, color: EXPIRED_RED }
  }
  if (daysLeft <= EXPIRING_SOON_DAYS) {
    return { text: `Expires in ${daysLeft} days`, color: PENDING_AMBER }
  }
  return { text: 'Expires ' + day(expirationDate), color: MUTED }
}

export function ExpiryChip({ window, noun, quiet }: {
  window?: CredentialWindow | null
  noun?: string
  quiet?: boolean
}) {
  if (!window?.expirationDate) return null
  if (quiet && !window.expired && !window.expiringSoon) return null
  const { text, color } = expiryText(window)

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap" style={{ color }}>
      {noun && <span className="opacity-60">{noun}</span>}
      {text}
    </span>
  )
}

export function ExpiryValue({ window }: { window?: CredentialWindow | null }) {
  if (!window?.expirationDate) return null
  const { color } = expiryText(window)
  const plain = day(window.expirationDate)
  const text = window.expired ? 'Expired' : expiryText(window).text

  return text.startsWith('Expires ')
    ? <>{plain}</>
    : (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span>{plain}</span>
        <span className="text-[11px] font-semibold" style={{ color }}>{text}</span>
      </span>
    )
}

export function DocumentNote({ credential }: { credential: CredentialView }) {
  if (credential.state !== 'renewal' && credential.state !== 'expired') return null

  const renewal = credential.state === 'renewal'
  const color = renewal ? RENEWAL_ORANGE : EXPIRED_RED
  const noun = credential.noun.toLowerCase()

  return (
    <div
      className="rounded-xl px-4 py-3 mb-5"
      style={{ background: color + '14', border: '1px solid ' + color + '4D' }}
    >
      <p className="flex items-start gap-2 text-sm font-semibold" style={{ color }}>
        <RefreshCw size={14} className="flex-shrink-0 mt-0.5" />
        {renewal ? 'This ' + noun + ' is a renewal' : 'This ' + noun + ' has expired'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {renewal
          ? 'The driver was already approved and has submitted an updated ' + noun +
            '. Check the document and the expiry date below, then approve or reject this item — the rest of the application was verified before.'
          : 'The ' + noun + ' on file ran out' +
            (credential.window?.expirationDate ? ' on ' + day(credential.window.expirationDate) : '') +
            '. It needs a current document before it can be approved again.'}
      </p>
    </div>
  )
}
