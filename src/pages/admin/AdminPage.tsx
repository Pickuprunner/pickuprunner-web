
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { LogOut, RefreshCw } from 'lucide-react'
import { session as apiSession, type AdminSession } from '../../lib/api'
import { AdminContext, type AdminContextValue } from '../../components/admin/ui'
import { Login } from './Login'
import { ADMIN_RADII, SESSION_KEY, TABS } from './chrome'

export function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })

  const [expiredNotice, setExpiredNotice] = useState('')

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
