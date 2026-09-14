
import toast from 'react-hot-toast'
import { useState } from 'react'
import { AlertCircle, ChevronDown, UserRoundCheck, UserRoundX } from 'lucide-react'
import { type AccountStatus, type Role, usersApi } from '../../../lib/api'

function RoleDropdown({ value, disabled, onChange }: {
  value: Role
  disabled: boolean
  onChange: (role: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const roles: Role[] = ['customer', 'driver', 'admin']

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex min-w-28 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium capitalize text-foreground disabled:opacity-60"
      >
        {value}
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 w-28 overflow-hidden rounded-lg border border-border shadow-xl"
          style={{ background: 'hsl(237 40% 10%)' }}
        >
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={role === value}
              onClick={() => {
                setOpen(false)
                if (role !== value) onChange(role)
              }}
              className="w-full px-3 py-2 text-left text-xs capitalize text-muted-foreground hover:bg-primary/15 hover:text-foreground"
              style={{ background: role === value ? 'hsl(217 100% 50% / 0.15)' : undefined }}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountControls({ user, token, onChanged }: {
  user: { id: string; role: Role; status: AccountStatus }
  token: string
  onChanged: () => void | Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = async (action: 'role' | 'status', value: Role | AccountStatus) => {
    setSaving(true)
    setError('')

    try {
      if (action === 'role') {
        await usersApi.updateRole(token, user.id, value as Role)
        toast.success(`Role changed to ${value}`)
      } else {
        await usersApi.updateStatus(token, user.id, value as AccountStatus)
        toast.success(value === 'suspended' ? 'Account suspended — signed out everywhere' : 'Account reactivated')
      }
      await onChanged()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const active = user.status === 'active'

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center">
        <RoleDropdown value={user.role} disabled={saving} onChange={(role) => update('role', role)} />

        <button
          type="button"
          onClick={() => update('status', active ? 'suspended' : 'active')}
          disabled={saving}
          title={active ? 'Blocks the account and signs it out everywhere straight away' : 'Lets the account sign in again'}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
          style={{
            borderColor: active ? 'hsl(0 84% 60% / 0.5)' : 'hsl(142 71% 45% / 0.5)',
            color: active ? '#EF4444' : '#22C55E',
          }}
        >
          {active ? <UserRoundX size={14} /> : <UserRoundCheck size={14} />}
          {active ? 'Suspend' : 'Reactivate'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
