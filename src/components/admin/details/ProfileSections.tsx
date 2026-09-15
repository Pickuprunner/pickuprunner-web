
import { AlertCircle } from 'lucide-react'
import { accreditationsApi, type AccreditationProfile, type BackgroundStatus, type CredentialExpiry, type ItemDecision, type ReviewStatus } from '../../../lib/api'
import { DocumentBadge, DocumentNote, ExpiryValue, Field, Fields, PanelSection, StatusBadge, credentials, dateTime, day, useAdmin, yesNo } from '../ui'
import { ReviewActions } from '../panels'
import { BACKGROUND_CHOICES, DocumentTile, ItemReview, REVIEW_CHOICES, licencePhotoGap } from './ItemReview'
import { EXPIRED_RED, vehicleLine, withAge } from './shared'

export function DecisionBar({ profile, missing, onReviewed }: {
  profile: AccreditationProfile
  missing: string[]
  onReviewed: () => void
}) {
  const { token } = useAdmin()

  return (
    <div className="space-y-3">
      {profile.rejectionReason && (
        <p className="text-sm flex items-start gap-1.5" style={{ color: EXPIRED_RED }}>
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span><span className="font-semibold">Rejected:</span> {profile.rejectionReason}</span>
        </p>
      )}
      <ReviewActions
        application={{ ...profile, missing }}
        token={token}
        onReviewed={onReviewed}
        name={profile.legalName}
      />
    </div>
  )
}

export function ProfileSections({ profile, expiry, version, onReviewed }: {
  profile: AccreditationProfile
  expiry?: CredentialExpiry | null
  version: number
  onReviewed: () => void
}) {
  const { token } = useAdmin()
  const userId = profile.userId
  const { license, insurance } = credentials({ ...profile, expiry })

  const save = async (decision: ItemDecision) => {
    await accreditationsApi.review(token, userId, decision)
    onReviewed()
  }

  const reviewBlock = <T extends string>(_values: T[], extra?: Partial<Record<T, string>>) => extra

  const consentRecord = [
    profile.backgroundConsentIp && `from IP ${profile.backgroundConsentIp}`,
    profile.backgroundDisclosureVersion && `disclosure ${profile.backgroundDisclosureVersion}`,
  ].filter(Boolean).join(' · ')

  return (
    <>
      <PanelSection id="licence" title="Driver's licence" action={<DocumentBadge credential={license} />}>
        <DocumentNote credential={license} />
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Fields>
            <Field label="Name on application" value={profile.legalName} />
            <Field label="Date of birth" value={withAge(profile.dateOfBirth)} />
            <Field label="State" value={profile.licenseState} />
            <Field label="Licence number" value={profile.licenseNumber} mono />
            <Field label="Expires" value={<ExpiryValue window={license.window} />} />
          </Fields>
          <div className="grid grid-cols-2 gap-3 content-start max-w-xl">
            <DocumentTile userId={userId} type="license_front" docKey="licenseFront" label="Front" documents={profile.documents} version={version} />
            <DocumentTile userId={userId} type="license_back" docKey="licenseBack" label="Back" documents={profile.documents} version={version} />
          </div>
        </div>
        <ItemReview<ReviewStatus>
          item="licence"
          value={profile.licenseStatus}
          choices={REVIEW_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<ReviewStatus>(['approved', 'pending', 'rejected'], {
            approved: licencePhotoGap(profile.documents, profile.licenseStatus === 'approved'),
          })}
          onDecide={(next, reason) => save({ licenseStatus: next, rejectionReason: reason })}
        />
      </PanelSection>

      <PanelSection id="insurance" title="Vehicle insurance" action={<DocumentBadge credential={insurance} />}>
        <DocumentNote credential={insurance} />
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Fields>
            <Field label="Company" value={profile.insuranceCompany} />
            <Field label="Policy number" value={profile.insurancePolicyNumber} mono />
            <Field label="Starts" value={profile.insuranceEffectiveDate ? day(profile.insuranceEffectiveDate) : null} />
            <Field label="Expires" value={<ExpiryValue window={insurance.window} />} />
            <Field label="NAIC (company code)" value={profile.insuranceNaicNumber} mono />
          </Fields>
          <div className="grid grid-cols-2 gap-3 content-start max-w-xl">
            <DocumentTile userId={userId} type="insurance_card" docKey="insuranceCard" label="Insurance card" documents={profile.documents} version={version} />
          </div>
        </div>
        <ItemReview<ReviewStatus>
          item="insurance"
          value={profile.insuranceStatus}
          choices={REVIEW_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<ReviewStatus>(['approved', 'pending', 'rejected'], {
            approved: !profile.documents?.insuranceCard ? 'No insurance card uploaded — nothing to approve yet.' : undefined,
          })}
          onDecide={(next, reason) => save({ insuranceStatus: next, rejectionReason: reason })}
        />
      </PanelSection>

      <PanelSection id="background" title="Background check" action={<StatusBadge value={profile.backgroundStatus} />}>
        <Fields>
          <Field
            label="Consent"
            value={profile.backgroundConsentAt ? `Given ${dateTime(profile.backgroundConsentAt)}` : null}
          />
          <Field
            label="SSN (last 4)"
            value={
              profile.ssnLast4
                ? <span className="font-mono tracking-widest">{profile.ssnLast4}</span>
                // `hasSsnLast4` without the digits means an older response that
                // still withheld them — not the same as never having given any.
                : profile.hasSsnLast4
                  ? 'On file'
                  : 'Not provided (optional)'
            }
          />
          {profile.backgroundReviewedAt && <Field label="Last decision" value={dateTime(profile.backgroundReviewedAt)} />}
          {profile.backgroundNotes && <Field label="Notes" value={profile.backgroundNotes} wide />}
        </Fields>
        {consentRecord && (
          <p className="mt-3 text-[11px] text-muted-foreground">Consent record: {consentRecord}</p>
        )}
        <ItemReview<BackgroundStatus>
          item="background check"
          value={profile.backgroundStatus}
          choices={BACKGROUND_CHOICES}
          rejectValue="rejected"
          blocked={reviewBlock<BackgroundStatus>(['approved', 'in_review', 'rejected'], {
            approved: !profile.backgroundConsentAt ? 'No background-check consent on file — the driver must authorise it in the app first.' : undefined,
          })}
          onDecide={(next, reason) => save({ backgroundStatus: next, rejectionReason: reason })}
        />
      </PanelSection>
    </>
  )
}

