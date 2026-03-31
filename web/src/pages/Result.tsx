import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { TMessage } from '../types'
import type { TStory } from '../types'
import Message from '../components/Message'
import { getStoryById } from '../data/stories'

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const currentStory: TStory | undefined = useMemo(() => {
    if (!id) return undefined
    return getStoryById(id)
  }, [id])

  const state = location.state as { messages?: TMessage[] } | null
  const messages = state?.messages || []

  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 50)
    return () => window.clearTimeout(t)
  }, [])

  if (!currentStory) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-6">
          <div className="text-lg font-semibold text-amber-300">结果不存在</div>
          <div className="mt-2 text-sm text-slate-300/90">返回大厅重新选择。</div>
          <button
            type="button"
            className="mt-5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300"
            onClick={() => navigate('/')}
          >
            回到大厅
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-5 rounded-2xl border border-slate-700/80 bg-slate-900/30 p-6">
        <div className="text-xl font-bold text-slate-100">{currentStory.title}</div>
        <div className="mt-3 text-xs text-amber-300/90">汤底揭晓</div>

        <div
          className={[
            'mt-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-100',
            'transition duration-700 ease-out',
            revealed ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          {currentStory.bottom}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            再来一局
          </button>
          <div className="text-xs text-slate-400">想再推理一次？回到大厅重新选故事。</div>
        </div>
      </div>

      {messages.length > 0 ? (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/30 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-200">本局对话回顾</div>
          <div className="max-h-[50vh] overflow-y-auto pr-1">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-400">对话历史未保留。</div>
      )}
    </div>
  )
}

