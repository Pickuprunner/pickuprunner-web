
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { chatApi, type ChatMessage } from '../../../lib/api'
import { ErrorLine, Section, dateTime, useAdmin } from '../ui'

const SENDER_STYLE: Record<ChatMessage['senderRole'], { label: string; color: string; align: string }> = {
  customer: { label: 'Customer', color: '#6699FF', align: 'items-start' },
  driver: { label: 'Driver', color: '#22C55E', align: 'items-end' },
  admin: { label: 'Support', color: '#F5C400', align: 'items-end' },
}

export function OrderChat({ orderId, version }: { orderId: string; version: number }) {
  const { token } = useAdmin()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasOlder, setHasOlder] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)

  const load = useCallback(async (before?: string) => {
    const id = ++request.current
    setLoading(true)
    setError('')

    try {
      const page = await chatApi.messages(token, orderId, before)
      if (request.current !== id) return
      setMessages((current) => (before ? [...page.messages, ...current] : page.messages))
      setCursor(page.oldestCursor)
      setHasOlder(page.hasOlder)
    } catch (err) {
      if (request.current === id) setError(err instanceof Error ? err.message : 'Could not load the conversation.')
    } finally {
      if (request.current === id) setLoading(false)
    }
  }, [token, orderId])

  useEffect(() => {
    load()
    const pending = request
    return () => { pending.current++ }
  }, [load, version])

  return (
    <Section title={`Conversation${messages.length ? ` (${messages.length}${hasOlder ? '+' : ''})` : ''}`}>
      <ErrorLine message={error} />

      {hasOlder && (
        <button
          type="button"
          onClick={() => cursor && load(cursor)}
          disabled={loading}
          className="mb-3 w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Load earlier messages'}
        </button>
      )}

      {loading && !messages.length ? (
        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div>
      ) : messages.length ? (
        <ol className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {messages.map((message) =>
            message.isSystem ? (
              <li key={message.id} className="text-center">
                <span className="inline-block rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                  {message.body} · {dateTime(message.createdAt)}
                </span>
              </li>
            ) : (
              <li key={message.id} className={'flex flex-col ' + SENDER_STYLE[message.senderRole].align}>
                <span className="text-[10px] font-semibold mb-0.5" style={{ color: SENDER_STYLE[message.senderRole].color }}>
                  {SENDER_STYLE[message.senderRole].label}
                </span>
                <p
                  className="max-w-[85%] rounded-2xl px-3 py-2 text-sm text-foreground whitespace-pre-wrap break-words"
                  style={{ background: `${SENDER_STYLE[message.senderRole].color}1F` }}
                >
                  {message.body}
                </p>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {dateTime(message.createdAt)}{message.readAt ? ' · read' : ''}
                </span>
              </li>
            ),
          )}
        </ol>
      ) : (
        !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MessageSquare size={12} />No messages on this order.
          </p>
        )
      )}
    </Section>
  )
}
