
import { forwardRef, useEffect, useState } from 'react'
import { Link, createLink, useCanGoBack, useRouter } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, ChevronRight, Inbox, Search } from 'lucide-react'
import { useDebounced } from './context'
import { humanise } from './format'
import { CARD_BACKGROUND, Detail } from './layout'

export function ViewHint() {
  return (
    <ChevronRight
      size={18}
      className="hidden sm:block flex-shrink-0 text-muted-foreground opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
    />
  )
}

export function FilterRow<T extends string>({
  options, value, onChange, labels, counts,
}: {
  options: readonly T[]
  value: T
  onChange: (next: T) => void
  labels?: Partial<Record<T, string>>
  counts?: Partial<Record<T, number>>
}) {
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
          {labels?.[option] ?? (option === 'all' ? 'All' : humanise(option))}
          {typeof counts?.[option] === 'number' && (
            <span
              className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
              style={{ background: 'hsl(var(--foreground) / 0.1)' }}
            >
              {counts[option]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({ value, onCommit, placeholder }: {
  value: string; onCommit: (v: string) => void; placeholder: string
}) {
  const [draft, setDraft] = useState(value)
  const settled = useDebounced(draft)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (settled.trim() !== value) onCommit(settled.trim())
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

export function Total({ shown, total }: { shown: number; total?: number }) {
  return (
    <p className="text-xs text-muted-foreground mb-3">
      Showing {shown}{typeof total === 'number' ? ` of ${total}` : ''}
    </p>
  )
}

export function PaginationControls({ page, totalPages, onChange }: {
  page: number
  totalPages?: number
  onChange: (nextPage: number) => void
}) {
  if (!totalPages || totalPages <= 1) return null

  const current = Math.min(Math.max(page, 1), totalPages)

  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
        }}
      >
        Previous
      </button>

      <p className="text-xs text-muted-foreground tabular-nums">
        Page {current} of {totalPages}
      </p>

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
        }}
      >
        Next
      </button>
    </div>
  )
}

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

export const TextLink = createLink(TextAnchor)

