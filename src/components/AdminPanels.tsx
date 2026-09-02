import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  Package,
  Search,
  User,
  X,
} from 'lucide-react'

import {
  adminApi,
  accreditationsApi,
  driverReviewApi,
  type Accreditation,
  type AdminCustomer,
  type AdminDriver,
  type AdminOrder,
} from '../lib/api'

const money = (cents?: number | null) =>
  typeof cents === 'number' ? '$' + (cents / 100).toFixed(2) : '—'

const decimal = (value?: number | string | null) => {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

const day = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : '—'

const humanise = (value: string) => value.replace(/_/g, ' ')

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
}

export function StatusBadge({ label, value }: { label?: string; value?: string | null }) {
  if (!value) return null

  const color = STATUS_COLORS[value] || '#8891A8'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap"
      style={{ background: `${color}1A`, border: `1px solid ${color}59`, color }}
    >
      {label && <span className="opacity-70 font-medium">{label}</span>}
      {humanise(value)}
    </span>
  )
}

function Detail({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
      {icon && <span className="flex-shrink-0 opacity-70">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="rounded-2xl border border-border p-4 sm:p-5"
      style={{ background: 'hsl(237 40% 6%)' }}
    >
      {children}
    </article>
  )
}

function FilterRow<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (next: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className="rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors"
          style={{
            background: value === option ? 'hsl(217 100% 50% / 0.15)' : 'hsl(237 40% 6%)',
            borderColor: value === option ? 'hsl(217 100% 50% / 0.4)' : 'hsl(var(--border))',
            color: value === option ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
          }}
        >
          {option === 'all' ? 'All' : humanise(option)}
        </button>
      ))}
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="relative flex-1 min-w-[12rem]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  )
}

function PanelState({ loading, error, empty, emptyLabel, emptyHint, children }: {
  loading: boolean
  error: string
  empty: boolean
  emptyLabel: string
  emptyHint?: string
  children: React.ReactNode
}) {
  return (
    <>
      {error && (
        <p className="mb-4 text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle size={15} />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : empty ? (
        <div
          className="text-center py-20 rounded-2xl border border-border"
          style={{ background: 'hsl(237 40% 6%)' }}
        >
          <Inbox size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-foreground font-medium">{emptyLabel}</p>
          {emptyHint && <p className="text-xs text-muted-foreground mt-1">{emptyHint}</p>}
        </div>
      ) : (
        children
      )}
    </>
  )
}

function useAdminList<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)

  const run = useCallback(async () => {
    const id = ++request.current

    setLoading(true)
    setError('')

    try {
      const result = await load()
      if (request.current === id) setData(result)
    } catch (err) {
      if (request.current === id) {
        setError(err instanceof Error ? err.message : 'Could not load that.')
      }
    } finally {
      if (request.current === id) setLoading(false)
    }
  }, deps)

  useEffect(() => { run() }, [run])

  return { data, loading, error, reload: run }
}

function useDebounced<T>(value: T, delay = 350) {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return settled
}

function Total({ shown, total }: { shown: number; total?: number }) {
  return (
    <p className="text-xs text-muted-foreground mb-3">
      Showing {shown}{typeof total === 'number' ? ` of ${total}` : ''}
    </p>
  )
}

export type PanelProps = { token: string; registerReload: (reload: () => void) => void }

function useRegisterReload(register: (reload: () => void) => void, reload: () => void) {
  useEffect(() => { register(reload) }, [register, reload])
}

const ORDER_STATUSES = [
  'all', 'pending', 'assigned', 'accepted', 'picked_up', 'en_route', 'delivered', 'cancelled',
] as const

type OrderFilter = (typeof ORDER_STATUSES)[number]

