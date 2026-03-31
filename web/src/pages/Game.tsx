import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatBox from '../components/ChatBox'
import Message from '../components/Message'
import type { TMessage } from '../types'
import type { TStory } from '../types'
import { getStoryById } from '../data/stories'
import { askAI } from '../services/api'

function createId(): string {
  // 兼容不同运行环境：浏览器优先 UUID
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random()}`
}

export default function Game() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const currentStory: TStory | undefined = useMemo(() => {
    if (!id) return undefined
    return getStoryById(id)
  }, [id])

  const [messages, setMessages] = useState<TMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  const handleEndGame = () => {
    setMessages([])
    navigate('/')
  }

  const handleViewBottom = () => {
    if (!id) return
    navigate(`/result/${id}`, { state: { messages } })
  }

  const sendQuestion = async (question: string) => {
    if (!currentStory) return
    if (!question.trim()) return

    const trimmed = question.trim().slice(0, 500)
    setErrorMessage(null)

    const userMessage: TMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    const placeholderId = createId()
    const thinkingMessage: TMessage = {
      id: placeholderId,
      role: 'assistant',
      content: '思考中...',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage, thinkingMessage])
    setIsLoading(true)

    try {
      const result = await askAI(trimmed, currentStory)

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                ...m,
                content: result.answer,
                invalidOutput: !!result.invalidOutput,
              }
            : m,
        ),
      )

      if (result.invalidOutput) {
        setErrorMessage('AI回答不规范，请换个问法再试。')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      // 简单区分：超时/中断倾向于网络提示，其它则按服务端错误提示
      if (msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
        setErrorMessage('网络不稳定，请稍后重试')
      } else {
        setErrorMessage('AI回复出错了，稍后再试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentStory) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-6">
          <div className="text-lg font-semibold text-amber-300">故事不存在</div>
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-4 rounded-2xl border border-slate-700/80 bg-slate-900/30 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-bold text-slate-100">{currentStory.title}</div>
            <div className="mt-1 text-xs text-amber-300/90">
              难度：
              <span className="ml-1">{currentStory.difficulty === 'easy' ? 'easy' : currentStory.difficulty === 'medium' ? 'medium' : 'hard'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleViewBottom}
              disabled={isLoading}
              className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              查看汤底
            </button>
            <button
              type="button"
              onClick={handleEndGame}
              className="rounded-xl border border-slate-700/80 bg-slate-900/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/50"
            >
              结束游戏
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-32 overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900/20 p-4 text-sm leading-relaxed text-slate-200">
          {currentStory.surface}
        </div>

        <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/20 p-4 text-sm leading-relaxed text-slate-200">
          <div className="text-xs font-semibold text-amber-300/90">AI 回答规则</div>
          <div className="mt-2 text-slate-300/90">
            AI 只回答三选一：`是` / `否` / `无关`。若输出不合规，会自动回退为 `无关`。
          </div>
        </div>
      </div>

      <div className="flex h-[60vh] min-h-[420px] flex-col rounded-2xl border border-slate-700/80 bg-slate-900/30">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              开始提问吧。AI 会只回答“是/否/无关”。
            </div>
          ) : (
            messages.map((m) => <Message key={m.id} message={m} />)
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-700/60 p-4">
          <ChatBox isLoading={isLoading} errorMessage={errorMessage} onSend={sendQuestion} />
        </div>
      </div>
    </div>
  )
}

