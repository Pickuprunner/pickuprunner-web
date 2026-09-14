
import { Package } from 'lucide-react'
import { adminApi, deliveryApi } from '../../../lib/api'
import { BackLink, DetailHeader, Field, Fields, Section, SignedImage, Stat, StatusBadge, TextLink, dateTime, decimal, itemLines, mapsUrl, money, safeHttpUrl, useAdmin, useAdminData, yesNo } from '../ui'
import { OrderChat } from './OrderChat'
import { PersonCard } from './account'
import { orderDetailRoute } from './routes'
import { Contact, DetailState, MapLink, StatsRow, useScreenRefresh } from './shared'

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