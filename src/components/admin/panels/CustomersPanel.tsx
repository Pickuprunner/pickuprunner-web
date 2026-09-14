
import { CheckCircle2 } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { Avatar, CardLink, Detail, PanelState, SearchBox, Stat, StatusBadge, Total, ViewHint, day, money, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { customersRoute } from './routes'

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
