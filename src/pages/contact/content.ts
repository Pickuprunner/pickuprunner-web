import { Car, Package, Trash2 } from 'lucide-react'

export const SUBJECTS = [
  'Driving with us',
  'A delivery went wrong',
  'Billing and receipts',
  'Privacy and your data',
  'Coverage in your area',
  'Business and partnerships',
  'Something else',
]

export const SELF_SERVE = [
  { icon: Package, label: 'How ordering works', to: '/order' as const },
  { icon: Car, label: 'Apply to drive', to: '/drivers' as const },
  { icon: Trash2, label: 'Delete your account', to: '/delete-profile' as const },
]
