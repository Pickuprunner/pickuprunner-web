import { Link } from '@tanstack/react-router'
import { Zap, Share2, Camera } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center pr-glow-blue">
                <Zap size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Pickup<span style={{ color: '#F5C400' }}>Runner</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Hyper-local grocery and pharmacy delivery. Fast, transparent, and trusted with 100% background-checked drivers.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"><Share2 size={16} /></a>
              <a href="#" className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"><Camera size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Service</h4>
            <ul className="space-y-2">
              <li><Link to="/" hash="how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/" hash="pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/" hash="coverage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coverage Area</Link></li>
              <li><Link to="/order" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Place an Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Drivers</h4>
            <ul className="space-y-2">
              <li><Link to="/drivers" hash="apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Driver</Link></li>
              <li><Link to="/drivers" hash="requirements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Requirements</Link></li>
              <li><Link to="/drivers" hash="apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Earnings</Link></li>
              <li><Link to="/drivers" hash="requirements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Background Check</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Pickup Runner. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            {/* <Link to="/delete-profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Delete Account</Link> */}
            <a href="mailto:pickuprunner13@gmail.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
