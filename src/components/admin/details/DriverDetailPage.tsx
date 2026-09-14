
import { Link } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { Avatar, BackLink, DetailHeader, EligibilityBadge, Field, Fields, Panel, PanelSection, Stat, StatusBadge, day, money, timeAgo, useAdmin, useAdminData, yesNo } from '../ui'
import { OrderHistory } from './OrderHistory'
import { DecisionBar, ProfileDetails, ProfileSections } from './ProfileSections'
import { AccountFields, DeletedNote, HEADER_LINK, HEADER_LINK_BORDER, HeaderActions } from './account'
import { driverDetailRoute } from './routes'
import { Contact, DetailState, MapLink, OnOff, StatsRow, useScreenRefresh } from './shared'

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