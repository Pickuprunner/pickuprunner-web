import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function TextField({ id, label, value, onChange, error, placeholder, type = 'text', icon, valid }: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  valid?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className="w-full rounded-xl border px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          style={{
            borderColor: error ? 'hsl(0 84% 60%)' : 'hsl(var(--border))',
            paddingLeft: icon ? '2.25rem' : undefined,
            paddingRight: valid ? '2.25rem' : undefined,
          }}
        />
        {valid && (
          <CheckCircle2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#22C55E' }}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}
