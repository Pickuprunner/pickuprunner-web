
import { useCallback, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { type AdminUser, type Role, usersApi } from '../../../lib/api'
import { Avatar, CARD_BACKGROUND, ErrorLine, Spinner, day, useAdmin, useAdminData, useRegisterReload } from '../ui'
import { AccountControls } from './AccountControls'
import { ACCOUNT_ROLES, AccountFilter } from './filters'
import { accountsRoute } from './routes'

export function ProfileLink({ user, className, children }: {
  user: { id: string; role: Role }
  className?: string
  children: React.ReactNode
}) {
  if (user.role === 'customer') {
    return (
      <Link to="/admin/customers/$customerId" params={{ customerId: user.id }} className={className}>
        {children}
      </Link>
    )
  }
  if (user.role === 'driver') {
    return (
      <Link to="/admin/drivers/$driverId" params={{ driverId: user.id }} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <Link to="/admin/accounts/$userId" params={{ userId: user.id }} className={className}>
      {children}
    </Link>
  )
}

function AccountRow({ user, token, reload }: { user: AdminUser; token: string; reload: () => void }) {
  return (
    <article
      className="group relative rounded-2xl border border-border p-4 sm:p-5 transition-colors hover:border-primary/50 focus-within:border-primary/50"
      style={{ background: CARD_BACKGROUND }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar url={user.photoUrl} name={user.displayName || user.email} />

        <div className="flex-1 min-w-0">
          <ProfileLink
            user={user}
            className="font-semibold text-foreground truncate block group-hover:text-primary focus:outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary/60"
          >
            {user.displayName || user.email}
          </ProfileLink>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
            {user.phone ? ' · ' + user.phone : ''}
          </p>
        </div>

        <div className="relative z-10 focus-within:z-20">
          <AccountControls user={user} token={token} onChanged={reload} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span
          className="rounded-full px-2 py-0.5"
          style={{ color: user.status === 'active' ? '#22C55E' : '#EF4444' }}
        >
          {user.status}
        </span>
        <span>Joined {day(user.createdAt)}</span>
        <span className="flex-1" />
        <span className="font-semibold text-primary group-hover:underline">
          {user.role === 'admin' ? 'View account →' : `View full ${user.role} profile →`}
        </span>
      </div>
    </article>
  )
}

export function AccountsPanel() {
  const { token } = useAdmin()
  const { role = 'all' } = accountsRoute.useSearch()
  const navigate = accountsRoute.useNavigate()

  const { data, loading, error, reload } = useAdminData(() => usersApi.list(token), [token])
  useRegisterReload(reload)

  const all = useMemo(() => data?.users ?? [], [data])
  const shown = role === 'all' ? all : all.filter((user) => user.role === role)
  const count = useCallback(
    (key: AccountFilter) => (key === 'all' ? all.length : all.filter((user) => user.role === key).length),
    [all],
  )

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {ACCOUNT_ROLES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate({ search: { role: key === 'all' ? undefined : key } })}
            className="rounded-xl border p-4 text-left transition-colors"
            style={{
              background: role === key ? 'hsl(217 100% 50% / 0.1)' : CARD_BACKGROUND,
              borderColor: role === key ? 'hsl(217 100% 50% / 0.4)' : 'hsl(var(--border))',
            }}
          >
            <p className="text-2xl font-bold text-foreground">{count(key)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {key === 'all' ? 'All users' : key + 's'}
            </p>
          </button>
        ))}
      </div>

      <ErrorLine message={error} />

      {loading && !data ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border border-border"
          style={{ background: CARD_BACKGROUND }}
        >
          <Users size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-foreground font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((user) => (
            <AccountRow key={user.id} user={user} token={token} reload={reload} />
          ))}
        </div>
      )}
    </>
  )
}
