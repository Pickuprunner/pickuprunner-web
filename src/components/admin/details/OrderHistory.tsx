
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { adminApi, type AdminOrderQuery, type OrderStatus, type PaymentStatus } from '../../../lib/api'
import { ErrorLine, Panel, PanelSection, Section, StatusBadge, day, money, useAdmin } from '../ui'

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

export function OrderHistory({ title, filter, version, empty, inPanel = false }: {
  title: string
  filter: Pick<AdminOrderQuery, 'customerId' | 'driverUserId'>
  version: number
  empty: string
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
