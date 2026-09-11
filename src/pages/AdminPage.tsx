import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import {
  AlertCircle,
  Car,
  ClipboardList,
  LogOut,
  Package,
  RefreshCw,
  Shield,
  User,
  Users,
} from 'lucide-react'

import {
  authApi,
  session as apiSession,
  type AdminSession,
} from '../lib/api'

import { AdminContext, type AdminContextValue } from '../components/AdminUi'

/**
 * The Tailwind theme maps rounded-sm/md/lg/xl/full to --radius-* variables that
 * index.css never defines, so those corners come out square. Defined here for
 * the admin screens (the public pages are left as they are).
 */
const ADMIN_RADII = {
  '--radius-sm': '0.25rem',
  '--radius-md': '0.375rem',
  '--radius-lg': '0.5rem',
  '--radius-xl': '0.75rem',
  '--radius-full': '9999px',
} as React.CSSProperties

const TABS = [
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: User },
  { to: '/admin/drivers', label: 'Drivers', icon: Car },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/accounts', label: 'Accounts', icon: Users },
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
      style={{ background: 'hsl(240 67% 3%)', ...ADMIN_RADII }}
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

export function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })

  const [expiredNotice, setExpiredNotice] = useState('')

  // Whatever screen is mounted registers its reload here for the Refresh button.
  const reloadRef = useRef<(() => void) | null>(null)
  const registerReload = useCallback((reload: (() => void) | null) => {
    reloadRef.current = reload
  }, [])

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
      setExpiredNotice('Your session expired. Please sign in again.')
    })

    return () => {
      apiSession.onRefreshed(null)
      apiSession.onExpired(null)
    }
  }, [session])


  const signedInAs = session?.user?.id ?? null
  const context = useMemo<AdminContextValue | null>(
    () => (session ? { token: session.accessToken, user: session.user, registerReload } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signedInAs, registerReload],
  )

  if (!session || !context) {
    return <Login onLogin={login} notice={expiredNotice} />
  }

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-4 sm:px-6"
      style={{ background: 'hsl(240 67% 3%)', ...ADMIN_RADII }}
    >
      {/* Confirmation pop-ups for admin actions; below the fixed site header. */}
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'hsl(237 40% 10%)',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#04120A' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' }, duration: 5000 },
        }}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/admin/orders" className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </Link>

            <p className="text-sm text-muted-foreground mt-0.5">
              Signed in as {session.user.displayName || session.user.email}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => reloadRef.current?.()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>

        <nav
          aria-label="Admin sections"
          className="flex flex-wrap gap-1 mb-6 rounded-xl border border-border p-1 w-fit"
        >
          {TABS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              // Active on the list and on every detail page under it.
              activeOptions={{ exact: false, includeSearch: false }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              activeProps={{ style: { background: '#0066FF', color: '#fff' } }}
              inactiveProps={{ style: { background: 'transparent', color: 'hsl(var(--muted-foreground))' } }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <AdminContext.Provider value={context}>
          <Outlet />
        </AdminContext.Provider>
      </div>
    </div>
  )
}
