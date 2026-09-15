
export type Role = 'customer' | 'driver' | 'admin'

export type AccountStatus = 'active' | 'suspended'

export interface AdminUser {
  id: string
  email: string
  displayName: string
  phone: string | null
  photoUrl?: string | null
  role: Role
  status: AccountStatus
  createdAt: string
}

export interface AdminSession {
  accessToken: string
  refreshToken?: string
  user: AdminUser
}

export interface DriverApplicationPayload {
  legalName: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  password?: string
  phone?: string
  dateOfBirth?: string
  streetAddress?: string
  aptSuite?: string
  postalCode?: string
  serviceArea?: string
  city?: string
  state?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  vehicleColor?: string
  vehiclePlate?: string
  vehicleVin?: string
  licenseState?: string
  licenseNumber?: string
  licenseExpirationDate?: string
  insuranceCompany?: string
  insuranceNaicNumber?: string
  insurancePolicyNumber?: string
  insuranceEffectiveDate?: string
  insuranceExpirationDate?: string
  hasLicenseAndInsurance?: boolean
  cleanDrivingRecord?: boolean
  backgroundCheckConsent?: boolean
}

export interface DriverApplicationResult {
  user: AdminUser
  missing: string[]
  submitted: boolean
  accountClaimed: boolean
}

export interface ContactEnquiry {
  name: string
  email: string
  topic: string
  message: string
}

export type AccreditationStatus =
  | 'not_started' | 'in_progress' | 'under_review' | 'approved' | 'rejected'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type BackgroundStatus = 'not_started' | 'in_review' | 'approved' | 'rejected'
export interface CredentialWindow {
  expirationDate: string | null
  expired: boolean
  daysLeft: number | null
  expiringSoon: boolean
}

export interface CredentialExpiry {
  license: CredentialWindow
  insurance: CredentialWindow
  anyExpired: boolean
}

export interface AccreditationUser {
  id: string
  email: string
  displayName: string | null
  phone: string | null
  status: AccountStatus
  createdAt: string
}

export interface Accreditation {
  userId: string
  legalName: string | null
  city: string | null
  state: string | null
  serviceArea: string | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleYear: number | null
  vehiclePlate: string | null
  accreditationStatus: AccreditationStatus
  licenseStatus: ReviewStatus
  insuranceStatus: ReviewStatus
  backgroundStatus: BackgroundStatus
  licenseExpirationDate: string | null
  insuranceExpirationDate: string | null
  hasLicenseAndInsurance: boolean | null
  cleanDrivingRecord: boolean | null
  rejectionReason: string | null
  applicationSource: string | null
  submittedAt: string | null
  reviewedAt: string | null
  createdAt: string
  isSubmitted: boolean
  documents: { licenseFront: boolean; licenseBack: boolean; insuranceCard: boolean }
  user: AccreditationUser
  eligibility: { eligible: boolean; code: string; reason?: string }
  expiry: CredentialExpiry | null
  missing: string[]
}

export interface Pagination {
  total: number
  limit: number
  offset: number
  page: number
  totalPages: number
  hasMore: boolean
}

export type AccreditationPage = Pagination & { accreditations: Accreditation[] }

export type OrderStatus =
  | 'pending' | 'assigned' | 'accepted' | 'shopping'
  | 'picked_up' | 'en_route' | 'delivered' | 'cancelled'

export type PaymentStatus =
  | 'unpaid' | 'link_sent' | 'paid' | 'test_paid' | 'failed' | 'refunded'

export interface OrderParty {
  id: string
  email: string
  displayName: string | null
  phone: string | null
  photoUrl?: string | null
  status: AccountStatus
  deletedAt?: string | null
}

export interface AdminOrder {
  id: string
  ref: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMode: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  driverName: string | null
  driverUserId: string | null
  pickupAddress: string | null
  deliveryAddress: string | null
  items: string | null
  distanceMiles: number | string | null
  tipAmount: number | string | null
  amountCents: number | null
  deliveryPhotoUrl: string | null
  deliveredAt: string | null
  createdAt: string
  settled: boolean
  earnings: { payoutCents: number | null; mileageCents: number | null; tipCents: number | null }
  driver: OrderParty | null
  customer: OrderParty | null
}

export interface AdminCustomer {
  id: string
  email: string
  displayName: string | null
  phone: string | null
  photoUrl?: string | null
  status: AccountStatus
  emailVerified: boolean
  createdAt: string
  lastSignIn: string | null
  orders: { total: number; delivered: number; active: number; lastOrderAt: string | null }
  totalSpentCents: number | null
}

export interface AdminDriver {
  id: string
  email: string
  displayName: string | null
  phone: string | null
  photoUrl?: string | null
  isAvailable?: boolean
  status: AccountStatus
  createdAt: string
  lastSignIn: string | null
  accreditation: {
    status: AccreditationStatus | null
    license: ReviewStatus | null
    insurance: ReviewStatus | null
    background: BackgroundStatus | null
    submittedAt: string | null
    reviewedAt: string | null
  }
  eligibility: { eligible: boolean; code: string; reason?: string }
  vehicle: { make: string; model: string; plate: string | null } | null
  expiry: CredentialExpiry | null
  location: { city: string; state: string | null } | null
  payouts: { stripeAccountId: string | null; stripeAccountMode: string | null; canBePaid: boolean }
  orders: { total: number; delivered: number; active: number; unsettled: number }
  totalEarnedCents: number | null
}

