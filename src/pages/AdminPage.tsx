import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Car,
  ChevronDown,
  ClipboardList,
  LogOut,
  Package,
  RefreshCw,
  Shield,
  User,
  Users,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react'

import {
  authApi,
  session as apiSession,
  type AccountStatus,
  type AdminSession,
  type AdminUser,
  type Role,
  usersApi,
} from '../lib/api'

import {
  ApplicationsPanel,
  CustomersPanel,
  DriversPanel,
  OrdersPanel,
} from '../components/AdminPanels'

type View = 'orders' | 'customers' | 'drivers' | 'applications' | 'users'

const VIEWS = [
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'customers', label: 'Customers', icon: User },
  { key: 'drivers', label: 'Drivers', icon: Car },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'users', label: 'Accounts', icon: Users },
] as const

const SESSION_KEY = 'pickuprunner_admin_session'
  
function Login({
  onLogin,
  notice,
}: {
  onLogin: (session: AdminSession) => void
  notice?: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const data = await authApi.login(email, password)

      if (data.user.role !== 'admin') {
        throw new Error('This account does not have admin access.')
      }

      onLogin({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'hsl(240 67% 3%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'hsl(217 100% 50% / 0.15)',
            }}
          >
            <Shield size={28} className="text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Admin Access
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Sign in with your admin account
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border p-6 space-y-4"
          style={{
            background: 'hsl(237 40% 6%)',
          }}
        >
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground bg-background outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground bg-background outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {notice && !error && (
            <p
              className="text-xs flex items-start gap-1.5 rounded-lg px-3 py-2"
              style={{
                background: 'hsl(47 100% 48% / 0.1)',
                border: '1px solid hsl(47 100% 48% / 0.3)',
                color: '#F5C400',
              }}
            >
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              {notice}
            </p>
          )}

          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle size={12} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{
              background: '#0066FF',
              color: '#fff',
            }}
          >
            {loading ? 'Signing in...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

function RoleDropdown({
  value,
  disabled,
  onChange,
}: {
  value: Role
  disabled: boolean
  onChange: (role: Role) => void
}) {
  const [open, setOpen] = useState(false)

  const roles: Role[] = [
    'customer',
    'driver',
    'admin',
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="inline-flex min-w-28 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium capitalize text-foreground disabled:opacity-60"
      >
        {value}

        <ChevronDown
          size={14}
          className={
            open
              ? 'rotate-180 transition-transform'
              : 'transition-transform'
          }
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-28 overflow-hidden rounded-lg border border-border shadow-xl"
          style={{
            background: 'hsl(237 40% 10%)',
          }}
        >
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setOpen(false)

                if (role !== value) {
                  onChange(role)
                }
              }}
              className="w-full px-3 py-2 text-left text-xs capitalize text-muted-foreground hover:bg-primary/15 hover:text-foreground"
              style={{
                background:
                  role === value
                    ? 'hsl(217 100% 50% / 0.15)'
                    : undefined,
              }}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UserRow({
  user,
  token,
  reload,
}: {
  user: AdminUser
  token: string
  reload: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = async (
    action: 'role' | 'status',
    value: Role | AccountStatus
  ) => {
    setSaving(true)
    setError('')

    try {
      if (action === 'role') {
        await usersApi.updateRole(
          token,
          user.id,
          value as Role
        )
      } else {
        await usersApi.updateStatus(
          token,
          user.id,
          value as AccountStatus
        )
      }

      await reload()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Update failed'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <article
      className="rounded-2xl border border-border p-4 sm:p-5"
      style={{
        background: 'hsl(237 40% 6%)',
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'hsl(217 100% 50% / 0.15)',
          }}
        >
          <User
            size={18}
            className="text-primary"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {user.displayName || user.email}
          </p>

          <p className="text-xs text-muted-foreground truncate">
            {user.email}
            {user.phone ? ' · ' + user.phone : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <RoleDropdown
            value={user.role}
            disabled={saving}
            onChange={(role) =>
              update('role', role)
            }
          />

          <button
            onClick={() =>
              update(
                'status',
                user.status === 'active'
                  ? 'suspended'
                  : 'active'
              )
            }
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
            style={{
              borderColor:
                user.status === 'active'
                  ? 'hsl(0 84% 60% / 0.5)'
                  : 'hsl(142 71% 45% / 0.5)',
              color:
                user.status === 'active'
                  ? '#EF4444'
                  : '#22C55E',
            }}
          >
            {user.status === 'active' ? (
              <UserRoundX size={14} />
            ) : (
              <UserRoundCheck size={14} />
            )}

            {user.status === 'active'
              ? 'Suspend'
              : 'Reactivate'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
        <span
          className="rounded-full px-2 py-0.5"
          style={{
            color:
              user.status === 'active'
                ? '#22C55E'
                : '#EF4444',
          }}
        >
          {user.status}
        </span>

        <span>
          Joined{' '}
          {new Date(
            user.createdAt
          ).toLocaleDateString()}
        </span>
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </article>
  )
}

export function AdminPage() {
  const [session, setSession] =
    useState<AdminSession | null>(() => {
      try {
        return JSON.parse(
          sessionStorage.getItem(
            SESSION_KEY
          ) || 'null'
        )
      } catch {
        return null
      }
    })

  const [users, setUsers] = useState<AdminUser[]>([])

  const [allUsers, setAllUsers] =
    useState<AdminUser[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [role, setRole] =
    useState<'all' | Role>('all')

  const loadUsers = async () => {
    if (!session) return

    setLoading(true)
    setError('')

    try {
      const data = await usersApi.list(
        session.accessToken
      )

      const list = data?.users ?? []

      setAllUsers(list)

      const filteredUsers =
        role === 'all'
          ? list
          : list.filter(
              (user) =>
                user.role === role
            )

      setUsers(filteredUsers)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load users.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [session, role])

  const [view, setView] = useState<View>('orders')

  const panelReload = useRef<(() => void) | null>(null)
  const registerReload = useCallback((reload: () => void) => {
    panelReload.current = reload
  }, [])

  const [expiredNotice, setExpiredNotice] = useState('')

  const login = (nextSession: AdminSession) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    apiSession.set({
      accessToken: nextSession.accessToken,
      refreshToken: nextSession.refreshToken,
    })

    setExpiredNotice('')
    setSession(nextSession)
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    apiSession.set(null)

    setSession(null)
    setUsers([])
    setAllUsers([])
  }

  useEffect(() => {
    if (session) {
      apiSession.set({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      })
    }

    apiSession.onRefreshed((next) => {
      setSession((current) => {
        if (!current) return current

        const updated = { ...current, ...next }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
        return updated
      })
    })

    apiSession.onExpired(() => {
      sessionStorage.removeItem(SESSION_KEY)
      apiSession.set(null)

      setSession(null)
      setUsers([])
      setAllUsers([])
      setExpiredNotice('Your session expired. Please sign in again.')
    })

    return () => {
      apiSession.onRefreshed(null)
      apiSession.onExpired(null)
    }
  }, [session])

  const counts = {
    all: allUsers.length,

    customer: allUsers.filter(
      (user) =>
        user.role === 'customer'
    ).length,

    driver: allUsers.filter(
      (user) =>
        user.role === 'driver'
    ).length,

    admin: allUsers.filter(
      (user) =>
        user.role === 'admin'
    ).length,
  }

  if (!session) {
    return <Login onLogin={login} notice={expiredNotice} />
  }

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-4 sm:px-6"
      style={{
        background: 'hsl(240 67% 3%)',
      }}
    >
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>

            <p className="text-sm text-muted-foreground mt-0.5">
              Manage platform accounts
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => {
                if (view === 'users') loadUsers()
                else panelReload.current?.()
              }}
              disabled={view === 'users' && loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={view === 'users' && loading ? 'animate-spin' : ''}
              />

              Refresh
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground"
            >
              <LogOut size={14} />

              Sign out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6 rounded-xl border border-border p-1 w-fit">
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: view === key ? '#0066FF' : 'transparent',
                color: view === key ? '#fff' : 'hsl(var(--muted-foreground))',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {session && view === 'orders' && (
          <OrdersPanel token={session.accessToken} registerReload={registerReload} />
        )}

        {session && view === 'customers' && (
          <CustomersPanel token={session.accessToken} registerReload={registerReload} />
        )}

        {session && view === 'drivers' && (
          <DriversPanel token={session.accessToken} registerReload={registerReload} />
        )}

        {session && view === 'applications' && (
          <ApplicationsPanel token={session.accessToken} registerReload={registerReload} />
        )}

        {view === 'users' && (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(
            [
              'all',
              'customer',
              'driver',
              'admin',
            ] as const
          ).map((key) => (
            <button
              key={key}
              onClick={() =>
                setRole(key)
              }
              className="rounded-xl border p-4 text-left transition-colors"
              style={{
                background:
                  role === key
                    ? 'hsl(217 100% 50% / 0.1)'
                    : 'hsl(237 40% 6%)',

                borderColor:
                  role === key
                    ? 'hsl(217 100% 50% / 0.4)'
                    : 'hsl(var(--border))',
              }}
            >
              <p className="text-2xl font-bold text-foreground">
                {counts[key]}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                {key === 'all'
                  ? 'All users'
                  : key + 's'}
              </p>
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive flex items-center gap-1.5">
            <AlertCircle size={15} />
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (

          <div
            className="text-center py-20 rounded-2xl border border-border"
            style={{
              background: 'hsl(237 40% 6%)',
            }}
          >
            <Users
              size={40}
              className="text-muted-foreground mx-auto mb-3 opacity-40"
            />

            <p className="text-foreground font-medium">
              No users found
            </p>
          </div>

        ) : (

          <div className="space-y-3">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                token={session.accessToken}
                reload={loadUsers}
              />
            ))}
          </div>
        )}
        </>
        )}

      </div>
    </div>
  )
}
