const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export type Role = 'customer' | 'driver' | 'admin'
export type AccountStatus = 'active' | 'suspended'

export interface AdminUser {
  id: string
  email: string
  displayName: string
  phone: string | null
  role: Role
  status: AccountStatus
  createdAt: string
}

export interface AdminSession {
  accessToken: string
  refreshToken?: string
  user: AdminUser
}
  
interface ApiResponse<T> {
  message?: string
  error?: string
  errors?: string[]
  data: T
}

export interface SessionTokens {
  accessToken: string
  refreshToken?: string
}

let tokens: SessionTokens | null = null
let refreshing: Promise<string | null> | null = null
let expiredHandler: (() => void) | null = null
let refreshedHandler: ((next: SessionTokens) => void) | null = null

export const session = {
  set(next: SessionTokens | null) { tokens = next },
  accessToken() { return tokens?.accessToken ?? null },
  onExpired(handler: (() => void) | null) { expiredHandler = handler },
  onRefreshed(handler: ((next: SessionTokens) => void) | null) { refreshedHandler = handler },
}

async function refreshAccessToken(): Promise<string | null> {
  if (!tokens?.refreshToken) return null
  if (refreshing) return refreshing

  refreshing = (async () => {
    try {
      const response = await fetch(API_URL + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
      })

      if (!response.ok) return null

      const body = await response.json().catch(() => ({})) as ApiResponse<SessionTokens>
      if (!body.data?.accessToken) return null

      const next: SessionTokens = {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken ?? tokens?.refreshToken,
      }

      tokens = next
      refreshedHandler?.(next)
      return next.accessToken
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const send = (bearer?: string) =>
    fetch(API_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}),
        ...options.headers,
      },
    })

  const authed = Boolean(token)
  let response = await send(authed ? session.accessToken() ?? token : undefined)

  if (response.status === 401 && authed) {
    const fresh = await refreshAccessToken()

    if (fresh) {
      response = await send(fresh)
      if (response.status === 401) expiredHandler?.()
    } else {
      expiredHandler?.()
    }
  }

  const body = await response.json().catch(() => ({})) as ApiResponse<T>

  if (!response.ok) {
    const detail = body.errors?.length
      ? body.errors.join('. ')
      : body.error || body.message

    throw new Error(detail || 'Request failed')
  }

  return body.data
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AdminSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, displayName: string) =>
    request<AdminSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || undefined,
        role: 'customer',
      }),
    }),
}

export const usersApi = {
  list: (token: string, role?: Role) =>
    request<{ users: AdminUser[] }>(
      role ? '/users?role=' + role : '/users',
      {},
      token,
    ),
  updateRole: (token: string, userId: string, role: Role) =>
    request<unknown>(
      '/users/' + userId + '/role',
      { method: 'PATCH', body: JSON.stringify({ role }) },
      token,
    ),
  updateStatus: (token: string, userId: string, status: AccountStatus) =>
    request<unknown>(
      '/users/' + userId + '/status',
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token,
    ),
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

export const applicationsApi = {
  apply: (application: DriverApplicationPayload) =>
    request<DriverApplicationResult>('/applications', {
      method: 'POST',
      body: JSON.stringify({ ...application, source: 'website' }),
    }),
}

export type AccreditationStatus =
  | 'not_started' | 'in_progress' | 'under_review' | 'approved' | 'rejected'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type BackgroundStatus = 'not_started' | 'in_review' | 'approved' | 'rejected'

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
  status: AccountStatus
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
  location: { city: string; state: string | null } | null
  payouts: { stripeAccountId: string | null; stripeAccountMode: string | null; canBePaid: boolean }
  orders: { total: number; delivered: number; active: number; unsettled: number }
  totalEarnedCents: number | null
}

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })

  const suffix = query.toString()
  return suffix ? '?' + suffix : ''
}

export const adminApi = {
  orders: (token: string, params: { status?: string; search?: string; active?: string; limit?: number } = {}) =>
    request<Pagination & { orders: AdminOrder[] }>(
      '/admin/orders' + toQuery(params),
      {},
      token,
    ),
  customers: (token: string, params: { status?: string; search?: string; limit?: number } = {}) =>
    request<Pagination & { customers: AdminCustomer[] }>(
      '/admin/customers' + toQuery(params),
      {},
      token,
    ),
  drivers: (token: string, params: { status?: string; search?: string; accreditationStatus?: string; limit?: number } = {}) =>
    request<Pagination & { drivers: AdminDriver[] }>(
      '/admin/drivers' + toQuery(params),
      {},
      token,
    ),
}

export interface DriverReviewResult {
  profile: Partial<Accreditation>
  eligibility: { eligible: boolean; code: string; reason?: string }
}

export const driverReviewApi = {
  approve: (token: string, userId: string) =>
    request<DriverReviewResult>(
      '/admin/drivers/' + userId + '/approve',
      { method: 'PATCH' },
      token,
    ),
  reject: (token: string, userId: string, rejectionReason: string) =>
    request<DriverReviewResult>(
      '/admin/drivers/' + userId + '/reject',
      { method: 'PATCH', body: JSON.stringify({ rejectionReason }) },
      token,
    ),
}

export const accreditationsApi = {
  list: (token: string, params: { status?: string; search?: string; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.search) query.set('search', params.search)
    if (params.limit) query.set('limit', String(params.limit))

    const suffix = query.toString()
    return request<AccreditationPage>(
      '/admin/accreditations' + (suffix ? '?' + suffix : ''),
      {},
      token,
    )
  },
}