export interface AdminAccount {
  id: string
  email: string | null
  displayName: string | null
  phone: string | null
  photoUrl: string | null
  role: Role
  status: AccountStatus
  isAvailable: boolean
  emailVerified: boolean
  stripeAccountId: string | null
  stripeAccountMode: 'live' | 'test' | null
  lastSignIn: string | null
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown> | null
  deletedAt?: string | null
}

export interface AdminOrderFull extends Omit<AdminOrder, 'items' | 'earnings' | 'driver' | 'customer'> {
  items: unknown
  customerId: string | null
  cityId: string | null
  storeId: string | null
  orderScope: string | null
  customerSessionId: string | null
  pickupLat: number | string | null
  pickupLng: number | string | null
  ageVerified: boolean | null
  ageVerifiedAt: string | null
  deliveryNotifiedAt: string | null
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  platformFeeCents: number | null
  driverStripeAccountId: string | null
  driverTransferId: string | null
  driverEarningsCents: number | null
  updatedAt: string
  earnings: {
    payoutCents: number | null
    mileageCents: number | null
    tipCents: number | null
    platformCents?: number | null
  }
}

export interface AdminOrderDetail {
  order: AdminOrderFull
  driver: AdminAccount | null
  customer: AdminAccount | null
}

export interface AdminOrderSummary {
  id: string
  ref: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  amountCents: number | null
  deliveryAddress: string | null
  driverName: string | null
  customerName: string | null
  createdAt: string
  deliveredAt: string | null
  settled: boolean
}

export interface AdminCustomerDetail {
  customer: AdminAccount
  stats: {
    orders: { total: number; delivered: number; cancelled: number; active: number }
    totalSpentCents: number
    totalTipsCents: number
    firstOrderAt: string | null
    lastOrderAt: string | null
  }
  recentOrders: AdminOrderSummary[]
}

export interface AdminDriverDetail {
  driver: AdminAccount
  accreditation: AccreditationProfile | null
  eligibility: { eligible: boolean; code: string; reason?: string }
  expiry: CredentialExpiry | null
  missing: string[] | null
  payouts: {
    stripeAccountId: string | null
    stripeAccountMode: string | null
    canBePaid: boolean
    unsettledDeliveries: number
  }
  stats: {
    orders: { total: number; delivered: number; cancelled: number; active: number }
    totalEarnedCents: number
    paidOutCents?: number
    owedCents?: number
    lastDeliveryAt: string | null
  }
  recentOrders: AdminOrderSummary[]
  presence?: DriverPresence
}

export interface DriverPresence {
  available: boolean
  lat: number | null
  lng: number | null
  locationAt: string | null
  locationAgeSeconds: number | null
  locationFresh: boolean
  reachable: boolean
  lastSeenAt: string | null
  currentOrderId: string | null
}

export type AdminOrderQuery = {
  status?: string
  search?: string
  active?: string
  customerId?: string
  driverUserId?: string
  limit?: number
  page?: number
}

export interface ChatMessage {
  id: string
  orderId: string
  senderRole: 'customer' | 'driver' | 'admin'
  kind: 'text' | 'system'
  body: string
  statusEvent: string | null
  readAt: string | null
  createdAt: string
  isSystem: boolean
}

export interface ChatPage {
  orderId: string
  chat: { open: boolean; orderStatus: OrderStatus; closedReason: string | null }
  messages: ChatMessage[]
  oldestCursor: string | null
  hasOlder: boolean
}

export interface DriverReviewResult {
  profile: Partial<Accreditation>
  eligibility: { eligible: boolean; code: string; reason?: string }
}

export type DriverDocumentType = 'license_front' | 'license_back' | 'insurance_card'

export interface ItemDecision {
  licenseStatus?: ReviewStatus
  insuranceStatus?: ReviewStatus
  backgroundStatus?: BackgroundStatus
  rejectionReason?: string
}

export interface AccreditationProfile {
  userId: string
  legalName: string | null
  dateOfBirth: string | null
  streetAddress: string | null
  aptSuite: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  serviceArea: string | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleYear: number | null
  vehicleColor: string | null
  vehiclePlate: string | null
  vehicleVin: string | null
  licenseState: string | null
  licenseNumber: string | null
  licenseExpirationDate: string | null
  licenseStatus: ReviewStatus
  insuranceCompany: string | null
  insuranceNaicNumber: string | null
  insurancePolicyNumber: string | null
  insuranceEffectiveDate: string | null
  insuranceExpirationDate: string | null
  insuranceStatus: ReviewStatus
  backgroundStatus: BackgroundStatus
  backgroundConsentAt: string | null
  backgroundConsentIp?: string | null
  backgroundDisclosureVersion?: string | null
  backgroundReviewedAt: string | null
  backgroundNotes: string | null
  hasSsnLast4: boolean
  /**
   * The four digits the driver gave for the background check, or null. What the
   * admin running the screening types into the provider's form.
   */
  ssnLast4: string | null
  hasLicenseAndInsurance: boolean | null
  cleanDrivingRecord: boolean | null
  attestedAt?: string | null
  accreditationStatus: AccreditationStatus
  reviewedBy?: string | null
  rejectionReason: string | null
  applicationSource: string | null
  submittedAt: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  isSubmitted: boolean
  documents: { licenseFront: boolean; licenseBack: boolean; insuranceCard: boolean }
}

export interface AccreditationDetail extends AccreditationProfile {
  user: { id: string; email: string | null; displayName: string | null; phone: string | null; stripeAccountId: string | null }
  eligibility: { eligible: boolean; code: string; reason?: string }
  expiry: CredentialExpiry | null
  missing: string[]
}
