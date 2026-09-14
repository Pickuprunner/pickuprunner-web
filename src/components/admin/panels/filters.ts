export const ORDER_STATUSES = [
  'all', 'pending', 'assigned', 'accepted', 'shopping', 'picked_up', 'en_route', 'delivered', 'cancelled',
] as const

export type OrderFilter = (typeof ORDER_STATUSES)[number]

export const APPLICATION_STATUSES = [
  'all', 'in_progress', 'under_review', 'approved', 'rejected',
] as const

export type ApplicationFilter = (typeof APPLICATION_STATUSES)[number]

export const ACCOUNT_ROLES = ['all', 'customer', 'driver', 'admin'] as const

export type AccountFilter = (typeof ACCOUNT_ROLES)[number]
