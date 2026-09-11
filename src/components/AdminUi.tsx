import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createLink, Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, ChevronRight, ExternalLink, FileText, ImageOff, Inbox, Loader2, RefreshCw, Search, X } from 'lucide-react'

import type { AdminUser } from '../lib/api'

// ── Session context ─────────────────────────────────────────────────────────
// AdminPage owns the session and renders every /admin/* route inside this
// provider, so panels and detail screens read the token from here instead of
// having it threaded through props.

export interface AdminContextValue {
  token: string
  user: AdminUser
  /** Lets the mounted screen tell the header's Refresh button what to reload. */
  registerReload: (reload: (() => void) | null) => void
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside the admin layout')
  return value
}

/** Point the header's Refresh button at `reload` while this screen is mounted. */
export function useRegisterReload(reload: () => void) {
  const { registerReload } = useAdmin()

  useEffect(() => {
    registerReload(reload)
    return () => registerReload(null)
  }, [registerReload, reload])
}

// ── Formatting ──────────────────────────────────────────────────────────────

export const money = (cents?: number | null) =>
  typeof cents === 'number' ? '$' + (cents / 100).toFixed(2) : '—'

export const decimal = (value?: number | string | null) => {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export const day = (value?: string | null) => {
  if (!value) return '—'
  // A plain date ("2028-09-01" — expiry, date of birth) is a calendar day. Read
  // as UTC midnight it shows the day before for anyone west of UTC, e.g. in AZ.
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return (plain ? new Date(+plain[1], +plain[2] - 1, +plain[3]) : new Date(value)).toLocaleDateString()
}

export const dateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—'

export const humanise = (value: string) => value.replace(/_/g, ' ')

export const yesNo = (value?: boolean | null) =>
  value === true ? 'Yes' : value === false ? 'No' : '—'

/**
 * `items` is JSONB on the order, so it arrives as whatever the app sent: a
 * string, a list of strings, or a list of `{ name, qty }` objects. Rendering it
 * raw throws as soon as it is an object.
 */
export function itemLines(items: unknown): string[] {
  if (items == null || items === '') return []
  if (typeof items === 'string') return [items]
  if (typeof items === 'number' || typeof items === 'boolean') return [String(items)]

  if (Array.isArray(items)) {
    return items.flatMap((item) => {
      if (item == null) return []
      if (typeof item !== 'object') return [String(item)]

      const entry = item as Record<string, unknown>
      const name = entry.name ?? entry.title ?? entry.item ?? entry.description
      const qty = entry.qty ?? entry.quantity

      if (name == null) return [JSON.stringify(item)]
      return [qty != null && qty !== '' ? `${qty} × ${String(name)}` : String(name)]
    })
  }

  return [JSON.stringify(items)]
}

/** "3 min ago" for recent times, a date for older ones. */
export const timeAgo = (value?: string | null) => {
  if (!value) return '—'
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  return dateTime(value)
}

/** A Google Maps link for a coordinate pair, or null when either half is missing. */
export const mapsUrl = (lat?: number | string | null, lng?: number | string | null) => {
  const a = decimal(lat)
  const b = decimal(lng)
  return a !== null && b !== null ? `https://www.google.com/maps?q=${a},${b}` : null
}

/** Only http(s) links are rendered as links — never javascript: or data:. */
export const safeHttpUrl = (value?: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

// ── Badges & small pieces ───────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  approved: '#22C55E',
  delivered: '#22C55E',
  paid: '#22C55E',
  test_paid: '#22C55E',
  active: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#EF4444',
  failed: '#EF4444',
  suspended: '#EF4444',
  under_review: '#F5C400',
  in_review: '#F5C400',
  pending: '#F5C400',
  unpaid: '#F5C400',
  link_sent: '#F5C400',
  refunded: '#F5C400',
  in_progress: '#6699FF',
  assigned: '#6699FF',
  accepted: '#6699FF',
  picked_up: '#6699FF',
  en_route: '#6699FF',
  shopping: '#6699FF',
  not_started: '#8891A8',
  verified: '#22C55E',
  unverified: '#F5C400',
  on_duty: '#22C55E',
  off_duty: '#8891A8',
  you: '#6699FF',
  deleted: '#EF4444',
}

export function StatusBadge({ label, value }: { label?: string; value?: string | null }) {
  if (!value) return null

  const color = STATUS_COLORS[value] || '#8891A8'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap"
      style={{ background: `${color}1F`, color }}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: color }} />
      {label && <span className="opacity-70 font-medium">{label}</span>}
      {humanise(value)}
    </span>
  )
}

