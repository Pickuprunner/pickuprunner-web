import { useCallback, useMemo, useRef, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  Banknote,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Package,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
} from 'lucide-react'

import {
  adminApi,
  accreditationsApi,
  driverReviewApi,
  usersApi,
  type Accreditation,
  type AccountStatus,
  type AdminOrder,
  type AdminUser,
  type Role,
} from '../lib/api'

import {
  Avatar,
  Card,
  EligibilityBadge,
  EligibilityNote,
  CardLink,
  CARD_BACKGROUND,
  day,
  decimal,
  Detail,
  ErrorLine,
  FilterRow,
  IconBubble,
  itemLines,
  money,
  PanelState,
  SearchBox,
  Spinner,
  Stat,
  StatusBadge,
  Total,
  useAdmin,
  useAdminData,
  useRegisterReload,
  ViewHint,
} from './AdminUi'
import { approveBlockers, QuickCheck } from './AdminQuickCheck'

// Filters live in the URL (?status=…&q=…) so that opening a record and coming
// back lands on the same filtered list. App.tsx validates these search params.

export const ORDER_STATUSES = [
  'all', 'pending', 'assigned', 'accepted', 'shopping', 'picked_up', 'en_route', 'delivered', 'cancelled',
] as const
export type OrderFilter = (typeof ORDER_STATUSES)[number]

export const APPLICATION_STATUSES = [
  'all', 'in_progress', 'under_review', 'approved', 'rejected',
] as const
export type ApplicationFilter = (typeof APPLICATION_STATUSES)[number]

export const ACCOUNT_ROLES = ['all', 'customer', 'driver', 'admin'] as const
export type AccountFilter = (typeof ACCOUNT_ROLES)[number]

const ordersRoute = getRouteApi('/admin/orders')
const customersRoute = getRouteApi('/admin/customers')
const driversRoute = getRouteApi('/admin/drivers')
const applicationsRoute = getRouteApi('/admin/applications')
const accountsRoute = getRouteApi('/admin/accounts')

