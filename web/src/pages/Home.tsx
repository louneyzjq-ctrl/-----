import { useNavigate } from 'react-router-dom'
import GameCard from '../components/GameCard'
import { STORIES } from '../data/stories'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-amber-300 glow-title">
          <span className="turtle-icon text-4xl">🐢</span>
          AI海龟汤
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
          读懂汤面，通过不断提问，让 AI 只回答“是/否/无关”。
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-700/80 bg-slate-900/30 p-4">
        <div className="text-sm font-semibold text-slate-100">玩法规则</div>
        <ol className="mt-2 list-decimal pl-5 text-sm leading-relaxed text-slate-300/90">
          <li>读汤面后持续提问，让 AI 做三值判断。</li>
          <li>AI 只回答：`是` / `否` / `无关`。</li>
          <li>AI 输出异常会自动回退为 `无关`。</li>
          <li>需要查看真相时点击“查看汤底”。</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {STORIES.map((story) => (
          <GameCard
            key={story.id}
            story={story}
            onClick={() => navigate(`/game/${story.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