export function Detail({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
      {icon && <span className="flex-shrink-0 opacity-70">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  )
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

export const CARD_BACKGROUND = 'hsl(237 40% 6%)'

export function Card({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <article
      id={id}
      className="rounded-2xl border border-border p-4 sm:p-5 scroll-mt-24"
      style={{ background: CARD_BACKGROUND }}
    >
      {children}
    </article>
  )
}

/** A list card that opens a detail screen. Must not contain other links or buttons. */
const CardAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function CardAnchor({ className, style, ...props }, ref) {
    return (
      <a
        ref={ref}
        {...props}
        className={
          'group block rounded-2xl border border-border p-4 sm:p-5 transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60' +
          (className ? ' ' + className : '')
        }
        style={{ background: CARD_BACKGROUND, ...style }}
      />
    )
  },
)

export const CardLink = createLink(CardAnchor)

export function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'hsl(217 100% 50% / 0.15)' }}
    >
      {children}
    </div>
  )
}

export function ViewHint() {
  return (
    <ChevronRight
      size={18}
      className="hidden sm:block flex-shrink-0 text-muted-foreground opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
    />
  )
}

// ── List screens ────────────────────────────────────────────────────────────

export function FilterRow<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (next: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors"
          style={{
            background: value === option ? 'hsl(217 100% 50% / 0.15)' : CARD_BACKGROUND,
            borderColor: value === option ? 'hsl(217 100% 50% / 0.4)' : 'hsl(var(--border))',
            color: value === option ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
          }}
        >
          {option === 'all' ? 'All' : humanise(option)}
        </button>
      ))}
    </div>
  )
}

/**
 * A search input whose committed value lives in the URL. Typing updates the box
 * at once and commits after a pause, so the back button restores the search.
 */
export function SearchBox({ value, onCommit, placeholder }: {
  value: string; onCommit: (v: string) => void; placeholder: string
}) {
  const [draft, setDraft] = useState(value)
  const settled = useDebounced(draft)

  // Follow the URL when it changes underneath us (back/forward).
  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (settled.trim() !== value) onCommit(settled.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled])

  return (
    <div className="relative flex-1 min-w-[12rem]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export function ErrorLine({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="mb-4 text-sm text-destructive flex items-center gap-1.5">
      <AlertCircle size={15} />
      {message}
    </p>
  )
}

export function PanelState({ loading, error, empty, emptyLabel, emptyHint, children }: {
  loading: boolean
  error: string
  empty: boolean
  emptyLabel: string
  emptyHint?: string
  children: React.ReactNode
}) {
  return (
    <>
      <ErrorLine message={error} />

      {loading ? (
        <Spinner />
      ) : empty ? (
        <div
          className="text-center py-20 rounded-2xl border border-border"
          style={{ background: CARD_BACKGROUND }}
        >
          <Inbox size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-foreground font-medium">{emptyLabel}</p>
          {emptyHint && <p className="text-xs text-muted-foreground mt-1">{emptyHint}</p>}
        </div>
      ) : (
        children
      )}
    </>
  )
}

/**
 * Load something for the current screen. Re-runs when `deps` change (and when
 * the header's Refresh button calls `reload`), ignores responses that arrive
 * after a newer request, and keeps the last data while refreshing so the
 * screen doesn't flash empty.
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    // A request still in flight when the screen unmounts is simply ignored.
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

export function Total({ shown, total }: { shown: number; total?: number }) {
  return (
    <p className="text-xs text-muted-foreground mb-3">
      Showing {shown}{typeof total === 'number' ? ` of ${total}` : ''}
    </p>
  )
}

// ── Detail screens ──────────────────────────────────────────────────────────

/**
 * Back to the list. Uses browser history when we came from inside the app, so
 * the list keeps its filters and search; falls back to a plain link when the
 * detail URL was opened directly.
 */
export function BackLink({ to, label }: { to: string; label: string }) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <Link
      to={to}
      onClick={(event) => {
        if (canGoBack) {
          event.preventDefault()
          router.history.back()
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft size={14} />
      {label}
    </Link>
  )
}

export function DetailHeader({ icon, media, title, subtitle, badges, aside, footer, bare = false }: {
  /** A small icon, shown in the round bubble. */
  icon?: React.ReactNode
  /** Or something larger shown as-is, e.g. a profile photo. */
  media?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  badges?: React.ReactNode
  aside?: React.ReactNode
  /** A row under a divider, inside the same card — e.g. the Approve / Reject buttons. */
  footer?: React.ReactNode
  /** No card around it — sits on the page, for the two-column detail layout. */
  bare?: boolean
}) {
  const body = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {media ?? <IconBubble>{icon}</IconBubble>}

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground break-words">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 break-words">{subtitle}</p>}
          {badges && <div className="flex flex-wrap gap-1.5 mt-3">{badges}</div>}
        </div>

        {aside && <div className="sm:text-right flex-shrink-0">{aside}</div>}
      </div>
      {footer && <div className={bare ? 'mt-5' : 'mt-4 pt-4 border-t border-border'}>{footer}</div>}
    </>
  )

  return bare ? <header className="px-1 pb-2">{body}</header> : <Card>{body}</Card>
}

