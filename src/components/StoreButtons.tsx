import { Apple, Play } from 'lucide-react'

import { APP_STORES } from '../lib/appStores'

const ICONS = { ios: Apple, android: Play } as const

/**
 * "Download on the App Store" / "Get it on Google Play", linking to the real
 * store pages in a new tab.
 *
 *   compact — small bordered buttons (home hero, footer, inline notes)
 *   large   — big tiles with an icon box (the order page hero and CTA)
 */
export function StoreButtons({ variant = 'compact', className = '' }: {
  variant?: 'compact' | 'large'
  className?: string
}) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${variant === 'large' ? 'sm:gap-4 justify-center' : ''} ${className}`}>
      {APP_STORES.map(({ key, label, sub, url }) => {
        const Icon = ICONS[key]

        if (variant === 'large') {
          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${sub} ${label}`}
              className="group flex items-center gap-4 px-6 py-4 rounded-2xl border border-border hover:border-primary/60 transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'hsl(237 40% 6%)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(217 100% 50% / 0.15)', border: '1px solid hsl(217 100% 50% / 0.3)' }}
              >
                <Icon size={22} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">{sub}</p>
                <p className="text-lg font-bold text-foreground">{label}</p>
              </div>
            </a>
          )
        }

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${sub} ${label}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-muted transition-all duration-200 group"
          >
            <Icon size={20} className="text-foreground group-hover:text-primary transition-colors" />
            <div>
              <p className="text-xs text-muted-foreground">{sub}</p>
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}
