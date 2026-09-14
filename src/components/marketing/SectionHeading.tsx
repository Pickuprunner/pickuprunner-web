export function SectionHeading({ eyebrow, title, children }: {
  eyebrow: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="text-center mb-14">
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
      {children && <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{children}</p>}
    </div>
  )
}