/**
 * One card holding several sections split by thin lines — used instead of a
 * separate card per section, so a long page doesn't turn into a stack of boxes.
 */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <div className="divide-y divide-border [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
        {children}
      </div>
    </Card>
  )
}

/** A titled part of a Panel. */
export function PanelSection({ title, action, id, children }: {
  title: string
  action?: React.ReactNode
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Section({ title, action, children, id }: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  /** Lets other parts of the page scroll to this section. */
  id?: string
}) {
  return (
    <Card id={id}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function Fields({ children, single = false }: { children: React.ReactNode; single?: boolean }) {
  return (
    // In one column, a "wide" field must not span two — that would add a second column.
    <dl className={`grid grid-cols-1 ${single ? '[&>*]:!col-span-1' : 'sm:grid-cols-2'} gap-x-6 gap-y-3.5 content-start`}>
      {children}
    </dl>
  )
}

export function Field({ label, value, mono, wide }: {
  label: string
  value: React.ReactNode
  mono?: boolean
  wide?: boolean
}) {
  const empty = value === null || value === undefined || value === ''

  return (
    <div className={'min-w-0' + (wide ? ' sm:col-span-2' : '')}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={
          'text-sm text-foreground mt-0.5 break-words' + (mono ? ' font-mono text-xs' : '')
        }
      >
        {empty ? <span className="text-muted-foreground">—</span> : value}
      </dd>
    </div>
  )
}

const TextAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function TextAnchor({ className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        {...props}
        className={
          'inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline' +
          (className ? ' ' + className : '')
        }
      >
        {children}
        <ChevronRight size={12} />
      </a>
    )
  },
)

/** A small "View … ›" link to another admin screen. */
export const TextLink = createLink(TextAnchor)

// ── Images ──────────────────────────────────────────────────────────────────

/** Full-screen view of one image. Esc or a click outside closes it. */
export function ImageViewer({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3 text-white" onClick={(event) => event.stopPropagation()}>
        <p className="text-sm font-semibold truncate">{title}</p>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
          >
            <ExternalLink size={12} />Open original
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-white/30 p-1.5 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center pt-4">
        <img
          src={src}
          alt={title}
          className="max-h-full max-w-full object-contain rounded-lg"
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  )
}

const initials = (name?: string | null) =>
  (name || '?')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'

/**
 * A person's profile photo (public URL), or their initials when there is none
 * or it fails to load. `zoom` lets a click open it full-size.
 */
export function Avatar({ url, name, size = 40, zoom = false }: {
  url?: string | null
  name?: string | null
  size?: number
  zoom?: boolean
}) {
  const safe = safeHttpUrl(url)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => { setFailed(false) }, [safe])

  const box = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }

  if (!safe || failed) {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary"
        style={{ ...box, background: 'hsl(217 100% 50% / 0.15)' }}
        aria-hidden="true"
      >
        {initials(name)}
      </div>
    )
  }

  const img = (
    <img
      src={safe}
      alt={name ? `${name}'s photo` : 'Profile photo'}
      onError={() => setFailed(true)}
      className="rounded-full object-cover flex-shrink-0 border border-border"
      style={box}
    />
  )

  if (!zoom) return img

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full flex-shrink-0" title="View photo">
        {img}
      </button>
      {open && <ImageViewer src={safe} title={name ? `${name}'s photo` : 'Profile photo'} onClose={() => setOpen(false)} />}
    </>
  )
}

const looksLikePdf = (url: string) => {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}

/**
 * A thumbnail for a file in private storage. `load` asks the API for a
 * short-lived signed link; the image is shown inline, opens full-size on click,
 * and PDFs (or anything that won't render as an image) get an "Open file" tile.
 * The link is fetched again on Retry, since signed links expire.
 */
