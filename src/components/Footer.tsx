import { Link } from '@tanstack/react-router'
import { BRAND_ICON } from '../lib/brand'
import { StoreButtons } from './StoreButtons'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={BRAND_ICON} alt="" width={32} height={32} className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-lg tracking-tight text-foreground">
                Pickup <span style={{ color: '#F5C400' }}>Runner</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Local pickup and delivery of prepaid items with Pickup Runner. Book in the app, see the price before you confirm and track your runner.
            </p>
            <StoreButtons className="mt-4" />
            <p className="text-sm text-muted-foreground mt-4">Operated by Pickup Runner LLC.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Service</h2>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Pickup Runner</Link></li>
              <li><Link to="/download" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Download the Official App</Link></li>
              <li><Link to="/" hash="how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/" hash="pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/" hash="coverage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coverage Area</Link></li>
              <li><Link to="/order" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Place an Order</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Drivers</h2>
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
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/delete-profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Delete Account</Link>
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
