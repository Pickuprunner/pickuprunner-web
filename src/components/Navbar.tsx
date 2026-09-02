import { useState, useRef } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X, Zap, User, LogOut, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi, type AdminSession, type AdminUser } from '../lib/api'

const CUSTOMER_SESSION_KEY = 'pickuprunner_customer_session'

function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (session: AdminSession) => void }) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = tab === 'signup'
        ? await authApi.register(email, password, name)
        : await authApi.login(email, password)
      onAuth(session)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(3,3,17,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{ background: 'hsl(240 67% 6%)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {tab === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tab === 'signin' ? 'Sign in to your Pickup Runner account' : 'Free — no credit card needed'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex mx-6 mb-5 rounded-xl overflow-hidden border border-border">
          {(['signin', 'signup'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2 text-sm font-semibold transition-all duration-150"
              style={{
                background: tab === t ? '#0066FF' : 'transparent',
                color: tab === t ? '#fff' : 'hsl(var(--muted-foreground))',
              }}>
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name (optional)</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" required
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={8}
                className="w-full rounded-xl border border-border px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {tab === 'signup' && <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters</p>}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.3)' }}>
              <AlertCircle size={14} className="text-destructive flex-shrink-0 mt-0.5" />
              <span className="text-destructive">{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: '#0066FF', color: '#fff' }}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{tab === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      return (JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null') as AdminSession | null)?.user || null
    } catch {
      return null
    }
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Place Order', to: '/order' },
    { label: 'Drive With Us', to: '/drivers' },
  ]
  const isActive = (to: string) => location.pathname === to

  const handleAuthentication = (session: AdminSession) => {
    sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session))
    setUser(session.user)
    setAuthOpen(false)
  }

  const handleSignOut = () => {
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY)
    setUser(null)
    setUserMenuOpen(false)
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Account'

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={handleAuthentication} />}

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl"
        style={{ background: 'hsl(240 67% 4% / 0.85)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center pr-glow-blue transition-all duration-200 group-hover:scale-110">
              <Zap size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Pickup<span style={{ color: '#F5C400' }}>Runner</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(217 100% 50% / 0.2)', border: '1px solid hsl(217 100% 50% / 0.4)' }}>
                    <User size={14} className="text-primary" />
                  </div>
                  <span className="max-w-[100px] truncate">{displayName}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border overflow-hidden shadow-lg"
                    style={{ background: 'hsl(240 67% 6%)' }}>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <LogOut size={14} />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200">
                Sign In
              </button>
            )}
            <Link to="/order" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: '#F5C400', color: '#0A0A0F' }}>
              Order Now
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1">
                <LogOut size={14} />Sign Out ({displayName})
              </button>
            ) : (
              <button onClick={() => { setAuthOpen(true); setMobileOpen(false) }}
                className="px-4 py-3 rounded-lg text-sm font-semibold border border-border text-center text-muted-foreground hover:text-foreground transition-colors mt-1">
                Sign In / Create Account
              </button>
            )}
            <Link to="/order" onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-semibold text-center mt-2"
              style={{ background: '#F5C400', color: '#0A0A0F' }}>
              Order Now
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
