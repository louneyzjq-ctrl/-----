import { useMemo, useState } from 'react'

export default function ChatBox(props: {
  isLoading: boolean
  errorMessage: string | null
  onSend: (question: string) => void
}) {
  const { isLoading, errorMessage, onSend } = props
  const [inputText, setInputText] = useState('')

  const placeholder = useMemo(() => {
    return '输入你的提问（例如：钥匙在锁上吗？）'
  }, [])

  const send = () => {
    const question = inputText.trim()
    if (!question) return
    onSend(question)
    setInputText('')
  }

  return (
    <div className="w-full">
      {errorMessage ? (
        <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex items-end gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/30 p-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.shiftKey) return
            e.preventDefault()
            if (!isLoading) send()
          }}
          rows={2}
          className="min-h-[44px] flex-1 resize-none rounded-xl border border-transparent bg-transparent px-2 py-2 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-400 focus:border-amber-400/30"
          placeholder={placeholder}
          aria-label="问题输入"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={() => {
            if (isLoading) return
            send()
          }}
          disabled={isLoading}
          className="shrink-0 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-400/50"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  )
}

