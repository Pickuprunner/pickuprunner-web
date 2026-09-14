
import { adminApi } from '../../../lib/api'
import { Avatar, BackLink, DetailHeader, Panel, PanelSection, Stat, StatusBadge, day, money, useAdmin, useAdminData } from '../ui'
import { OrderHistory } from './OrderHistory'
import { AccountFields, DeletedNote, HeaderActions } from './account'
import { customerDetailRoute } from './routes'
import { Contact, DetailState, StatsRow, useScreenRefresh } from './shared'

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