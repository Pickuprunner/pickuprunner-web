
import { useCallback, useState } from 'react'
import { AlertCircle, Check, ExternalLink, MapPin } from 'lucide-react'
import { type AccreditationProfile } from '../../../lib/api'
import { Card, ErrorLine, Spinner, day, mapsUrl, useRegisterReload } from '../ui'
import { ageFrom } from '../quick-check'

export function useScreenRefresh(reload: () => void) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => {
    reload()
    setVersion((v) => v + 1)
  }, [reload])
  useRegisterReload(refresh)
  return version
}

export function DetailState({ loading, error, found, children }: {
  loading: boolean
  error: string
  found: boolean
  children: React.ReactNode
}) {
  if (loading && !found) return <Spinner />

  if (!found) {
    return (
      <Card>
        <div className="py-10 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">{error || 'Not found'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the link, or go back to the list.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <ErrorLine message={error} />
      <div className="space-y-4">{children}</div>
    </>
  )
}

export function StatsRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{children}</div>
}

export function Contact({ account }: { account: { email?: string | null; phone?: string | null } }) {
  return <>{[account.email, account.phone].filter(Boolean).join(' · ') || 'No contact details'}</>
}

export function MapLink({ lat, lng, label = 'Open in Maps' }: {
  lat?: number | string | null
  lng?: number | string | null
  label?: string
}) {
  const href = mapsUrl(lat, lng)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
    >
      <MapPin size={12} />{label}<ExternalLink size={10} />
    </a>
  )
}

export const EXPIRED_RED = '#EF4444'

export const withAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null
  const age = ageFrom(dateOfBirth)
  return age === null ? day(dateOfBirth) : `${day(dateOfBirth)} (age ${age})`
}

export function OnOff({ on, warn, text }: { on: boolean; warn?: boolean; text: string }) {
  const color = on ? '#22C55E' : warn ? '#F5C400' : '#8891A8'
  return (
    <span className="inline-flex items-center gap-2" style={{ color }}>
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}

export const vehicleLine = (profile: AccreditationProfile) =>
  [profile.vehicleYear, profile.vehicleColor, profile.vehicleMake, profile.vehicleModel]
    .filter(Boolean)
    .join(' ') || null
