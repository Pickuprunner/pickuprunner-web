
import { Link } from '@tanstack/react-router'
import { ClipboardList, UserRound } from 'lucide-react'
import { accreditationsApi } from '../../../lib/api'
import { BackLink, DetailHeader, EligibilityBadge, Panel, PanelSection, StatusBadge, useAdmin, useAdminData } from '../ui'
import { DecisionBar, ProfileActivity, ProfileDetails, ProfileSections } from './ProfileSections'
import { HEADER_LINK, HEADER_LINK_BORDER } from './account'
import { applicationDetailRoute } from './routes'
import { Contact, DetailState, useScreenRefresh } from './shared'

export function ApplicationDetailPage() {
  const { userId } = applicationDetailRoute.useParams()
  const { token } = useAdmin()

  const { data, loading, error, reload } = useAdminData(
    () => accreditationsApi.get(token, userId),
    [token, userId],
  )
  const version = useScreenRefresh(reload)

  return (
    <>
      <BackLink to="/admin/applications" label="Applications" />

      <DetailState loading={loading} error={error} found={Boolean(data)}>
        {data && (
          <>
            <DetailHeader
              bare
              icon={<ClipboardList size={18} className="text-primary" />}
              title={data.legalName || data.user?.displayName || data.user?.email || 'Unnamed applicant'}
              subtitle={data.user ? <Contact account={data.user} /> : undefined}
              badges={
                <>
                  <StatusBadge value={data.accreditationStatus} />
                  {/* Whether they can drive — only when it says something different. */}
                  {data.eligibility?.code !== data.accreditationStatus && (
                    <EligibilityBadge eligibility={data.eligibility} />
                  )}
                </>
              }
              aside={
                <Link
                  to="/admin/drivers/$driverId"
                  params={{ driverId: data.userId }}
                  className={HEADER_LINK}
                  style={HEADER_LINK_BORDER}
                >
                  <UserRound size={13} />
                  Driver profile
                </Link>
              }
              footer={<DecisionBar profile={data} missing={data.missing} onReviewed={reload} />}
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <Panel>
                <ProfileSections profile={data} version={version} onReviewed={reload} />
              </Panel>

              <Panel>
                <PanelSection title="Details">
                  <ProfileDetails profile={data} />
                </PanelSection>
                <PanelSection title="Activity">
                  <ProfileActivity profile={data} />
                </PanelSection>
              </Panel>
            </div>
          </>
        )}
      </DetailState>
    </>
  )
}

// ── /admin/accounts/$userId ─────────────────────────────────────────────────
