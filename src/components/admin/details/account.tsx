
import { AlertCircle } from 'lucide-react'
import { type AccountStatus, type AdminAccount, type Role } from '../../../lib/api'
import { Avatar, Field, Fields, Section, StatusBadge, dateTime, humanise, useAdmin, yesNo } from '../ui'
import { AccountControls } from '../panels'
import { Contact } from './shared'

export function AccountFields({ account, single = false, compact = false }: {
  account: AdminAccount
  single?: boolean
  compact?: boolean
}) {
  const metadata = account.metadata && typeof account.metadata === 'object'
    ? Object.entries(account.metadata)
    : []

  return (
    <Fields single={single}>
      {!compact && (
        <>
          <Field label="Name" value={account.displayName} />
          <Field label="Email" value={account.email} />
          <Field label="Phone" value={account.phone} />
          <Field label="Email verified" value={yesNo(account.emailVerified)} />
          <Field label="Role" value={<span className="capitalize">{account.role}</span>} />
          <Field label="Status" value={<span className="capitalize">{account.status}</span>} />
        </>
      )}
      <Field label="Joined" value={dateTime(account.createdAt)} />
      <Field label="Last sign-in" value={account.lastSignIn ? dateTime(account.lastSignIn) : 'Never'} />
      {!compact && <Field label="Last updated" value={dateTime(account.updatedAt)} />}
      {account.deletedAt && <Field label="Deleted" value={dateTime(account.deletedAt)} />}
      {(!compact || account.stripeAccountId) && (
        <Field label="Stripe account" value={account.stripeAccountId} mono />
      )}
      {metadata.map(([key, value]) => (
        <Field
          key={key}
          label={humanise(key)}
          value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          mono={typeof value === 'object'}
        />
      ))}
      <Field label="Account ID" value={account.id} mono wide />
    </Fields>
  )
}

export function HeaderActions({ account, onChanged, children }: {
  account: { id: string; role: Role; status: AccountStatus; deletedAt?: string | null }
  onChanged: () => void
  children?: React.ReactNode
}) {
  const { token, user: me } = useAdmin()
  const canManage = !account.deletedAt && account.id !== me.id

  if (!canManage && !children) return null

  return (
    <div className="flex flex-wrap items-start gap-2 sm:justify-end">
      {children}
      {canManage && <AccountControls user={account} token={token} onChanged={onChanged} />}
    </div>
  )
}

export const HEADER_LINK =
  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap'

export const HEADER_LINK_BORDER = { borderColor: 'hsl(217 100% 50% / 0.5)' }

export function DeletedNote({ at }: { at?: string | null }) {
  if (!at) return null
  return (
    <p className="text-xs text-muted-foreground flex items-start gap-1.5 px-1">
      <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-destructive" />
      This account was deleted on {dateTime(at)}. Its name, email and phone were erased; its orders are kept.
    </p>
  )
}

export function PersonCard({ title, account, fallbackName, fallbackContact, link, emptyNote }: {
  title: string
  account: AdminAccount | null
  fallbackName: string
  fallbackContact?: string
  link?: React.ReactNode
  emptyNote?: string
}) {
  return (
    <Section title={title} action={account && !account.deletedAt ? link : undefined}>
      <div className="flex items-center gap-3">
        <Avatar url={account?.photoUrl} name={account?.displayName || fallbackName} size={44} zoom />
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {account?.displayName || fallbackName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            {account ? <Contact account={account} /> : fallbackContact || 'No contact details'}
          </p>
          {account && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {account.deletedAt ? <StatusBadge value="deleted" /> : <StatusBadge value={account.status} />}
            </div>
          )}
        </div>
      </div>
      {!account && emptyNote && <p className="text-[11px] text-muted-foreground mt-3">{emptyNote}</p>}
    </Section>
  )
}