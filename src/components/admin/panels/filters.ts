export const ORDER_STATUSES = [
  'all', 'pending', 'assigned', 'accepted', 'shopping', 'picked_up', 'en_route', 'delivered', 'cancelled',
] as const

export type OrderFilter = (typeof ORDER_STATUSES)[number]

export const APPLICATION_STATUSES = [
  'all', 'in_progress', 'under_review', 'renewal', 'expiring', 'expired', 'approved', 'rejected',
] as const

export type ApplicationFilter = (typeof APPLICATION_STATUSES)[number]

export const DERIVED_FILTERS = ['renewal', 'expiring', 'expired'] as const

export type DerivedFilter = (typeof DERIVED_FILTERS)[number]

export const isDerivedFilter = (value: string): value is DerivedFilter =>
  (DERIVED_FILTERS as readonly string[]).includes(value)

export const FILTER_LABELS: Record<string, string> = {
  renewal: 'Document renewal',
  expiring: 'Expiring soon',
  expired: 'Expired',
}

export const DRIVER_VIEWS = ['all', 'renewal', 'expiring', 'expired'] as const

export type DriverView = (typeof DRIVER_VIEWS)[number]

export const ACCOUNT_ROLES = ['all', 'customer', 'driver', 'admin'] as const

export type AccountFilter = (typeof ACCOUNT_ROLES)[number]
