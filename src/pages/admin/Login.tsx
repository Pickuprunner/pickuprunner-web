
import { useState } from 'react'
import { ADMIN_RADII } from './chrome'
import { AlertCircle, Shield } from 'lucide-react'
import { authApi, type AdminSession } from '../../lib/api'

export function Login({
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