export function ProfileDetails({ profile }: { profile: AccreditationProfile }) {
  const address = [profile.streetAddress, profile.aptSuite, profile.city, profile.state, profile.postalCode]
    .filter(Boolean)
    .join(', ')

  return (
    <Fields single>
      <Field label="Home address" value={address} />
      <Field label="Vehicle" value={vehicleLine(profile)} />
      <Field label="Plate" value={profile.vehiclePlate} />
      <Field label="VIN" value={profile.vehicleVin} mono />
      {profile.serviceArea && <Field label="Service area" value={profile.serviceArea} />}
      {profile.hasLicenseAndInsurance !== null && (
        <Field label="Has licence and insurance" value={yesNo(profile.hasLicenseAndInsurance)} />
      )}
      {profile.cleanDrivingRecord !== null && (
        <Field label="Clean driving record" value={yesNo(profile.cleanDrivingRecord)} />
      )}
      {profile.applicationSource && <Field label="Applied via" value={profile.applicationSource} />}
    </Fields>
  )
}

export function ProfileActivity({ profile }: { profile: AccreditationProfile }) {
  const { user: me } = useAdmin()

  return (
    <Fields single>
      <Field label="Started" value={dateTime(profile.createdAt)} />
      <Field label="Submitted" value={profile.submittedAt ? dateTime(profile.submittedAt) : 'Not yet'} />
      <Field
        label="Last decision"
        value={
          profile.reviewedAt
            ? `${dateTime(profile.reviewedAt)}${profile.reviewedBy ? ` · ${profile.reviewedBy === me.id ? 'you' : 'another admin'}` : ''}`
            : 'Not yet'
        }
      />
    </Fields>
  )
}
