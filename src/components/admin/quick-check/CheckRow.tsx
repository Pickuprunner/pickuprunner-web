
import { CheckCircle2, XCircle } from 'lucide-react'
import { type AccreditationDetail, type DriverDocumentType } from '../../../lib/api'

export const PHOTOS: { type: DriverDocumentType; key: keyof AccreditationDetail['documents']; label: string }[] = [
  { type: 'license_front', key: 'licenseFront', label: 'Licence — front' },
  { type: 'license_back', key: 'licenseBack', label: 'Licence — back' },
  { type: 'insurance_card', key: 'insuranceCard', label: 'Insurance card' },
]

type Mark = 'ok' | 'bad' | undefined

export const DIALOG_BACKGROUND = 'hsl(237 40% 8%)'

export function CheckRow({ label, value, sub, mark }: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  mark?: Mark
}) {
  return (
    <div className="flex items-start gap-2 px-3.5 py-2.5" style={{ background: DIALOG_BACKGROUND }}>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value || '—'}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {mark === 'ok' && <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: '#22C55E' }} aria-label="Looks fine" />}
      {mark === 'bad' && <XCircle size={18} className="flex-shrink-0" style={{ color: '#EF4444' }} aria-label="Problem" />}
    </div>
  )
}

export const join = (parts: (string | number | null | undefined)[], separator = ' · ') =>
  parts.filter((part) => part !== null && part !== undefined && part !== '').join(separator)