function OrderCard({ order }: { order: AdminOrder }) {
  const distance = decimal(order.distanceMiles)
  const tip = decimal(order.tipAmount)

  const customer = order.customer?.displayName || order.customerName || order.customer?.email || 'Unknown customer'
  const contact = order.customer?.email || order.customerEmail
  const phone = order.customer?.phone || order.customerPhone

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(217 100% 50% / 0.15)' }}
        >
          <Package size={18} className="text-primary" />
        </div>

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

      {order.items && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          <span className="text-muted-foreground/70">Items: </span>{order.items}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Distance" value={distance !== null ? distance.toFixed(1) + ' mi' : '—'} />
        <Stat label="Tip" value={tip !== null ? '$' + tip.toFixed(2) : '—'} />
        <Stat label="Driver payout" value={money(order.earnings?.payoutCents)} />
        <Stat label="Delivered" value={day(order.deliveredAt)} />
      </div>

      {order.deliveryPhotoUrl && (
        <a
          href={order.deliveryPhotoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Camera size={12} />Proof of delivery
        </a>
      )}
    </Card>
  )
}

export function OrdersPanel({ token, registerReload }: PanelProps) {
  const [status, setStatus] = useState<OrderFilter>('all')
  const [search, setSearch] = useState('')
  const query = useDebounced(search)

  const { data, loading, error, reload } = useAdminList(
    () => adminApi.orders(token, {
      status: status === 'all' ? undefined : status,
      search: query || undefined,
      limit: 50,
    }),
    [token, status, query],
  )

  useRegisterReload(registerReload, reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search ref, name, phone, address" />
      </div>

      <div className="mb-6">
        <FilterRow<OrderFilter> options={ORDER_STATUSES} value={status} onChange={setStatus} />
      </div>

      <PanelState
        loading={loading}
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

export function CustomersPanel({ token, registerReload }: PanelProps) {
  const [search, setSearch] = useState('')
  const query = useDebounced(search)

  const { data, loading, error, reload } = useAdminList(
    () => adminApi.customers(token, { search: query || undefined, limit: 50 }),
    [token, query],
  )

  useRegisterReload(registerReload, reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search name, email, phone" />
      </div>

      <PanelState
        loading={loading}
        error={error}
        empty={!data?.customers.length}
        emptyLabel="No customers"
      >
        <Total shown={data?.customers.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.customers.map((customer) => (
            <Card key={customer.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(217 100% 50% / 0.15)' }}
                >
                  <User size={18} className="text-primary" />
                </div>

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
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Stat label="Orders" value={customer.orders?.total ?? 0} />
                <Stat label="Delivered" value={customer.orders?.delivered ?? 0} />
                <Stat label="Active" value={customer.orders?.active ?? 0} />
                <Stat label="Last order" value={day(customer.orders?.lastOrderAt)} />
                <Stat label="Total spent" value={money(customer.totalSpentCents)} />
              </div>
            </Card>
          ))}
        </div>
      </PanelState>
    </>
  )
}

export function DriversPanel({ token, registerReload }: PanelProps) {
  const [search, setSearch] = useState('')
  const query = useDebounced(search)

  const { data, loading, error, reload } = useAdminList(
    () => adminApi.drivers(token, { search: query || undefined, limit: 50 }),
    [token, query],
  )

  useRegisterReload(registerReload, reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search name, email, phone" />
      </div>

      <PanelState
        loading={loading}
        error={error}
        empty={!data?.drivers.length}
        emptyLabel="No drivers"
        emptyHint="Approved applicants appear here as drivers."
      >
        <Total shown={data?.drivers.length ?? 0} total={data?.total} />
        <div className="space-y-3">
          {data?.drivers.map((driver) => (
            <Card key={driver.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(217 100% 50% / 0.15)' }}
                >
                  <Car size={18} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {driver.displayName || driver.email}
                    </p>
                    <StatusBadge value={driver.status} />
                    <StatusBadge
                      label="Can drive"
                      value={driver.eligibility?.eligible ? 'approved' : 'rejected'}
                    />
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
              </div>

              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                <StatusBadge label="Accreditation" value={driver.accreditation?.status} />
                <StatusBadge label="Licence" value={driver.accreditation?.license} />
                <StatusBadge label="Insurance" value={driver.accreditation?.insurance} />
                <StatusBadge label="Background" value={driver.accreditation?.background} />
              </div>

              {!driver.eligibility?.eligible && driver.eligibility?.reason && (
                <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                  {driver.eligibility.reason}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Stat label="Deliveries" value={driver.orders?.total ?? 0} />
                <Stat label="Completed" value={driver.orders?.delivered ?? 0} />
                <Stat label="Active" value={driver.orders?.active ?? 0} />
                <Stat label="Unsettled" value={driver.orders?.unsettled ?? 0} />
                <Stat label="Earned" value={money(driver.totalEarnedCents)} />
              </div>
            </Card>
          ))}
        </div>
      </PanelState>
    </>
  )
}

const APPLICATION_STATUSES = [
  'all', 'in_progress', 'under_review', 'approved', 'rejected',
] as const

type ApplicationFilter = (typeof APPLICATION_STATUSES)[number]

function ReviewActions({ application, token, onReviewed }: {
  application: Accreditation
  token: string
  onReviewed: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  const status = application.accreditationStatus
  const submitted = Boolean(application.submittedAt)
  const blockedReason = submitted ? '' : 'Not submitted for review yet'

  const run = async (action: 'approve' | 'reject') => {
    setBusy(action)
    setError('')

    try {
      if (action === 'approve') {
        await driverReviewApi.approve(token, application.userId)
      } else {
        await driverReviewApi.reject(token, application.userId, reason.trim())
      }
      setRejecting(false)
      setReason('')
      onReviewed()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not go through.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run('approve')}
              disabled={busy !== null || !submitted || status === 'approved'}
              title={blockedReason || (status === 'approved' ? 'Already approved' : undefined)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#22C55E', color: '#04120A' }}
            >
              {busy === 'approve'
                ? <Loader2 size={13} className="animate-spin" />
                : <Check size={13} />}
              Approve driver
            </button>

            <button
              onClick={() => setRejecting(true)}
              disabled={busy !== null || !submitted || status === 'rejected'}
              title={blockedReason || (status === 'rejected' ? 'Already rejected' : undefined)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'hsl(0 84% 60% / 0.5)', color: '#EF4444' }}
            >
              <X size={13} />
              Reject
            </button>
          </div>

          {!submitted && (
            <p className="mt-2.5 text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              Not submitted for review yet — the applicant has to claim their account
              and finish accreditation in the app before this can be decided.
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

function ApplicationCard({ application, token, onReviewed }: {
  application: Accreditation
  token: string
  onReviewed: () => void
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
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(217 100% 50% / 0.15)' }}
        >
          <ClipboardList size={18} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="font-semibold text-foreground truncate">{name}</p>
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

      <ReviewActions application={application} token={token} onReviewed={onReviewed} />
    </Card>
  )
}

export function ApplicationsPanel({ token, registerReload }: PanelProps) {
  const [status, setStatus] = useState<ApplicationFilter>('all')

  const { data, loading, error, reload } = useAdminList(
    () => accreditationsApi.list(token, {
      status: status === 'all' ? undefined : status,
      limit: 50,
    }),
    [token, status],
  )

  useRegisterReload(registerReload, reload)

  return (
    <>
      <div className="mb-6">
        <FilterRow<ApplicationFilter> options={APPLICATION_STATUSES} value={status} onChange={setStatus} />
      </div>

      <PanelState
        loading={loading}
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
            />
          ))}
        </div>
      </PanelState>
    </>
  )
}
