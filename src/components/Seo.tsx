import { useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { pageMetadata, renderSeoHead } from '../lib/seo'

export function Seo() {
  const pathname = useLocation({ select: location => location.pathname })
  useEffect(() => {
    const template = document.createElement('template')
    template.innerHTML = renderSeoHead(pathname)
    document.head.querySelectorAll('[data-seo]').forEach(node => node.remove())
    document.head.append(template.content)
  }, [pathname])
  return null
}

export function Breadcrumbs() {
  const pathname = useLocation({ select: location => location.pathname })
  const page = pageMetadata(pathname)
  if (!page.indexable || page.path === '/') return null
  return (
    <nav aria-label="Breadcrumb" className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-2">
        <li><Link to="/" className="hover:text-foreground">Pickup Runner</Link></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{page.label}</li>
      </ol>
    </nav>
  )
}
