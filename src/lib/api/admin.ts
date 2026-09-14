
import { request, send, toQuery } from './client'
import type { AccreditationDetail, AccreditationPage, AccreditationProfile, AdminCustomer, AdminCustomerDetail, AdminDriver, AdminDriverDetail, AdminOrder, AdminOrderDetail, AdminOrderQuery, ChatPage, DriverDocumentType, DriverReviewResult, ItemDecision, Pagination } from './types'

export const adminApi = {
  orders: (token: string, params: AdminOrderQuery = {}) =>
    request<Pagination & { orders: AdminOrder[] }>(
      '/admin/orders' + toQuery(params),
      {},
      token,
    ),
  order: (token: string, id: string) =>
    request<AdminOrderDetail>('/admin/orders/' + encodeURIComponent(id), {}, token),
  customer: (token: string, id: string) =>
    request<AdminCustomerDetail>('/admin/customers/' + encodeURIComponent(id), {}, token),
  driver: (token: string, id: string) =>
    request<AdminDriverDetail>('/admin/drivers/' + encodeURIComponent(id), {}, token),
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

export const deliveryApi = {
  photo: (token: string, orderId: string) =>
    send<{ orderId: string; url: string; expiresInSeconds: number }>(
      '/delivery-photo/' + encodeURIComponent(orderId),
      {},
      token,
    ),
}

export const chatApi = {
  messages: (token: string, orderId: string, before?: string) =>
    request<ChatPage>(
      '/orders/' + encodeURIComponent(orderId) + '/messages' +
        toQuery({ limit: 50, before }),
      {},
      token,
    ),
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
  get: (token: string, userId: string) =>
    request<AccreditationDetail>(
      '/admin/accreditations/' + encodeURIComponent(userId),
      {},
      token,
    ),
  review: (token: string, userId: string, decision: ItemDecision) =>
    request<{ profile: AccreditationProfile }>(
      '/admin/accreditations/' + encodeURIComponent(userId),
      { method: 'PATCH', body: JSON.stringify(decision) },
      token,
    ),
  document: (token: string, userId: string, type: DriverDocumentType) =>
    request<{ type: DriverDocumentType; url: string; expiresInSeconds: number }>(
      '/driver/accreditation/documents/' + type + '?userId=' + encodeURIComponent(userId),
      {},
      token,
    ),
}
