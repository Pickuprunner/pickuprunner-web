import { useCallback, useEffect, useRef, useState } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  Check,
  ClipboardList,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  UserRound,
  X,
} from 'lucide-react'

import {
  accreditationsApi,
  adminApi,
  chatApi,
  deliveryApi,
  usersApi,
  type AccreditationProfile,
  type AccountStatus,
  type AdminAccount,
  type AdminOrderQuery,
  type BackgroundStatus,
  type ChatMessage,
  type DriverDocumentType,
  type ItemDecision,
  type OrderStatus,
  type PaymentStatus,
  type ReviewStatus,
  type Role,
} from '../lib/api'

import {
  Avatar,
  BackLink,
  Card,
  dateTime,
  day,
  decimal,
  DetailHeader,
  EligibilityBadge,
  ErrorLine,
  Field,
  Fields,
  humanise,
  itemLines,
  mapsUrl,
  MissingImage,
  money,
  Panel,
  PanelSection,
  Section,
  SignedImage,
  safeHttpUrl,
  Spinner,
  Stat,
  StatusBadge,
  TextLink,
  timeAgo,
  useAdmin,
  useAdminData,
  useRegisterReload,
  yesNo,
} from './AdminUi'

import { AccountControls, ReviewActions } from './AdminPanels'
import { ageFrom, isPast } from './AdminQuickCheck'

const orderDetailRoute = getRouteApi('/admin/orders/$orderId')
const customerDetailRoute = getRouteApi('/admin/customers/$customerId')
const driverDetailRoute = getRouteApi('/admin/drivers/$driverId')
const applicationDetailRoute = getRouteApi('/admin/applications/$userId')
const accountDetailRoute = getRouteApi('/admin/accounts/$userId')

// ── Shared pieces ───────────────────────────────────────────────────────────

/**
 * Reload the screen's main record and bump `version`, which the sections that
 * load their own data (order history, chat, signed images) watch — so the
 * header's Refresh button refreshes everything on the page.
 */
function useScreenRefresh(reload: () => void) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => {
    reload()
    setVersion((v) => v + 1)
  }, [reload])
  useRegisterReload(refresh)
  return version
}

/** Loading / error / not-found wrapper shared by every detail screen. */
function DetailState({ loading, error, found, children }: {
  loading: boolean
  error: string
  found: boolean
  children: React.ReactNode
}) {
  if (loading && !found) return <Spinner />

  if (!found) {
    return (
      <Card>
        <div className="py-10 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">{error || 'Not found'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the link, or go back to the list.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <ErrorLine message={error} />
      <div className="space-y-4">{children}</div>
    </>
  )
}

function StatsRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{children}</div>
}

function Contact({ account }: { account: { email?: string | null; phone?: string | null } }) {
  return <>{[account.email, account.phone].filter(Boolean).join(' · ') || 'No contact details'}</>
}

function MapLink({ lat, lng, label = 'Open in Maps' }: {
  lat?: number | string | null
  lng?: number | string | null
  label?: string
}) {
  const href = mapsUrl(lat, lng)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
    >
      <MapPin size={12} />{label}<ExternalLink size={10} />
    </a>
  )
}

type OrderRow = {
  id: string
  ref: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  amountCents: number | null
  deliveryAddress: string | null
  createdAt: string
}

