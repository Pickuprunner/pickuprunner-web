
import { request } from './client'
import type { AccountStatus, AdminAccount, AdminSession, AdminUser, Role } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    request<AdminSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
}

export const usersApi = {
  list: (token: string, role?: Role) =>
    request<{ users: AdminUser[] }>(
      role ? '/users?role=' + role : '/users',
      {},
      token,
    ),
  get: (token: string, userId: string) =>
    request<{ user: AdminAccount }>(
      '/users/' + encodeURIComponent(userId),
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
  deleteCustomer: (token: string, userId: string) =>
    request<{ userId: string }>(
      '/admin/customers/' + encodeURIComponent(userId),
      { method: 'DELETE' },
      token,
    ),
  deleteDriver: (token: string, userId: string) =>
    request<{ userId: string }>(
      '/admin/drivers/' + encodeURIComponent(userId),
      { method: 'DELETE' },
      token,
    ),
}
