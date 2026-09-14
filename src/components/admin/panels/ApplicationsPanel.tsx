
import { useCallback, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle, Car, ChevronDown, ClipboardList, Eye, FileText, MapPin } from 'lucide-react'
import { accreditationsApi, type Accreditation } from '../../../lib/api'
import { Card, Detail, FilterRow, IconBubble, PanelState, StatusBadge, Total, day, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { QuickCheck, approveBlockers } from '../quick-check'
import { ReviewActions } from './ReviewActions'
import { APPLICATION_STATUSES, ApplicationFilter } from './filters'
import { applicationsRoute } from './routes'

function ApplicationCard({ application, token, onReviewed, onQuickCheck }: {
  application: Accreditation
  token: string
  onReviewed: () => void
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

  const [checking, setChecking] = useState<string | null>(null)
  const applications = data?.accreditations ?? []
  const decided = useRef(new Set<string>())
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
