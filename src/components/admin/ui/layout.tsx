
import { forwardRef } from 'react'
import { createLink } from '@tanstack/react-router'

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

export function DetailHeader({ icon, media, title, subtitle, badges, aside, footer, bare = false }: {
  icon?: React.ReactNode
  media?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  badges?: React.ReactNode
  aside?: React.ReactNode
  footer?: React.ReactNode
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

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <div className="divide-y divide-border [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
        {children}
      </div>
    </Card>
  )
}

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