export function SignedImage({ load, label, deps }: {
  load: () => Promise<{ url: string }>
  label: string
  deps: unknown[]
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [broken, setBroken] = useState(false)
  const [open, setOpen] = useState(false)
  const attempt = useRef(0)

  const fetchLink = useCallback(async () => {
    const id = ++attempt.current
    setLoading(true)
    setError('')
    setBroken(false)

    try {
      const { url: signed } = await load()
      const safe = safeHttpUrl(signed)
      if (!safe) throw new Error('The server returned an invalid link.')
      if (attempt.current === id) setUrl(safe)
    } catch (err) {
      if (attempt.current === id) {
        setUrl(null)
        setError(err instanceof Error ? err.message : 'Could not load this file.')
      }
    } finally {
      if (attempt.current === id) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetchLink()
    const pending = attempt
    return () => { pending.current++ }
  }, [fetchLink])

  const tile = 'relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background'

  let body: React.ReactNode
  if (loading) {
    body = <div className={tile}><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
  } else if (!url) {
    body = (
      <div className={tile + ' flex-col gap-2 px-3 text-center'}>
        <ImageOff size={20} className="text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground">{error}</p>
        <button type="button" onClick={fetchLink} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
          <RefreshCw size={11} />Retry
        </button>
      </div>
    )
  } else if (looksLikePdf(url) || broken) {
    body = (
      <a href={url} target="_blank" rel="noreferrer noopener" className={tile + ' flex-col gap-2 hover:border-primary/60'}>
        <FileText size={24} className="text-primary" />
        <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1">
          Open {looksLikePdf(url) ? 'PDF' : 'file'} <ExternalLink size={11} />
        </span>
      </a>
    )
  } else {
    body = (
      <button type="button" onClick={() => setOpen(true)} className={tile + ' hover:border-primary/60'} title={`View ${label}`}>
        <img src={url} alt={label} onError={() => setBroken(true)} className="h-full w-full object-cover" />
      </button>
    )
  }

  return (
    <figure className="min-w-0">
      {body}
      <figcaption className="mt-1.5 text-[11px] text-muted-foreground">{label}</figcaption>
      {open && url && <ImageViewer src={url} title={label} onClose={() => setOpen(false)} />}
    </figure>
  )
}

/** Placeholder tile for a file that was never uploaded. */
export function MissingImage({ label }: { label: string }) {
  return (
    <figure className="min-w-0">
      <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border">
        <ImageOff size={20} className="text-muted-foreground opacity-60" />
        <span className="text-[11px] text-muted-foreground">Not uploaded</span>
      </div>
      <figcaption className="mt-1.5 text-[11px] text-muted-foreground">{label}</figcaption>
    </figure>
  )
}

// ── Driver eligibility ──────────────────────────────────────────────────────

type Eligibility = { eligible: boolean; code?: string | null; reason?: string | null }

/**
 * Whether a driver may take deliveries right now, and if not, why — in words
 * meant for an admin. The API's own `reason` is written to the driver ("Your
 * accreditation is…"), so it's only used for codes this map doesn't know.
 */
const ELIGIBILITY: Record<string, { label: string; color: string; explain: string }> = {
  not_started: { label: 'Not started', color: '#8891A8', explain: "Hasn't started the driver application." },
  in_progress: { label: 'Application unfinished', color: '#6699FF', explain: "Hasn't submitted the application yet." },
  under_review: { label: 'Waiting for review', color: '#F5C400', explain: 'Submitted — waiting for an admin to approve or reject it.' },
  rejected: { label: 'Application rejected', color: '#EF4444', explain: 'An admin rejected the application. The driver can fix it and resubmit.' },
  license_not_approved: { label: 'Licence not approved', color: '#F5C400', explain: "The driver's licence hasn't been approved." },
  license_expired: { label: 'Licence expired', color: '#EF4444', explain: 'The licence on file has expired — they need to upload a current one.' },
  insurance_not_approved: { label: 'Insurance not approved', color: '#F5C400', explain: "The insurance hasn't been approved." },
  insurance_expired: { label: 'Insurance expired', color: '#EF4444', explain: 'The insurance on file has expired — they need to upload a current policy.' },
  background_not_approved: { label: 'Background check pending', color: '#F5C400', explain: "The background check hasn't been approved." },
}

export function eligibilityInfo(eligibility?: Eligibility | null) {
  if (eligibility?.eligible) {
    return { label: 'Can take orders', color: '#22C55E', explain: 'Fully approved — can take deliveries.' }
  }
  const known = eligibility?.code ? ELIGIBILITY[eligibility.code] : undefined
  return known ?? {
    label: "Can't take orders",
    color: '#EF4444',
    explain: eligibility?.reason || 'Not approved to take deliveries.',
  }
}

/** "Can take orders" in green, or the reason they can't (e.g. "Waiting for review"). */
export function EligibilityBadge({ eligibility }: { eligibility?: Eligibility | null }) {
  const { label, color, explain } = eligibilityInfo(eligibility)

  return (
    <span
      title={explain}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: `${color}1A`, border: `1px solid ${color}59`, color }}
    >
      {label}
    </span>
  )
}

/** One line under the badge saying what's holding the driver back. Nothing when eligible. */
export function EligibilityNote({ eligibility }: { eligibility?: Eligibility | null }) {
  if (!eligibility || eligibility.eligible) return null

  return (
    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
      <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
      {eligibilityInfo(eligibility).explain}
    </p>
  )
}