function OrderRows({ orders }: { orders: OrderRow[] }) {
  return (
    <ul className="divide-y divide-border -my-2">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            to="/admin/orders/$orderId"
            params={{ orderId: order.id }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 hover:bg-primary/5 rounded-lg px-2 -mx-2"
          >
            <span className="font-mono text-xs font-semibold text-foreground">#{order.ref}</span>
            <StatusBadge value={order.status} />
            <StatusBadge label="Payment" value={order.paymentStatus} />
            <span className="flex-1 min-w-[8rem] truncate text-xs text-muted-foreground">
              {order.deliveryAddress || '—'}
            </span>
            <span className="text-xs text-muted-foreground">{day(order.createdAt)}</span>
            <span className="text-sm font-semibold text-foreground w-20 text-right">
              {money(order.amountCents)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const HISTORY_PAGE = 25

/** Every order for one customer or driver, newest first, a page at a time. */
function OrderHistory({ title, filter, version, empty, inPanel = false }: {
  title: string
  filter: Pick<AdminOrderQuery, 'customerId' | 'driverUserId'>
  version: number
  empty: string
  /** Render as a section of a Panel instead of its own card. */
  inPanel?: boolean
}) {
  const { token } = useAdmin()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)
  const key = filter.customerId ?? filter.driverUserId ?? ''

  const load = useCallback(async (nextPage: number) => {
    const id = ++request.current
    setLoading(true)
    setError('')

    try {
      const result = await adminApi.orders(token, { ...filter, limit: HISTORY_PAGE, page: nextPage })
      if (request.current !== id) return
      setOrders((current) => (nextPage === 1 ? result.orders : [...current, ...result.orders]))
      setTotal(result.total)
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch (err) {
      if (request.current === id) setError(err instanceof Error ? err.message : 'Could not load orders.')
    } finally {
      if (request.current === id) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, key])

  useEffect(() => {
    load(1)
    const pending = request
    return () => { pending.current++ }
  }, [load, version])

  const Wrapper = inPanel ? PanelSection : Section

  return (
    <Wrapper title={total !== null ? `${title} (${total})` : title}>
      <ErrorLine message={error} />

      {loading && !orders.length ? (
        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div>
      ) : orders.length ? (
        <>
          <OrderRows orders={orders} />
          {hasMore && (
            <button
              type="button"
              onClick={() => load(page + 1)}
              disabled={loading}
              className="mt-4 w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {loading ? 'Loading…' : `Show more (${orders.length} of ${total})`}
            </button>
          )}
        </>
      ) : (
        !error && <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </Wrapper>
  )
}

const SENDER_STYLE: Record<ChatMessage['senderRole'], { label: string; color: string; align: string }> = {
  customer: { label: 'Customer', color: '#6699FF', align: 'items-start' },
  driver: { label: 'Driver', color: '#22C55E', align: 'items-end' },
  admin: { label: 'Support', color: '#F5C400', align: 'items-end' },
}

/** The order's customer ↔ driver conversation, read-only. */
function OrderChat({ orderId, version }: { orderId: string; version: number }) {
  const { token } = useAdmin()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasOlder, setHasOlder] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)

  const load = useCallback(async (before?: string) => {
    const id = ++request.current
    setLoading(true)
    setError('')

    try {
      const page = await chatApi.messages(token, orderId, before)
      if (request.current !== id) return
      setMessages((current) => (before ? [...page.messages, ...current] : page.messages))
      setCursor(page.oldestCursor)
      setHasOlder(page.hasOlder)
    } catch (err) {
      if (request.current === id) setError(err instanceof Error ? err.message : 'Could not load the conversation.')
    } finally {
      if (request.current === id) setLoading(false)
    }
  }, [token, orderId])

  useEffect(() => {
    load()
    const pending = request
    return () => { pending.current++ }
  }, [load, version])

  return (
    <Section title={`Conversation${messages.length ? ` (${messages.length}${hasOlder ? '+' : ''})` : ''}`}>
      <ErrorLine message={error} />

      {hasOlder && (
        <button
          type="button"
          onClick={() => cursor && load(cursor)}
          disabled={loading}
          className="mb-3 w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Load earlier messages'}
        </button>
      )}

      {loading && !messages.length ? (
        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div>
      ) : messages.length ? (
        <ol className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {messages.map((message) =>
            message.isSystem ? (
              <li key={message.id} className="text-center">
                <span className="inline-block rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                  {message.body} · {dateTime(message.createdAt)}
                </span>
              </li>
            ) : (
              <li key={message.id} className={'flex flex-col ' + SENDER_STYLE[message.senderRole].align}>
                <span className="text-[10px] font-semibold mb-0.5" style={{ color: SENDER_STYLE[message.senderRole].color }}>
                  {SENDER_STYLE[message.senderRole].label}
                </span>
                <p
                  className="max-w-[85%] rounded-2xl px-3 py-2 text-sm text-foreground whitespace-pre-wrap break-words"
                  style={{ background: `${SENDER_STYLE[message.senderRole].color}1F` }}
                >
                  {message.body}
                </p>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {dateTime(message.createdAt)}{message.readAt ? ' · read' : ''}
                </span>
              </li>
            ),
          )}
        </ol>
      ) : (
        !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MessageSquare size={12} />No messages on this order.
          </p>
        )
      )}
    </Section>
  )
}

type DocKey = keyof AccreditationProfile['documents']

/** One uploaded document, inline through a signed link, or a "not uploaded" tile. */
function DocumentTile({ userId, type, docKey, label, documents, version }: {
  userId: string
  type: DriverDocumentType
  docKey: DocKey
  label: string
  documents?: AccreditationProfile['documents']
  version: number
}) {
  const { token } = useAdmin()

  return documents?.[docKey] ? (
    <SignedImage
      label={label}
      load={() => accreditationsApi.document(token, userId, type)}
      deps={[token, userId, type, version]}
    />
  ) : (
    <MissingImage label={label} />
  )
}

type Choice<T extends string> = { value: T; label: string; color: string; icon: React.ReactNode }

/**
 * Approve / Pending / Reject for one item (licence, insurance or background).
 * Approve and Pending apply at once; Reject asks for the reason the driver
 * will see first. The overall status is recalculated by the server.
 */
function ItemReview<T extends string>({ item, value, choices, rejectValue, blocked, onDecide }: {
  item: string
  value: T
  choices: Choice<T>[]
  rejectValue: T
  /** Choices that can't be picked right now, with the reason (shown as a tooltip and a note). */
  blocked?: Partial<Record<T, string>>
  onDecide: (next: T, reason?: string) => Promise<void>
}) {
  const [busy, setBusy] = useState<T | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const decide = async (next: T, why?: string) => {
    setBusy(next)
    setError('')
    try {
      await onDecide(next, why)
      setRejecting(false)
      setReason('')
      const label = choices.find((c) => c.value === next)?.label.toLowerCase()
      const done = next === rejectValue ? 'rejected' : label === 'approve' ? 'approved' : `set to ${label}`
      toast.success(`${item.charAt(0).toUpperCase() + item.slice(1)} ${done}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  // Several choices are often blocked for the same reason (e.g. all three
  // while the application isn't submitted) — say each reason once.
  const notes = [...new Set(Object.values(blocked ?? {}).filter(Boolean) as string[])]

  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2">Your decision on the {item}</p>

      <div
        role="radiogroup"
        aria-label={`${item} decision`}
        className="inline-flex flex-wrap gap-1 rounded-lg p-1"
        style={{ background: 'hsl(0 0% 100% / 0.05)' }}
      >
        {choices.map((choice) => {
          const current = value === choice.value
          const why = blocked?.[choice.value]
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={current}
              disabled={busy !== null || Boolean(why) || (current && choice.value !== rejectValue)}
              title={why || (current ? `Currently ${choice.label.toLowerCase()}` : undefined)}
              onClick={() => {
                if (choice.value === rejectValue) {
                  setRejecting(true)
                  setError('')
                } else {
                  decide(choice.value)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
              style={
                current
                  ? { background: choice.color, color: choice.value === rejectValue ? '#fff' : '#04120A' }
                  : { color: why ? 'hsl(var(--muted-foreground) / 0.5)' : choice.color }
              }
            >
              {busy === choice.value ? <Loader2 size={12} className="animate-spin" /> : choice.icon}
              {choice.label}
            </button>
          )
        })}
      </div>

      {rejecting && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`reject-${item}`} className="block text-xs font-semibold text-muted-foreground">
            Why is the {item} rejected? The driver sees this.
          </label>
          <textarea
            id={`reject-${item}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            autoFocus
            placeholder={`e.g. The ${item} photo is blurry — upload a clearer one.`}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide(rejectValue, reason.trim())}
              disabled={!reason.trim() || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#EF4444', color: '#fff' }}
            >
              {busy === rejectValue ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
              Reject {item}
            </button>
            <button
              type="button"
              onClick={() => { setRejecting(false); setReason(''); setError('') }}
              disabled={busy !== null}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.map((note) => (
        <p key={note} className="mt-2 text-[11px] text-muted-foreground flex items-start gap-1.5">
          <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />{note}
        </p>
      ))}

      {error && (
        <p className="mt-2 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />{error}
        </p>
      )}
    </div>
  )
}

const REVIEW_CHOICES: Choice<ReviewStatus>[] = [
  { value: 'approved', label: 'Approve', color: '#22C55E', icon: <Check size={12} /> },
  { value: 'pending', label: 'Pending', color: '#F5C400', icon: <Clock size={12} /> },
  { value: 'rejected', label: 'Reject', color: '#EF4444', icon: <X size={12} /> },
]

const BACKGROUND_CHOICES: Choice<BackgroundStatus>[] = [
  { value: 'approved', label: 'Approve', color: '#22C55E', icon: <Check size={12} /> },
  { value: 'in_review', label: 'In review', color: '#F5C400', icon: <Clock size={12} /> },
  { value: 'rejected', label: 'Reject', color: '#EF4444', icon: <X size={12} /> },
]

const vehicleLine = (profile: AccreditationProfile) =>
  [profile.vehicleYear, profile.vehicleColor, profile.vehicleMake, profile.vehicleModel]
    .filter(Boolean)
    .join(' ') || null

/** Why the licence can't be approved yet, if a side of it is missing. */
function licencePhotoGap(
  documents: { licenseFront?: boolean; licenseBack?: boolean } | null | undefined,
  alreadyApproved: boolean,
) {
  const gone = [!documents?.licenseFront && 'front', !documents?.licenseBack && 'back'].filter(Boolean)
  if (gone.length === 0) return undefined
  // Approved before both sides were required — say so, rather than "can't approve".
  if (alreadyApproved) {
    return `Approved without the ${gone.join(' and ')} of the licence — set it to Pending or Reject and ask the driver to upload it.`
  }
  return gone.length === 2
    ? 'No licence photos uploaded — nothing to approve yet.'
    : `The ${gone[0]} of the licence isn't uploaded — both sides are needed to approve it.`
}

/** A yes/no with a coloured dot: green on, yellow needs a look, grey off. */
function OnOff({ on, warn, text }: { on: boolean; warn?: boolean; text: string }) {
  const color = on ? '#22C55E' : warn ? '#F5C400' : '#8891A8'
  return (
    <span className="inline-flex items-center gap-2" style={{ color }}>
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}

// ── Driver application sections ──────────────────────────────────

const EXPIRED_RED = '#EF4444'

/** A date that can run out (licence, insurance) — red and labelled once it has. */
function ExpiryValue({ date }: { date: string }) {
  return isPast(date)
    ? <span className="font-semibold" style={{ color: EXPIRED_RED }}>Expired {day(date)}</span>
    : <>{day(date)}</>
}

const withAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null
  const age = ageFrom(dateOfBirth)
  return age === null ? day(dateOfBirth) : `${day(dateOfBirth)} (age ${age})`
}

/**
 * Approve / Reject for a whole application, under the page header: the reason
 * it was last rejected (if any), the buttons, and — once, under them — what's
 * still missing.
 */
function DecisionBar({ profile, missing, onReviewed }: {
  profile: AccreditationProfile
  missing: string[]
  onReviewed: () => void
}) {
  const { token } = useAdmin()

  return (
    <div className="space-y-3">
      {profile.rejectionReason && (
        <p className="text-sm flex items-start gap-1.5" style={{ color: EXPIRED_RED }}>
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span><span className="font-semibold">Rejected:</span> {profile.rejectionReason}</span>
        </p>
      )}
      <ReviewActions
        application={{ ...profile, missing }}
        token={token}
        onReviewed={onReviewed}
        name={profile.legalName}
      />
    </div>
  )
}

/**
 * The three things an admin checks on a driver's application — licence,
 * insurance, background check — as sections of one Panel. Each document sits
 * next to the details it should match, with Approve / Pending / Reject for it.
 */
function ProfileSections({ profile, version, onReviewed }: {
  profile: AccreditationProfile
  version: number
  /** Called after a decision is saved, to reload the page. */
  onReviewed: () => void
}) {
  const { token } = useAdmin()
  const userId = profile.userId

  const save = async (decision: ItemDecision) => {
    await accreditationsApi.review(token, userId, decision)
    onReviewed()
  }

  // Items can be decided before the driver submits; only a missing photo or
  // missing consent blocks a choice. (The first argument is kept so each call
  // still lists the choices it covers.)
  const reviewBlock = <T extends string>(_values: T[], extra?: Partial<Record<T, string>>) => extra

  const consentRecord = [
    profile.backgroundConsentIp && `from IP ${profile.backgroundConsentIp}`,
    profile.backgroundDisclosureVersion && `disclosure ${profile.backgroundDisclosureVersion}`,
  ].filter(Boolean).join(' · ')

  return (
    <>
      <PanelSection id="licence" title="Driver's licence" action={<StatusBadge value={profile.licenseStatus} />}>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Fields>
            <Field label="Name on application" value={profile.legalName} />
            <Field label="Date of birth" value={withAge(profile.dateOfBirth)} />
            <Field label="State" value={profile.licenseState} />
            <Field label="Licence number" value={profile.licenseNumber} mono />
            <Field
              label="Expires"
              value={profile.licenseExpirationDate ? <ExpiryValue date={profile.licenseExpirationDate} /> : null}
            />
          </Fields>
          <div className="grid grid-cols-2 gap-3 content-start max-w-xl">
            <DocumentTile userId={userId} type="license_front" docKey="licenseFront" label="Front" documents={profile.documents} version={version} />
            <DocumentTile userId={userId} type="license_back" docKey="licenseBack" label="Back" documents={profile.documents} version={version} />
          </div>
        </div>
        <ItemReview<ReviewStatus>
          item="licence"
          value={profile.licenseStatus}
          choices={REVIEW_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<ReviewStatus>(['approved', 'pending', 'rejected'], {
            // Both sides are needed to check a licence; the server refuses it too.
            approved: licencePhotoGap(profile.documents, profile.licenseStatus === 'approved'),
          })}
          onDecide={(next, reason) => save({ licenseStatus: next, rejectionReason: reason })}
        />
      </PanelSection>

      <PanelSection id="insurance" title="Insurance" action={<StatusBadge value={profile.insuranceStatus} />}>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Fields>
            <Field label="Company" value={profile.insuranceCompany} />
            <Field label="Policy number" value={profile.insurancePolicyNumber} mono />
            <Field label="Starts" value={profile.insuranceEffectiveDate ? day(profile.insuranceEffectiveDate) : null} />
            <Field
              label="Expires"
              value={profile.insuranceExpirationDate ? <ExpiryValue date={profile.insuranceExpirationDate} /> : null}
            />
            <Field label="NAIC (company code)" value={profile.insuranceNaicNumber} mono />
          </Fields>
          <div className="grid grid-cols-2 gap-3 content-start max-w-xl">
            <DocumentTile userId={userId} type="insurance_card" docKey="insuranceCard" label="Insurance card" documents={profile.documents} version={version} />
          </div>
        </div>
        <ItemReview<ReviewStatus>
          item="insurance"
          value={profile.insuranceStatus}
          choices={REVIEW_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<ReviewStatus>(['approved', 'pending', 'rejected'], {
            approved: !profile.documents?.insuranceCard ? 'No insurance card uploaded — nothing to approve yet.' : undefined,
          })}
          onDecide={(next, reason) => save({ insuranceStatus: next, rejectionReason: reason })}
        />
      </PanelSection>

      <PanelSection id="background" title="Background check" action={<StatusBadge value={profile.backgroundStatus} />}>
        <Fields>
          <Field
            label="Consent"
            value={profile.backgroundConsentAt ? `Given ${dateTime(profile.backgroundConsentAt)}` : null}
          />
          <Field label="SSN (last 4)" value={profile.hasSsnLast4 ? 'On file' : 'Not provided (optional)'} />
          {profile.backgroundReviewedAt && <Field label="Last decision" value={dateTime(profile.backgroundReviewedAt)} />}
          {profile.backgroundNotes && <Field label="Notes" value={profile.backgroundNotes} wide />}
        </Fields>
        {consentRecord && (
          <p className="mt-3 text-[11px] text-muted-foreground">Consent record: {consentRecord}</p>
        )}
        <ItemReview<BackgroundStatus>
          item="background check"
          value={profile.backgroundStatus}
          choices={BACKGROUND_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<BackgroundStatus>(['approved', 'in_review', 'rejected'], {
            // A background check can't lawfully be run (or passed) without the
            // driver's written authorisation.
            approved: !profile.backgroundConsentAt ? 'No background-check consent on file — the driver must authorise it in the app first.' : undefined,
          })}
          onDecide={(next, reason) => save({ backgroundStatus: next, rejectionReason: reason })}
        />
      </PanelSection>
    </>
  )
}

/** The rest of the application — address, vehicle, statements — for the side panel. */
function ProfileDetails({ profile }: { profile: AccreditationProfile }) {
  const address = [profile.streetAddress, profile.aptSuite, profile.city, profile.state, profile.postalCode]
    .filter(Boolean)
    .join(', ')

  return (
    <Fields single>
      <Field label="Home address" value={address} />
      <Field label="Vehicle" value={vehicleLine(profile)} />
      <Field label="Plate" value={profile.vehiclePlate} />
      <Field label="VIN" value={profile.vehicleVin} mono />
      {profile.serviceArea && <Field label="Service area" value={profile.serviceArea} />}
      {/* Only asked on the website form — left out when the driver applied in the app. */}
      {profile.hasLicenseAndInsurance !== null && (
        <Field label="Has licence and insurance" value={yesNo(profile.hasLicenseAndInsurance)} />
      )}
      {profile.cleanDrivingRecord !== null && (
        <Field label="Clean driving record" value={yesNo(profile.cleanDrivingRecord)} />
      )}
      {profile.applicationSource && <Field label="Applied via" value={profile.applicationSource} />}
    </Fields>
  )
}

/** When the application was started, submitted and last decided. */
function ProfileActivity({ profile }: { profile: AccreditationProfile }) {
  const { user: me } = useAdmin()

  return (
    <Fields single>
      <Field label="Started" value={dateTime(profile.createdAt)} />
      <Field label="Submitted" value={profile.submittedAt ? dateTime(profile.submittedAt) : 'Not yet'} />
      <Field
        label="Last decision"
        value={
          profile.reviewedAt
            ? `${dateTime(profile.reviewedAt)}${profile.reviewedBy ? ` · ${profile.reviewedBy === me.id ? 'you' : 'another admin'}` : ''}`
            : 'Not yet'
        }
      />
    </Fields>
  )
}

function AccountFields({ account, single = false, compact = false }: {
  account: AdminAccount
  single?: boolean
  /**
   * Leave out what the page header already shows (name, email, phone, role,
   * status, email verified) — for the side panel on customer and driver pages.
   */
  compact?: boolean
}) {
  const metadata = account.metadata && typeof account.metadata === 'object'
    ? Object.entries(account.metadata)
    : []

  return (
    <Fields single={single}>
      {!compact && (
        <>
          <Field label="Name" value={account.displayName} />
          <Field label="Email" value={account.email} />
          <Field label="Phone" value={account.phone} />
          <Field label="Email verified" value={yesNo(account.emailVerified)} />
          <Field label="Role" value={<span className="capitalize">{account.role}</span>} />
          <Field label="Status" value={<span className="capitalize">{account.status}</span>} />
        </>
      )}
      <Field label="Joined" value={dateTime(account.createdAt)} />
      <Field label="Last sign-in" value={account.lastSignIn ? dateTime(account.lastSignIn) : 'Never'} />
      {!compact && <Field label="Last updated" value={dateTime(account.updatedAt)} />}
      {account.deletedAt && <Field label="Deleted" value={dateTime(account.deletedAt)} />}
      {(!compact || account.stripeAccountId) && (
        <Field label="Stripe account" value={account.stripeAccountId} mono />
      )}
      {metadata.map(([key, value]) => (
        <Field
          key={key}
          label={humanise(key)}
          value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          mono={typeof value === 'object'}
        />
      ))}
      <Field label="Account ID" value={account.id} mono wide />
    </Fields>
  )
}

/**
 * Role and Suspend/Reactivate, in the top-right of a person's header card,
 * with any links for that page underneath. Not shown for a deleted account
 * (nothing left to manage) or for your own (the server refuses both changes).
 */
function HeaderActions({ account, onChanged, children }: {
  account: { id: string; role: Role; status: AccountStatus; deletedAt?: string | null }
  onChanged: () => void
  children?: React.ReactNode
}) {
  const { token, user: me } = useAdmin()
  const canManage = !account.deletedAt && account.id !== me.id

  if (!canManage && !children) return null

  // One row: page links first, then role and suspend — all the same height.
  return (
    <div className="flex flex-wrap items-start gap-2 sm:justify-end">
      {children}
      {canManage && <AccountControls user={account} token={token} onChanged={onChanged} />}
    </div>
  )
}

/** A link styled like the header's buttons (same height and outline, in blue). */
const HEADER_LINK =
  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap'
const HEADER_LINK_BORDER = { borderColor: 'hsl(217 100% 50% / 0.5)' }

/** Shown on a deleted account: what's left is anonymised and it can't be changed. */
function DeletedNote({ at }: { at?: string | null }) {
  if (!at) return null
  return (
    <p className="text-xs text-muted-foreground flex items-start gap-1.5 px-1">
      <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-destructive" />
      This account was deleted on {dateTime(at)}. Its name, email and phone were erased; its orders are kept.
    </p>
  )
}

function PersonCard({ title, account, fallbackName, fallbackContact, link, emptyNote }: {
  title: string
  account: AdminAccount | null
  fallbackName: string
  fallbackContact?: string
  link?: React.ReactNode
  emptyNote?: string
}) {
  return (
    <Section title={title} action={account && !account.deletedAt ? link : undefined}>
      <div className="flex items-center gap-3">
        <Avatar url={account?.photoUrl} name={account?.displayName || fallbackName} size={44} zoom />
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {account?.displayName || fallbackName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            {account ? <Contact account={account} /> : fallbackContact || 'No contact details'}
          </p>
          {account && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {account.deletedAt ? <StatusBadge value="deleted" /> : <StatusBadge value={account.status} />}
            </div>
          )}
        </div>
      </div>
      {!account && emptyNote && <p className="text-[11px] text-muted-foreground mt-3">{emptyNote}</p>}
    </Section>
  )
}

// ── /admin/orders/$orderId ──────────────────────────────────────────────────

export function OrderDetailPage() {
  const { orderId } = orderDetailRoute.useParams()
  const { token } = useAdmin()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.order(token, orderId),
    [token, orderId],
  )
  const version = useScreenRefresh(reload)

  const order = data?.order
  const distance = decimal(order?.distanceMiles)
  const items = itemLines(order?.items)

  // The column holds a storage path in a private bucket, so the photo is
  // fetched through a signed link. Very old rows may hold a full URL instead.
  const loadPhoto = async () => {
    try {
      return await deliveryApi.photo(token, orderId)
    } catch (err) {
      const direct = safeHttpUrl(order?.deliveryPhotoUrl)
      if (direct) return { url: direct }
      throw err
    }
  }

  return (
    <>
      <BackLink to="/admin/orders" label="Orders" />

      <DetailState loading={loading} error={error} found={Boolean(order)}>
        {order && (
          <>
            <DetailHeader
              icon={<Package size={18} className="text-primary" />}
              title={<span className="font-mono">Order #{order.ref}</span>}
              subtitle={`Placed ${dateTime(order.createdAt)}`}
              badges={
                <>
                  <StatusBadge value={order.status} />
                  <StatusBadge label="Payment" value={order.paymentStatus} />
                  {order.paymentMode && <StatusBadge label="Mode" value={order.paymentMode} />}
                  <StatusBadge label="Payout" value={order.settled ? 'paid' : 'unpaid'} />
                </>
              }
              aside={
                <>
                  <p className="text-2xl font-bold text-foreground">{money(order.amountCents)}</p>
                  <p className="text-[11px] text-muted-foreground">charged</p>
                </>
              }
            />

            <Section title="Delivery">
              <Fields>
                <Field
                  label="Pickup"
                  wide
                  value={
                    order.pickupAddress || mapsUrl(order.pickupLat, order.pickupLng) ? (
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {order.pickupAddress}
                        <MapLink lat={order.pickupLat} lng={order.pickupLng} />
                      </span>
                    ) : null
                  }
                />
                <Field label="Drop-off" value={order.deliveryAddress} wide />
                <Field
                  label="Contact given on the order"
                  wide
                  value={[order.customerName, order.customerPhone, order.customerEmail].filter(Boolean).join(' · ')}
                />
                <Field label="Distance" value={distance !== null ? distance.toFixed(1) + ' mi' : null} />
                <Field label="Age verified" value={order.ageVerified ? `Yes · ${dateTime(order.ageVerifiedAt)}` : yesNo(order.ageVerified)} />
                <Field
                  label="Items"
                  wide
                  value={
                    items.length ? (
                      <ul className="list-disc pl-4 space-y-0.5">
                        {items.map((line, index) => <li key={index}>{line}</li>)}
                      </ul>
                    ) : null
                  }
                />
              </Fields>
            </Section>

            <Section title="Proof of delivery">
              {order.deliveryPhotoUrl ? (
                <div className="max-w-sm">
                  <SignedImage
                    label="Delivery photo"
                    load={loadPhoto}
                    deps={[token, orderId, order.deliveryPhotoUrl, version]}
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {order.status === 'delivered' ? 'Delivered without a photo.' : 'No photo yet — the driver adds one on delivery.'}
                </p>
              )}
            </Section>

            <div className="grid gap-4 sm:grid-cols-2">
              <PersonCard
                title="Customer"
                account={data.customer}
                fallbackName={order.customerName || 'Guest'}
                fallbackContact={[order.customerEmail, order.customerPhone].filter(Boolean).join(' · ')}
                emptyNote="No account linked to this order."
                link={data.customer && (
                  <TextLink to="/admin/customers/$customerId" params={{ customerId: data.customer.id }}>
                    View customer
                  </TextLink>
                )}
              />

              <PersonCard
                title="Driver"
                account={data.driver}
                fallbackName={order.driverName || 'Unassigned'}
                link={data.driver && (
                  <TextLink to="/admin/drivers/$driverId" params={{ driverId: data.driver.id }}>
                    View driver
                  </TextLink>
                )}
              />
            </div>

            <Section title="Money">
              <StatsRow>
                <Stat label="Charged" value={money(order.amountCents)} />
                <Stat label="Tip" value={money(decimal(order.tipAmount))} />
                <Stat label="Driver payout" value={money(order.earnings?.payoutCents)} />
                <Stat label="Platform keeps" value={money(order.earnings?.platformCents)} />
              </StatsRow>

              <div className="mt-5 pt-4 border-t border-border">
                <Fields>
                  <Field label="Mileage pay" value={money(order.earnings?.mileageCents)} />
                  <Field label="Tip to driver" value={money(order.earnings?.tipCents)} />
                  <Field label="Recorded driver earnings" value={order.driverEarningsCents != null ? money(order.driverEarningsCents) : null} />
                  <Field label="Recorded platform fee" value={order.platformFeeCents != null ? money(order.platformFeeCents) : null} />
                  <Field label="Payout sent" value={order.settled ? 'Yes' : 'Not yet'} />
                  <Field label="Stripe transfer" value={order.driverTransferId} mono />
                  <Field label="Paid to Stripe account" value={order.driverStripeAccountId} mono />
                  <Field label="Payment intent" value={order.stripePaymentIntentId} mono />
                  <Field label="Checkout session" value={order.stripeCheckoutSessionId} mono wide />
                </Fields>
              </div>
            </Section>

            <OrderChat orderId={order.id} version={version} />

            <Section title="Timeline & references">
              <Fields>
                <Field label="Created" value={dateTime(order.createdAt)} />
                <Field label="Last updated" value={dateTime(order.updatedAt)} />
                <Field label="Delivered" value={order.deliveredAt ? dateTime(order.deliveredAt) : null} />
                <Field label="Customer notified" value={order.deliveryNotifiedAt ? dateTime(order.deliveryNotifiedAt) : null} />
                <Field label="City" value={order.cityId} />
                <Field label="Store" value={order.storeId} />
                <Field label="Order type" value={order.orderScope} />
                <Field label="Customer session" value={order.customerSessionId} mono />
                <Field label="Order ID" value={order.id} mono wide />
              </Fields>
            </Section>
          </>
        )}
      </DetailState>
    </>
  )
}

// ── /admin/customers/$customerId ────────────────────────────────────────────

export function CustomerDetailPage() {
  const { customerId } = customerDetailRoute.useParams()
  const { token } = useAdmin()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.customer(token, customerId),
    [token, customerId],
  )
  const version = useScreenRefresh(reload)

  const customer = data?.customer
  const name = customer?.displayName || customer?.email || 'Unnamed customer'

  return (
    <>
      <BackLink to="/admin/customers" label="Customers" />

      <DetailState loading={loading} error={error} found={Boolean(customer)}>
        {customer && (
          <>
            <DetailHeader
              bare
              media={<Avatar url={customer.photoUrl} name={name} size={56} zoom />}
              title={name}
              subtitle={<Contact account={customer} />}
              badges={
                <>
                  {customer.deletedAt ? <StatusBadge value="deleted" /> : <StatusBadge value={customer.status} />}
                  <StatusBadge label="Email" value={customer.emailVerified ? 'verified' : 'unverified'} />
                </>
              }
              aside={<HeaderActions account={customer} onChanged={reload} />}
            />

            <DeletedNote at={customer.deletedAt} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <Panel>
                <PanelSection title="Summary">
                  <StatsRow>
                    <Stat label="Total orders" value={data.stats.orders.total} />
                    <Stat label="Delivered" value={data.stats.orders.delivered} />
                    <Stat label="Active" value={data.stats.orders.active} />
                    <Stat label="Cancelled" value={data.stats.orders.cancelled} />
                    <Stat label="Total spent" value={money(data.stats.totalSpentCents)} />
                    <Stat label="Tips given" value={money(data.stats.totalTipsCents)} />
                    <Stat label="First order" value={day(data.stats.firstOrderAt)} />
                    <Stat label="Last order" value={day(data.stats.lastOrderAt)} />
                  </StatsRow>
                </PanelSection>

                <OrderHistory
                  inPanel
                  title="All orders"
                  filter={{ customerId: customer.id }}
                  version={version}
                  empty="No orders yet."
                />
              </Panel>

              <Panel>
                <PanelSection title="Account">
                  <AccountFields account={customer} single compact />
                </PanelSection>
              </Panel>
            </div>
          </>
        )}
      </DetailState>
    </>
  )
}

// ── /admin/drivers/$driverId ────────────────────────────────────────────────

export function DriverDetailPage() {
  const { driverId } = driverDetailRoute.useParams()
  const { token } = useAdmin()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.driver(token, driverId),
    [token, driverId],
  )
  const version = useScreenRefresh(reload)

  const driver = data?.driver
  const profile = data?.accreditation
  const presence = data?.presence
  const name = profile?.legalName || driver?.displayName || driver?.email || 'Unnamed driver'

  // Approve / Reject sit under the header while there's a decision to make.
  const needsDecision = Boolean(profile) && profile?.accreditationStatus !== 'approved'

  return (
    <>
      <BackLink to="/admin/drivers" label="Drivers" />

      <DetailState loading={loading} error={error} found={Boolean(driver)}>
        {driver && (
          <>
            <DetailHeader
              bare
              media={<Avatar url={driver.photoUrl} name={name} size={56} zoom />}
              title={name}
              subtitle={<Contact account={driver} />}
              badges={
                <>
                  {driver.deletedAt ? <StatusBadge value="deleted" /> : <StatusBadge value={driver.status} />}
                  <EligibilityBadge eligibility={data.eligibility} />
                  <StatusBadge value={driver.isAvailable ? 'on_duty' : 'off_duty'} />
                </>
              }
              aside={
                <HeaderActions account={driver} onChanged={reload}>
                  {profile && (
                    <Link
                      to="/admin/applications/$userId"
                      params={{ userId: driver.id }}
                      className={HEADER_LINK}
                      style={HEADER_LINK_BORDER}
                    >
                      <ClipboardList size={13} />
                      Review application
                    </Link>
                  )}
                </HeaderActions>
              }
              footer={
                needsDecision && profile ? (
                  <DecisionBar profile={profile} missing={data.missing ?? []} onReviewed={reload} />
                ) : undefined
              }
            />

            <DeletedNote at={driver.deletedAt} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <div className="space-y-4 min-w-0">
                <Panel>
                  <PanelSection title="Work">
                    <StatsRow>
                      <Stat label="Deliveries" value={data.stats.orders.total} />
                      <Stat label="Completed" value={data.stats.orders.delivered} />
                      <Stat label="Active" value={data.stats.orders.active} />
                      <Stat label="Cancelled" value={data.stats.orders.cancelled} />
                      <Stat label="Paid out" value={money(data.stats.paidOutCents ?? data.stats.totalEarnedCents)} />
                      <Stat
                        label={`Owed · ${data.payouts.unsettledDeliveries} deliver${data.payouts.unsettledDeliveries === 1 ? 'y' : 'ies'}`}
                        value={data.stats.owedCents !== undefined ? money(data.stats.owedCents) : data.payouts.unsettledDeliveries}
                      />
                      <Stat label="Last delivery" value={day(data.stats.lastDeliveryAt)} />
                    </StatsRow>
                  </PanelSection>

                  {profile ? (
                    <ProfileSections profile={profile} version={version} onReviewed={reload} />
                  ) : (
                    <PanelSection title="Application">
                      <p className="text-sm text-muted-foreground">This driver hasn't started the driver application.</p>
                    </PanelSection>
                  )}
                </Panel>

                <OrderHistory
                  title="All deliveries"
                  filter={{ driverUserId: driver.id }}
                  version={version}
                  empty="No deliveries yet."
                />
              </div>

              <Panel>
                <PanelSection title="Live status">
                  {presence ? (
                    <Fields single>
                      <Field
                        label="On duty"
                        value={<OnOff on={presence.available} text={presence.available ? 'Yes' : 'No'} />}
                      />
                      <Field
                        label="Getting new orders"
                        value={
                          <OnOff
                            on={presence.reachable}
                            warn={!presence.reachable && presence.available}
                            text={presence.reachable ? 'Yes' : presence.available ? "No — location hasn't updated recently" : 'No'}
                          />
                        }
                      />
                      <Field label="Last seen in the app" value={presence.lastSeenAt ? timeAgo(presence.lastSeenAt) : null} />
                      <Field
                        label="Last location"
                        value={
                          presence.lat !== null && presence.lng !== null ? (
                            <span className="flex flex-col gap-1">
                              <span className="font-mono text-xs">{presence.lat.toFixed(5)}, {presence.lng.toFixed(5)}</span>
                              <span className="text-xs">
                                <MapLink lat={presence.lat} lng={presence.lng} />
                                {presence.locationAt ? <span className="text-muted-foreground"> · {timeAgo(presence.locationAt)}</span> : null}
                              </span>
                            </span>
                          ) : null
                        }
                      />
                      {presence.currentOrderId && (
                        <Field
                          label="Looking at order"
                          value={
                            <Link
                              to="/admin/orders/$orderId"
                              params={{ orderId: presence.currentOrderId }}
                              className="font-mono text-xs text-primary hover:underline"
                            >
                              {presence.currentOrderId}
                            </Link>
                          }
                        />
                      )}
                    </Fields>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Live status needs the updated backend (GET /admin/drivers/:id with presence).
                    </p>
                  )}
                </PanelSection>

                {profile && (
                  <PanelSection title="Details">
                    <ProfileDetails profile={profile} />
                  </PanelSection>
                )}

                <PanelSection title="Payouts">
                  <Fields single>
                    <Field label="Can be paid" value={yesNo(data.payouts.canBePaid)} />
                    <Field label="Stripe mode" value={data.payouts.stripeAccountMode} />
                    <Field label="Stripe account" value={data.payouts.stripeAccountId} mono />
                  </Fields>
                </PanelSection>

                <PanelSection title="Account">
                  <AccountFields account={driver} single compact />
                </PanelSection>
              </Panel>
            </div>
          </>
        )}
      </DetailState>
    </>
  )
}

// ── /admin/applications/$userId ─────────────────────────────────────────────

export function ApplicationDetailPage() {
  const { userId } = applicationDetailRoute.useParams()
  const { token } = useAdmin()

  const { data, loading, error, reload } = useAdminData(
    () => accreditationsApi.get(token, userId),
    [token, userId],
  )
  const version = useScreenRefresh(reload)

  return (
    <>
      <BackLink to="/admin/applications" label="Applications" />

      <DetailState loading={loading} error={error} found={Boolean(data)}>
        {data && (
          <>
            <DetailHeader
              bare
              icon={<ClipboardList size={18} className="text-primary" />}
              title={data.legalName || data.user?.displayName || data.user?.email || 'Unnamed applicant'}
              subtitle={data.user ? <Contact account={data.user} /> : undefined}
              badges={
                <>
                  <StatusBadge value={data.accreditationStatus} />
                  {/* Whether they can drive — only when it says something different. */}
                  {data.eligibility?.code !== data.accreditationStatus && (
                    <EligibilityBadge eligibility={data.eligibility} />
                  )}
                </>
              }
              aside={
                <Link
                  to="/admin/drivers/$driverId"
                  params={{ driverId: data.userId }}
                  className={HEADER_LINK}
                  style={HEADER_LINK_BORDER}
                >
                  <UserRound size={13} />
                  Driver profile
                </Link>
              }
              footer={<DecisionBar profile={data} missing={data.missing} onReviewed={reload} />}
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <Panel>
                <ProfileSections profile={data} version={version} onReviewed={reload} />
              </Panel>

              <Panel>
                <PanelSection title="Details">
                  <ProfileDetails profile={data} />
                </PanelSection>
                <PanelSection title="Activity">
                  <ProfileActivity profile={data} />
                </PanelSection>
              </Panel>
            </div>
          </>
        )}
      </DetailState>
    </>
  )
}

// ── /admin/accounts/$userId ─────────────────────────────────────────────────

export function AccountDetailPage() {
  const { userId } = accountDetailRoute.useParams()
  const { token, user: me } = useAdmin()
  const navigate = useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => usersApi.get(token, userId),
    [token, userId],
  )
  useScreenRefresh(reload)

  const account = data?.user
  const name = account?.displayName || account?.email || 'Unnamed account'

  // Customers and drivers have a full profile page with everything on this one
  // and more, so an account link for them goes straight there. Only admins,
  // who have neither, stay on this page.
  const profileRole = account?.role === 'customer' || account?.role === 'driver' ? account.role : null

  useEffect(() => {
    if (!account || !profileRole) return

    if (profileRole === 'customer') {
      navigate({ to: '/admin/customers/$customerId', params: { customerId: account.id }, replace: true })
    } else {
      navigate({ to: '/admin/drivers/$driverId', params: { driverId: account.id }, replace: true })
    }
  }, [account, profileRole, navigate])

  if (profileRole) return <Spinner />

  return (
    <>
      <BackLink to="/admin/accounts" label="Accounts" />

      <DetailState loading={loading} error={error} found={Boolean(account)}>
        {account && (
          <>
            <DetailHeader
              media={<Avatar url={account.photoUrl} name={name} size={56} zoom />}
              title={name}
              subtitle={<Contact account={account} />}
              badges={
                <>
                  <StatusBadge value={account.status} />
                  <StatusBadge label="Role" value={account.role} />
                  {account.id === me.id && <StatusBadge value="you" />}
                </>
              }
              aside={<HeaderActions account={account} onChanged={reload} />}
            />

            <Section title="Details">
              <AccountFields account={account} />
            </Section>
          </>
        )}
      </DetailState>
    </>
  )
}
