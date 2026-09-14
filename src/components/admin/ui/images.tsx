
import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, FileText, ImageOff, Loader2, RefreshCw, X } from 'lucide-react'
import { safeHttpUrl } from './format'

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
