import type { TStory } from '../types'

export default function GameCard(props: { story: TStory; onClick: () => void }) {
  const { story, onClick } = props

  const filledStars = story.difficulty === 'easy' ? 1 : story.difficulty === 'medium' ? 3 : 5
  const ariaLabel = `难度：${filledStars}星`

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-700/80 bg-slate-900/30 p-4 text-left transition hover:border-amber-400/40 hover:bg-slate-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">{story.title}</div>
          <div className="mt-2 flex items-center" aria-label={ariaLabel}>
            <div className="flex gap-1" role="img" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, idx) => {
                const filled = idx < filledStars
                return (
                  <span
                    key={idx}
                    className={filled ? 'text-amber-400' : 'text-slate-500'}
                  >
                    ★
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="text-amber-400 opacity-0 transition group-hover:opacity-100">进入</div>
      </div>

      <div className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-300/90">
        {story.surface}
      </div>
    </button>
  )
}

