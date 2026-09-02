import React from 'react'

interface ShellProps {
  sidebar: React.ReactNode
  appName?: string
  children: React.ReactNode
}

export function Shell({ sidebar, appName = 'App', children }: ShellProps) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden shrink-0 md:block">
        {sidebar}
      </aside>

      <main className="min-w-0 flex-1">
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <span className="font-semibold text-sm">{appName}</span>
        </div>
        {children}
      </main>
    </div>
  )
}
