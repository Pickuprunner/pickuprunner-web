import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X, Zap } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Place Order', to: '/order' },
    { label: 'Drive With Us', to: '/drivers' },
    { label: 'Contact Us', to: '/contact' },
  ]
  const isActive = (to: string) => location.pathname === to

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl"
      style={{ background: 'hsl(240 67% 4% / 0.85)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center pr-glow-blue transition-all duration-200 group-hover:scale-110">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Pickup <span style={{ color: '#F5C400' }}>Runner</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
