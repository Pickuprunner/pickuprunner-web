
import { Banknote, Car, MapPin } from 'lucide-react'
import { adminApi, type Accreditation } from '../../../lib/api'
import { Avatar, CardLink, Detail, EligibilityBadge, EligibilityNote, PanelState, SearchBox, Stat, StatusBadge, Total, ViewHint, day, money, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { driversRoute } from './routes'

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
