
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AdminUser } from '../../../lib/api'

export interface AdminContextValue {
  token: string
  user: AdminUser
  registerReload: (reload: (() => void) | null) => void
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside the admin layout')
  return value
}

export function useRegisterReload(reload: () => void) {
  const { registerReload } = useAdmin()

  useEffect(() => {
    registerReload(reload)
    return () => registerReload(null)
  }, [registerReload, reload])
}

export function useAdminData<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)

  const run = useCallback(async () => {
    const id = ++request.current

    setLoading(true)
    setError('')

    try {
      const result = await load()
      if (request.current === id) setData(result)
    } catch (err) {
      if (request.current === id) {
        setError(err instanceof Error ? err.message : 'Could not load that.')
      }
    } finally {
      if (request.current === id) setLoading(false)
    }
  }, deps)

  useEffect(() => {
    run()
    const pending = request
    return () => { pending.current++ }
  }, [run])

  return { data, loading, error, reload: run }
}

export function useDebounced<T>(value: T, delay = 350) {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return settled
}