// ── Orders ──────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: AdminOrder }) {
  const distance = decimal(order.distanceMiles)
  const tip = decimal(order.tipAmount)
  const items = itemLines(order.items)

  const customer = order.customer?.displayName || order.customerName || order.customer?.email || 'Unknown customer'
  const contact = order.customer?.email || order.customerEmail
  const phone = order.customer?.phone || order.customerPhone

  return (
    <CardLink to="/admin/orders/$orderId" params={{ orderId: order.id }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <IconBubble><Package size={18} className="text-primary" /></IconBubble>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground font-mono text-sm">#{order.ref}</p>
            <StatusBadge value={order.status} />
            <StatusBadge label="Payment" value={order.paymentStatus} />
            {order.settled && <StatusBadge label="Payout" value="approved" />}
          </div>

          <p className="text-xs text-muted-foreground mt-1 truncate">
            {customer}
            {contact ? ' · ' + contact : ''}
            {phone ? ' · ' + phone : ''}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground">{money(order.amountCents)}</p>
          <p className="text-[11px] text-muted-foreground">{day(order.createdAt)}</p>
        </div>

        <ViewHint />
      </div>

      <div className="mt-4 space-y-1.5">
        <Detail icon={<MapPin size={12} />}>
          <span className="text-muted-foreground/70">From</span> {order.pickupAddress || '—'}
        </Detail>
        <Detail icon={<MapPin size={12} />}>
          <span className="text-muted-foreground/70">To</span> {order.deliveryAddress || '—'}
        </Detail>
        <Detail icon={<Car size={12} />}>
          {order.driver?.displayName || order.driverName || 'Unassigned'}
          {order.driver?.email ? ' · ' + order.driver.email : ''}
        </Detail>
      </div>

      {items.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          <span className="text-muted-foreground/70">Items: </span>{items.join(', ')}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Distance" value={distance !== null ? distance.toFixed(1) + ' mi' : '—'} />
        {/* tip_amount is stored in cents. */}
        <Stat label="Tip" value={tip !== null ? money(tip) : '—'} />
        <Stat label="Driver payout" value={money(order.earnings?.payoutCents)} />
        <Stat label="Delivered" value={day(order.deliveredAt)} />
      </div>
    </CardLink>
  )
}

export function OrdersPanel() {
  const { token } = useAdmin()
  const { status = 'all', q = '' } = ordersRoute.useSearch()
  const navigate = ordersRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.orders(token, {
      status: status === 'all' ? undefined : status,
      search: q || undefined,
      limit: 50,
    }),
    [token, status, q],
  )

  useRegisterReload(reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBox
          value={q}
          onCommit={(next) => navigate({ search: (prev) => ({ ...prev, q: next || undefined }), replace: true })}
          placeholder="Search ref, name, phone, address"
        />
      </div>

      <div className="mb-6">
        <FilterRow<OrderFilter>
          options={ORDER_STATUSES}
          value={status}
          onChange={(next) => navigate({ search: (prev) => ({ ...prev, status: next === 'all' ? undefined : next }) })}
        />
      </div>

      <PanelState
        loading={loading && !data}
        error={error}
        empty={!data?.orders.length}
        emptyLabel="No orders"
        emptyHint="Orders placed in the app appear here."
      >
        <Total shown={data?.orders.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      </PanelState>
    </>
  )
}

// ── Customers ───────────────────────────────────────────────────────────────

export function CustomersPanel() {
  const { token } = useAdmin()
  const { q = '' } = customersRoute.useSearch()
  const navigate = customersRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.customers(token, { search: q || undefined, limit: 50 }),
    [token, q],
  )

  useRegisterReload(reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBox
          value={q}
          onCommit={(next) => navigate({ search: { q: next || undefined }, replace: true })}
          placeholder="Search name, email, phone"
        />
      </div>

      <PanelState
        loading={loading && !data}
        error={error}
        empty={!data?.customers.length}
        emptyLabel="No customers"
      >
        <Total shown={data?.customers.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.customers.map((customer) => (
            <CardLink key={customer.id} to="/admin/customers/$customerId" params={{ customerId: customer.id }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Avatar url={customer.photoUrl} name={customer.displayName || customer.email} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {customer.displayName || customer.email}
                    </p>
                    <StatusBadge value={customer.status} />
                    {customer.emailVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CheckCircle2 size={11} style={{ color: '#22C55E' }} />verified
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {customer.email}
                    {customer.phone ? ' · ' + customer.phone : ''}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    <Detail>Joined {day(customer.createdAt)}</Detail>
                    <Detail>Last seen {day(customer.lastSignIn)}</Detail>
                  </div>
                </div>

                <ViewHint />
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Stat label="Orders" value={customer.orders?.total ?? 0} />
                <Stat label="Delivered" value={customer.orders?.delivered ?? 0} />
                <Stat label="Active" value={customer.orders?.active ?? 0} />
                <Stat label="Last order" value={day(customer.orders?.lastOrderAt)} />
                <Stat label="Total spent" value={money(customer.totalSpentCents)} />
              </div>
            </CardLink>
          ))}
        </div>
      </PanelState>
    </>
  )
}

// ── Drivers ─────────────────────────────────────────────────────────────────

export function DriversPanel() {
  const { token } = useAdmin()
  const { q = '' } = driversRoute.useSearch()
  const navigate = driversRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.drivers(token, { search: q || undefined, limit: 50 }),
    [token, q],
  )

  useRegisterReload(reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBox
          value={q}
          onCommit={(next) => navigate({ search: { q: next || undefined }, replace: true })}
          placeholder="Search name, email, phone"
        />
      </div>

      <PanelState
        loading={loading && !data}
        error={error}
        empty={!data?.drivers.length}
        emptyLabel="No drivers"
        emptyHint="Approved applicants appear here as drivers."
      >
        <Total shown={data?.drivers.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.drivers.map((driver) => (
            <CardLink key={driver.id} to="/admin/drivers/$driverId" params={{ driverId: driver.id }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Avatar url={driver.photoUrl} name={driver.displayName || driver.email} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {driver.displayName || driver.email}
                    </p>
                    <StatusBadge value={driver.status} />
                    {driver.isAvailable !== undefined && (
                      <StatusBadge value={driver.isAvailable ? 'on_duty' : 'off_duty'} />
                    )}
                    <EligibilityBadge eligibility={driver.eligibility} />
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {driver.email}
                    {driver.phone ? ' · ' + driver.phone : ''}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {driver.vehicle && (
                      <Detail icon={<Car size={12} />}>
                        {[driver.vehicle.make, driver.vehicle.model].filter(Boolean).join(' ')}
                        {driver.vehicle.plate ? ' · ' + driver.vehicle.plate : ''}
                      </Detail>
                    )}
                    {driver.location && (
                      <Detail icon={<MapPin size={12} />}>
                        {[driver.location.city, driver.location.state].filter(Boolean).join(', ')}
                      </Detail>
                    )}
                    <Detail icon={<Banknote size={12} />}>
                      {driver.payouts?.canBePaid ? 'Payouts connected' : 'No payout account'}
                      {driver.payouts?.stripeAccountMode ? ` (${driver.payouts.stripeAccountMode})` : ''}
                    </Detail>
                    <Detail>Joined {day(driver.createdAt)}</Detail>
                  </div>
                </div>

                <ViewHint />
              </div>

              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                <StatusBadge label="Accreditation" value={driver.accreditation?.status} />
                <StatusBadge label="Licence" value={driver.accreditation?.license} />
                <StatusBadge label="Insurance" value={driver.accreditation?.insurance} />
                <StatusBadge label="Background" value={driver.accreditation?.background} />
              </div>

              <div className="mt-3"><EligibilityNote eligibility={driver.eligibility} /></div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Stat label="Deliveries" value={driver.orders?.total ?? 0} />
                <Stat label="Completed" value={driver.orders?.delivered ?? 0} />
                <Stat label="Active" value={driver.orders?.active ?? 0} />
                <Stat label="Unsettled" value={driver.orders?.unsettled ?? 0} />
                <Stat label="Paid out" value={money(driver.totalEarnedCents)} />
              </div>
            </CardLink>
          ))}
        </div>
      </PanelState>
    </>
  )
}

// ── Applications ────────────────────────────────────────────────────────────

/** Approve / reject a whole driver profile. Used on the list and on the detail screen. */
export function ReviewActions({ application, token, onReviewed, name, onApprove, extra, showNote = true }: {
  application: Pick<Accreditation, 'userId' | 'accreditationStatus' | 'submittedAt'> & { missing?: string[] | null }
  token: string
  onReviewed: () => void
  /** Who this is, for the confirmation toast. */
  name?: string | null
  /** Replaces the instant approve — the list opens the quick check instead. */
  onApprove?: () => void
  /** Shown at the end of the button row (the list's "View full application"). */
  extra?: React.ReactNode
  /** The "still missing / not submitted" line — off where the page says it already. */
  showNote?: boolean
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  const status = application.accreditationStatus
  const submitted = Boolean(application.submittedAt)
  // Approve needs everything to be filled in (details, photos, consent) — or,
  // once the driver has submitted, at least every photo (both sides of the
  // licence and the insurance card). The server checks the same thing. The
  // SSN digits are optional, so they never block it.
  const blockers = approveBlockers(application)
  const canApprove = blockers.length === 0
  const approveBlocked = canApprove ? '' : `Still missing: ${blockers.join(', ')}`

  const run = async (action: 'approve' | 'reject') => {
    setBusy(action)
    setError('')

    try {
      if (action === 'approve') {
        await driverReviewApi.approve(token, application.userId)
        toast.success(`${name || 'Driver'} approved — they can take orders now`)
      } else {
        await driverReviewApi.reject(token, application.userId, reason.trim())
        toast.success(`${name ? name + "'s" : 'The'} application was rejected — they'll see your reason`)
      }
      setRejecting(false)
      setReason('')
      onReviewed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {rejecting ? (
        <div className="space-y-3">
          <label
            htmlFor={`reason-${application.userId}`}
            className="block text-xs font-semibold text-muted-foreground"
          >
            Why is this being rejected? The applicant sees this.
          </label>

          <textarea
            id={`reason-${application.userId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            autoFocus
            placeholder="e.g. The insurance card has expired — upload a current one and submit again."
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run('reject')}
              disabled={!reason.trim() || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#EF4444', color: '#fff' }}
            >
              {busy === 'reject'
                ? <Loader2 size={13} className="animate-spin" />
                : <X size={13} />}
              Confirm rejection
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
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {status === 'approved' ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ background: 'hsl(142 71% 45% / 0.12)', border: '1px solid hsl(142 71% 45% / 0.4)', color: '#22C55E' }}
              >
                <CheckCircle2 size={13} />
                Approved
              </span>
            ) : (
            <button
              type="button"
              onClick={() => (onApprove ? onApprove() : run('approve'))}
              disabled={busy !== null || !canApprove}
              title={approveBlocked || undefined}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#22C55E', color: '#04120A' }}
            >
              {busy === 'approve'
                ? <Loader2 size={13} className="animate-spin" />
                : <Check size={13} />}
              Approve driver
            </button>
            )}

            {status === 'rejected' ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.4)', color: '#EF4444' }}
              >
                <X size={13} />
                Rejected
              </span>
            ) : (
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={busy !== null}
              title={status === 'approved' ? 'Take back the approval — they stop being able to take orders' : undefined}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'hsl(0 84% 60% / 0.5)', color: '#EF4444' }}
            >
              <X size={13} />
              Reject
            </button>
            )}

            {extra}
          </div>

          {showNote && status !== 'approved' && (!submitted || !canApprove) && (
            <p className="mt-2.5 text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              {!canApprove
                ? `${submitted ? 'Still missing' : 'Not submitted yet — still missing'}: ${blockers.join(', ')}. You can approve once that's in, or reject now.`
                : 'Not submitted yet, but everything is filled in — you can approve now.'}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </div>
  )
}

function ApplicationCard({ application, token, onReviewed, onQuickCheck }: {
  application: Accreditation
  token: string
  onReviewed: () => void
  /** Approve driver opens the quick check for this application. */
  onQuickCheck: () => void
}) {
  const { user } = application

  const name = application.legalName || user?.displayName || user?.email || 'Unnamed applicant'
  const vehicle = [application.vehicleYear, application.vehicleMake, application.vehicleModel]
    .filter(Boolean)
    .join(' ')
  const area = application.serviceArea || [application.city, application.state].filter(Boolean).join(', ')
  const applied = application.submittedAt || application.createdAt

  const documents = [
    { label: 'Licence front', held: application.documents?.licenseFront },
    { label: 'Licence back', held: application.documents?.licenseBack },
    { label: 'Insurance card', held: application.documents?.insuranceCard },
  ]

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <IconBubble><ClipboardList size={18} className="text-primary" /></IconBubble>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <Link
              to="/admin/applications/$userId"
              params={{ userId: application.userId }}
              className="font-semibold text-foreground truncate block hover:text-primary hover:underline"
            >
              {name}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
              {user?.phone ? ' · ' + user.phone : ''}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {area && <Detail icon={<MapPin size={12} />}>{area}</Detail>}
            {vehicle && (
              <Detail icon={<Car size={12} />}>
                {vehicle}{application.vehiclePlate ? ' · ' + application.vehiclePlate : ''}
              </Detail>
            )}
            {applied && (
              <Detail>
                {application.submittedAt ? 'Submitted ' : 'Applied '}{day(applied)}
              </Detail>
            )}
            {application.applicationSource && (
              <Detail>via {application.applicationSource}</Detail>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <StatusBadge value={application.accreditationStatus} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
        <StatusBadge label="Licence" value={application.licenseStatus} />
        <StatusBadge label="Insurance" value={application.insuranceStatus} />
        <StatusBadge label="Background" value={application.backgroundStatus} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {documents.map(({ label, held }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[11px]"
            style={{ color: held ? '#22C55E' : 'hsl(var(--muted-foreground))' }}
          >
            <FileText size={11} />
            {label}{held ? ' ✓' : ' —'}
          </span>
        ))}
      </div>

      {application.rejectionReason && (
        <p className="mt-3 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {application.rejectionReason}
        </p>
      )}

      {application.missing?.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground transition-colors">
            {application.missing.length} item{application.missing.length === 1 ? '' : 's'} outstanding
            <ChevronDown size={12} className="inline ml-1 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-xs text-muted-foreground capitalize leading-relaxed">
            {application.missing.join(' · ')}
          </p>
        </details>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <ReviewActions
          application={application}
          token={token}
          onReviewed={onReviewed}
          name={name}
          onApprove={onQuickCheck}
          extra={
            <Link
              to="/admin/applications/$userId"
              params={{ userId: application.userId }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              style={{ borderColor: 'hsl(217 100% 50% / 0.5)' }}
            >
              <Eye size={13} />
              View full application
            </Link>
          }
        />
      </div>
    </Card>
  )
}

export function ApplicationsPanel() {
  const { token } = useAdmin()
  const { status = 'all' } = applicationsRoute.useSearch()
  const navigate = applicationsRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => accreditationsApi.list(token, {
      status: status === 'all' ? undefined : status,
      limit: 50,
    }),
    [token, status],
  )

  useRegisterReload(reload)

  // The quick check (opened by Approve driver), and the driver it's showing.
  const [checking, setChecking] = useState<string | null>(null)
  const applications = data?.accreditations ?? []
  // Decided in this visit — skipped by "next" even before the list reloads.
  const decided = useRef(new Set<string>())
  // "Approve & next" moves down the list to the next driver who's still
  // waiting and can be approved — wrapping round to the top at the end.
  const nextAfter = (userId: string) => {
    const index = applications.findIndex((application) => application.userId === userId)
    return [...applications.slice(index + 1), ...applications.slice(0, Math.max(index, 0))]
      .find((application) =>
        !decided.current.has(application.userId) &&
        application.accreditationStatus !== 'approved' &&
        application.accreditationStatus !== 'rejected' &&
        approveBlockers(application).length === 0,
      )?.userId ?? null
  }
  const closeCheck = useCallback(() => setChecking(null), [])

  return (
    <>
      <div className="mb-6">
        <FilterRow<ApplicationFilter>
          options={APPLICATION_STATUSES}
          value={status}
          onChange={(next) => navigate({ search: { status: next === 'all' ? undefined : next } })}
        />
      </div>

      <PanelState
        loading={loading && !data}
        error={error}
        empty={!data?.accreditations.length}
        emptyLabel="No driver applications"
        emptyHint="Applications submitted from the Drive With Us page land here."
      >
        <Total shown={data?.accreditations.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.accreditations.map((application) => (
            <ApplicationCard
              key={application.userId}
              application={application}
              token={token}
              onReviewed={reload}
              onQuickCheck={() => setChecking(application.userId)}
            />
          ))}
        </div>
      </PanelState>

      {checking && (
        <QuickCheck
          key={checking}
          userId={checking}
          token={token}
          hasNext={nextAfter(checking) !== null}
          onClose={closeCheck}
          onDone={(next) => {
            decided.current.add(checking)
            const following = next ? nextAfter(checking) : null
            reload()
            setChecking(following)
          }}
        />
      )}
    </>
  )
}

// ── Accounts ────────────────────────────────────────────────────────────────

function RoleDropdown({ value, disabled, onChange }: {
  value: Role
  disabled: boolean
  onChange: (role: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const roles: Role[] = ['customer', 'driver', 'admin']

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex min-w-28 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium capitalize text-foreground disabled:opacity-60"
      >
        {value}
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 w-28 overflow-hidden rounded-lg border border-border shadow-xl"
          style={{ background: 'hsl(237 40% 10%)' }}
        >
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={role === value}
              onClick={() => {
                setOpen(false)
                if (role !== value) onChange(role)
              }}
              className="w-full px-3 py-2 text-left text-xs capitalize text-muted-foreground hover:bg-primary/15 hover:text-foreground"
              style={{ background: role === value ? 'hsl(217 100% 50% / 0.15)' : undefined }}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Role and suspend/reactivate controls for one account. */
export function AccountControls({ user, token, onChanged }: {
  user: { id: string; role: Role; status: AccountStatus }
  token: string
  onChanged: () => void | Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = async (action: 'role' | 'status', value: Role | AccountStatus) => {
    setSaving(true)
    setError('')

    try {
      if (action === 'role') {
        await usersApi.updateRole(token, user.id, value as Role)
        toast.success(`Role changed to ${value}`)
      } else {
        await usersApi.updateStatus(token, user.id, value as AccountStatus)
        toast.success(value === 'suspended' ? 'Account suspended — signed out everywhere' : 'Account reactivated')
      }
      await onChanged()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const active = user.status === 'active'

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center">
        <RoleDropdown value={user.role} disabled={saving} onChange={(role) => update('role', role)} />

        <button
          type="button"
          onClick={() => update('status', active ? 'suspended' : 'active')}
          disabled={saving}
          title={active ? 'Blocks the account and signs it out everywhere straight away' : 'Lets the account sign in again'}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
          style={{
            borderColor: active ? 'hsl(0 84% 60% / 0.5)' : 'hsl(142 71% 45% / 0.5)',
            color: active ? '#EF4444' : '#22C55E',
          }}
        >
          {active ? <UserRoundX size={14} /> : <UserRoundCheck size={14} />}
          {active ? 'Suspend' : 'Reactivate'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * The full profile for an account: the customer page for a customer (orders,
 * spend), the driver page for a driver (application, documents, deliveries).
 * Admins have neither, so they get the account page.
 */
export function ProfileLink({ user, className, children }: {
  user: { id: string; role: Role }
  className?: string
  children: React.ReactNode
}) {
  if (user.role === 'customer') {
    return (
      <Link to="/admin/customers/$customerId" params={{ customerId: user.id }} className={className}>
        {children}
      </Link>
    )
  }
  if (user.role === 'driver') {
    return (
      <Link to="/admin/drivers/$driverId" params={{ driverId: user.id }} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <Link to="/admin/accounts/$userId" params={{ userId: user.id }} className={className}>
      {children}
    </Link>
  )
}

/**
 * One account. The whole card opens the full profile: the name link is
 * stretched over the card with an ::after overlay, and the controls sit above
 * that overlay (z-10) so they still work — buttons can't legally live inside a
 * link, so this is the way to make the entire box clickable.
 */
function AccountRow({ user, token, reload }: { user: AdminUser; token: string; reload: () => void }) {
  return (
    <article
      className="group relative rounded-2xl border border-border p-4 sm:p-5 transition-colors hover:border-primary/50 focus-within:border-primary/50"
      style={{ background: CARD_BACKGROUND }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar url={user.photoUrl} name={user.displayName || user.email} />

        <div className="flex-1 min-w-0">
          <ProfileLink
            user={user}
            className="font-semibold text-foreground truncate block group-hover:text-primary focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary/60"
          >
            {user.displayName || user.email}
          </ProfileLink>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
            {user.phone ? ' · ' + user.phone : ''}
          </p>
        </div>

        {/* Above the card-wide link; raised further while its menu is open so
            the menu isn't painted under the next card. */}
        <div className="relative z-10 focus-within:z-20">
          <AccountControls user={user} token={token} onChanged={reload} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span
          className="rounded-full px-2 py-0.5"
          style={{ color: user.status === 'active' ? '#22C55E' : '#EF4444' }}
        >
          {user.status}
        </span>
        <span>Joined {day(user.createdAt)}</span>
        <span className="flex-1" />
        <span className="font-semibold text-primary group-hover:underline">
          {user.role === 'admin' ? 'View account →' : `View full ${user.role} profile →`}
        </span>
      </div>
    </article>
  )
}

export function AccountsPanel() {
  const { token } = useAdmin()
  const { role = 'all' } = accountsRoute.useSearch()
  const navigate = accountsRoute.useNavigate()

  // One request for everything: the tiles need counts for every role, so the
  // role filter is applied here rather than on the server.
  const { data, loading, error, reload } = useAdminData(() => usersApi.list(token), [token])
  useRegisterReload(reload)

  const all = useMemo(() => data?.users ?? [], [data])
  const shown = role === 'all' ? all : all.filter((user) => user.role === role)
  const count = useCallback(
    (key: AccountFilter) => (key === 'all' ? all.length : all.filter((user) => user.role === key).length),
    [all],
  )

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {ACCOUNT_ROLES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate({ search: { role: key === 'all' ? undefined : key } })}
            className="rounded-xl border p-4 text-left transition-colors"
            style={{
              background: role === key ? 'hsl(217 100% 50% / 0.1)' : CARD_BACKGROUND,
              borderColor: role === key ? 'hsl(217 100% 50% / 0.4)' : 'hsl(var(--border))',
            }}
          >
            <p className="text-2xl font-bold text-foreground">{count(key)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {key === 'all' ? 'All users' : key + 's'}
            </p>
          </button>
        ))}
      </div>

      <ErrorLine message={error} />

      {loading && !data ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border border-border"
          style={{ background: CARD_BACKGROUND }}
        >
          <Users size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-foreground font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((user) => (
            <AccountRow key={user.id} user={user} token={token} reload={reload} />
          ))}
        </div>
      )}
    </>
  )
}
