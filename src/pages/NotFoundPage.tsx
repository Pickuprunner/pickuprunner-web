import { Link, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft, Car, ChevronRight, Compass, Home, MessageCircle, Package, PackageX,
} from 'lucide-react'

const BLUE = '#0066FF'
const YELLOW = '#F5C400'

const SUGGESTIONS = [
  { icon: Home, label: 'Home', desc: 'Start from the beginning', to: '/' as const },
  { icon: Package, label: 'Place Order', desc: 'How sending works', to: '/order' as const },
  { icon: Car, label: 'Drive With Us', desc: 'Apply to be a runner', to: '/drivers' as const },
  { icon: MessageCircle, label: 'Contact Us', desc: 'Tell us what you were after', to: '/contact' as const },
]

export function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pt-16 flex items-center">
      <section className="relative w-full py-20 overflow-hidden">
        <div className="absolute inset-0 pr-grid-bg opacity-30" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.1) 0%, transparent 65%)', transform: 'translate(-50%,-30%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'hsl(217 100% 50% / 0.12)', border: '1px solid hsl(217 100% 50% / 0.3)' }}
          >
            <PackageX size={30} className="text-primary" />
          </div>

          <p
            className="text-[5rem] sm:text-[7rem] font-bold leading-none mb-2 tracking-tight"
            style={{ color: YELLOW }}
          >
            404
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            This one never arrived.
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
            We could not find that page. It may have moved, or the link that brought you here might be out of date.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: BLUE, color: '#fff', boxShadow: '0 8px 24px -6px hsl(217 100% 50% / 0.55)' }}
            >
              <Home size={16} />Back to home
            </Link>

            <button
              type="button"
              onClick={() => router.history.back()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted transition-all duration-200"
            >
              <ArrowLeft size={16} />Go back
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="h-px flex-1 bg-border" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Compass size={12} />Try one of these
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {SUGGESTIONS.map(({ icon: Icon, label, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                style={{ background: 'hsl(237 40% 6%)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(217 100% 50% / 0.12)' }}
                >
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{desc}</p>
                </div>
                <ChevronRight
                  size={15}
                  className="text-muted-foreground/50 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
