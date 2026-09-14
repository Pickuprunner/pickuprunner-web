
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

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

export async function send<B>(path: string, options: RequestInit = {}, token?: string): Promise<B> {
  const go = (bearer?: string) =>
    fetch(API_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}),
        ...options.headers,
      },
    })

  const authed = Boolean(token)
  let response = await go(authed ? session.accessToken() ?? token : undefined)

  if (response.status === 401 && authed) {
    const fresh = await refreshAccessToken()

    if (fresh) {
      response = await go(fresh)
      if (response.status === 401) expiredHandler?.()
    } else {
      expiredHandler?.()
    }
  }

  const body = await response.json().catch(() => ({})) as ApiResponse<unknown>

  if (!response.ok) {
    const detail = body.errors?.length
      ? body.errors.join('. ')
      : body.error || body.message

    throw new Error(detail || 'Request failed')
  }

  return body as B
}

/** The usual case: the backend wraps the payload as `{ data }`. */
export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const body = await send<ApiResponse<T>>(path, options, token)
  return body.data
}

export const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })

  const suffix = query.toString()
  return suffix ? '?' + suffix : ''
}
