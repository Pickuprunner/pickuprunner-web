
import { useCallback, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { AlertCircle, Car, ChevronDown, ClipboardList, Eye, FileText, MapPin } from 'lucide-react'
import { accreditationsApi, type Accreditation } from '../../../lib/api'
import { Card, Detail, DocumentBadge, ExpiryChip, FilterRow, IconBubble, PanelState, RenewalBadge, StatusBadge, Total, credentials, day, matchesDerived, renewalOf, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { QuickCheck, approveBlockers } from '../quick-check'
import { ReviewActions } from './ReviewActions'
import { APPLICATION_STATUSES, ApplicationFilter, DERIVED_FILTERS, FILTER_LABELS, isDerivedFilter } from './filters'
import { applicationsRoute } from './routes'

function ApplicationCard({ application, token, onReviewed, onQuickCheck }: {
  application: Accreditation
  token: string
  onReviewed: () => void
  onQuickCheck: () => void
}) {
  const [renewalBusy, setRenewalBusy] = useState(false)
  const { user } = application

  const name = application.legalName || user?.displayName || user?.email || 'Unnamed applicant'
  const vehicle = [application.vehicleYear, application.vehicleMake, application.vehicleModel]
    .filter(Boolean)
    .join(' ')
  const area = application.serviceArea || [application.city, application.state].filter(Boolean).join(', ')
  const applied = application.submittedAt || application.createdAt

  const { license, insurance } = credentials(application)
  const renewal = renewalOf(application)

  const documents = [
    { label: 'Licence front', held: application.documents?.licenseFront },
    { label: 'Licence back', held: application.documents?.licenseBack },
    { label: 'Insurance card', held: application.documents?.insuranceCard },
  ]

  const approveRenewal = async () => {
    if (renewal.kind === 'none') return

    setRenewalBusy(true)
    try {
      await accreditationsApi.review(token, application.userId, {
        ...(renewal.kind === 'license' || renewal.kind === 'both'
          ? { licenseStatus: 'approved' as const }
          : {}),
        ...(renewal.kind === 'insurance' || renewal.kind === 'both'
          ? { insuranceStatus: 'approved' as const }
          : {}),
      })
      toast.success(
        renewal.kind === 'both'
          ? 'Updated licence and insurance approved'
          : `Updated ${renewal.kind === 'license' ? 'licence' : 'insurance'} approved`,
      )
      onReviewed()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'That did not go through.')
    } finally {
      setRenewalBusy(false)
    }
  }

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

        <div className="flex-shrink-0 flex flex-wrap gap-1.5 sm:justify-end">
          <StatusBadge value={renewal.kind === 'none' ? application.accreditationStatus : 'under_review'} />
          <RenewalBadge source={application} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-x-3 gap-y-2">
        <DocumentBadge credential={license} />
        <ExpiryChip window={license.window} quiet />
        <DocumentBadge credential={insurance} />
        <ExpiryChip window={insurance.window} quiet />
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
          application={{
            ...application,
            accreditationStatus: renewal.kind === 'none' ? application.accreditationStatus : 'under_review',
          }}
          token={token}
          onReviewed={onReviewed}
          name={name}
          onApprove={renewal.kind === 'none' ? onQuickCheck : approveRenewal}
          approveLabel={renewal.kind === 'none'
            ? undefined
            : `Approve updated ${renewal.kind === 'both' ? 'documents' : renewal.kind === 'license' ? 'licence' : 'insurance'}`}
          approveBusy={renewalBusy}
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
  const derived = isDerivedFilter(status)

  const { data, loading, error, reload } = useAdminData(
    () => accreditationsApi.list(token, {
      status: status === 'all' || derived ? undefined : status,
      limit: 50,
    }),
    [token, status],
  )

  useRegisterReload(reload)

  const [checking, setChecking] = useState<string | null>(null)
  const fetched = data?.accreditations ?? []
  const applications = derived
    ? fetched.filter((application) => matchesDerived(status, application))
    : fetched

  const counts =
    status === 'all' || derived
      ? Object.fromEntries(
          DERIVED_FILTERS.map((name) => [
            name,
            fetched.filter((application) => matchesDerived(name, application)).length,
          ]),
        )
      : undefined
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
          labels={FILTER_LABELS}
          counts={counts}
          onChange={(next) => navigate({ search: { status: next === 'all' ? undefined : next } })}
        />
      </div>

      <PanelState
        loading={loading && !data}
        error={error}
        empty={!applications.length}
        emptyLabel={derived ? 'Nothing in this view' : 'No driver applications'}
        emptyHint={
          derived
            ? 'No one on this page matches. Renewals and expiries are read from the applications already loaded.'
            : 'Applications submitted from the Drive With Us page land here.'
        }
      >
        <Total shown={applications.length} total={derived ? undefined : data?.total} />
        <div className="space-y-3">
          {applications.map((application) => (
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
