
import { Car, MapPin, Package } from 'lucide-react'
import { adminApi, type AdminOrder } from '../../../lib/api'
import { CardLink, Detail, FilterRow, IconBubble, PaginationControls, PanelState, SearchBox, Stat, StatusBadge, Total, ViewHint, day, decimal, itemLines, money, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { ORDER_STATUSES, OrderFilter } from './filters'
import { ordersRoute } from './routes'

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
        <Stat label="Tip" value={tip !== null ? money(tip) : '—'} />
        <Stat label="Driver payout" value={money(order.earnings?.payoutCents)} />
        <Stat label="Delivered" value={day(order.deliveredAt)} />
      </div>
    </CardLink>
  )
}

export function OrdersPanel() {
  const { token } = useAdmin()
  const { status = 'all', q = '', page = 1 } = ordersRoute.useSearch()
  const navigate = ordersRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => adminApi.orders(token, {
      status: status === 'all' ? undefined : status,
      search: q || undefined,
      limit: 50,
      page,
    }),
    [token, status, q, page],
  )

  useRegisterReload(reload)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBox
          value={q}
          onCommit={(next) => navigate({ search: (prev) => ({ ...prev, q: next || undefined, page: undefined }), replace: true })}
          placeholder="Search ref, name, phone, address"
        />
      </div>

      <div className="mb-6">
        <FilterRow<OrderFilter>
          options={ORDER_STATUSES}
          value={status}
          onChange={(next) => navigate({ search: (prev) => ({ ...prev, status: next === 'all' ? undefined : next, page: undefined }) })}
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
        <PaginationControls
          page={page}
          totalPages={data?.totalPages}
          onChange={(nextPage) => navigate({ search: (prev) => ({ ...prev, page: nextPage <= 1 ? undefined : nextPage }) })}
        />
      </PanelState>
    </>
  )
}
