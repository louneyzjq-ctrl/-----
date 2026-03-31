import type { TMessage } from '../types'

export default function Message(props: { message: TMessage }) {
  const { message } = props

  const isUser = message.role === 'user'

  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'border-amber-400/50 bg-amber-400/10 text-slate-100'
            : 'border-slate-700/80 bg-slate-900/40 text-slate-100',
        ].join(' ')}
      >
        <div className="break-words whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}

