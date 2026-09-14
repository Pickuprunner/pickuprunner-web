
import { Car, ClipboardList, Package, User, Users } from 'lucide-react'

export const ADMIN_RADII = {
  '--radius-sm': '0.25rem',
  '--radius-md': '0.375rem',
  '--radius-lg': '0.5rem',
  '--radius-xl': '0.75rem',
  '--radius-full': '9999px',
} as React.CSSProperties

export const TABS = [
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: User },
  { to: '/admin/drivers', label: 'Drivers', icon: Car },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/accounts', label: 'Accounts', icon: Users },
] as const

export const SESSION_KEY = 'pickuprunner_admin_session'
