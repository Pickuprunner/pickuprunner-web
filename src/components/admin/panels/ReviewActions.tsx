
import toast from 'react-hot-toast'
import { useState } from 'react'
import { AlertCircle, Check, CheckCircle2, Loader2, X } from 'lucide-react'
import { driverReviewApi, type Accreditation } from '../../../lib/api'
import { approveBlockers } from '../quick-check'

export function ReviewActions({ application, token, onReviewed, name, onApprove, approveLabel, approveBusy = false, extra, showNote = true }: {
  application: Pick<Accreditation, 'userId' | 'accreditationStatus' | 'submittedAt'> & { missing?: string[] | null }
  token: string
  onReviewed: () => void
  name?: string | null
  onApprove?: () => void
  approveLabel?: string
  approveBusy?: boolean
  extra?: React.ReactNode
  showNote?: boolean
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  const status = application.accreditationStatus
  const submitted = Boolean(application.submittedAt)
  const blockers = approveBlockers(application)
  const canApprove = blockers.length === 0
  const approveBlocked = canApprove ? '' : `Still missing: ${blockers.join(', ')}`

  const run = async (action: 'approve' | 'reject') => {
    setBusy(action)
    setError('')

    try {
      if (action === 'approve') {
        await driverReviewApi.approve(token, application.userId)
        toast.success(`${name || 'Driver'} approved — they can take orders now`)
      } else {
        await driverReviewApi.reject(token, application.userId, reason.trim())
        toast.success(`${name ? name + "'s" : 'The'} application was rejected — they'll see your reason`)
      }
      setRejecting(false)
      setReason('')
      onReviewed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {rejecting ? (
        <div className="space-y-3">
          <label
            htmlFor={`reason-${application.userId}`}
            className="block text-xs font-semibold text-muted-foreground"
          >
            Why is this being rejected? The applicant sees this.
          </label>

          <textarea
            id={`reason-${application.userId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            autoFocus
            placeholder="e.g. The insurance card has expired — upload a current one and submit again."
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run('reject')}
              disabled={!reason.trim() || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#EF4444', color: '#fff' }}
            >
              {busy === 'reject'
                ? <Loader2 size={13} className="animate-spin" />
                : <X size={13} />}
              Confirm rejection
            </button>

            <button
              type="button"
              onClick={() => { setRejecting(false); setReason(''); setError('') }}
              disabled={busy !== null}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {status === 'approved' ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ background: 'hsl(142 71% 45% / 0.12)', border: '1px solid hsl(142 71% 45% / 0.4)', color: '#22C55E' }}
              >
                <CheckCircle2 size={13} />
                Approved
              </span>
            ) : (
            <button
              type="button"
              onClick={() => (onApprove ? onApprove() : run('approve'))}
              disabled={busy !== null || approveBusy || !canApprove}
              title={approveBlocked || undefined}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#22C55E', color: '#04120A' }}
            >
              {busy === 'approve' || approveBusy
                ? <Loader2 size={13} className="animate-spin" />
                : <Check size={13} />}
              {approveLabel || 'Approve driver'}
            </button>
            )}

            {status === 'rejected' ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.4)', color: '#EF4444' }}
              >
                <X size={13} />
                Rejected
              </span>
            ) : (
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={busy !== null}
              title={status === 'approved' ? 'Take back the approval — they stop being able to take orders' : undefined}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'hsl(0 84% 60% / 0.5)', color: '#EF4444' }}
            >
              <X size={13} />
              Reject
            </button>
            )}

            {extra}
          </div>

          {showNote && status !== 'approved' && (!submitted || !canApprove) && (
            <p className="mt-2.5 text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              {!canApprove
                ? `${submitted ? 'Still missing' : 'Not submitted yet — still missing'}: ${blockers.join(', ')}. You can approve once that's in, or reject now.`
                : 'Not submitted yet, but everything is filled in — you can approve now.'}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </div>
  )
}
