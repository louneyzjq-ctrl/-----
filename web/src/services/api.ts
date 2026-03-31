import type { TStory } from '../types'

export type TAIAnswer = '是' | '否' | '无关'

export interface TChatApiResponse {
  answer: TAIAnswer
  raw?: string
  invalidOutput?: boolean
}

const VALID_ANSWERS: TAIAnswer[] = ['是', '否', '无关']

function normalizeAnswer(input: string): string {
  return input
    .trim()
    .replace(/["'`“”‘’]/g, '')
    .replace(/[。！？!?,，、\s]/g, '')
}

export async function askAI(
  question: string,
  story: TStory,
): Promise<TChatApiResponse> {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:3000'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const res = await fetch(`${apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ question, story: { id: story.id, surface: story.surface, bottom: story.bottom } }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}: ${text}`.trim())
    }

    const data = (await res.json()) as unknown
    const json = data as Partial<TChatApiResponse> & { answer?: unknown }
    const raw = typeof json.raw === 'string' ? json.raw : undefined

    const candidate =
      typeof json.answer === 'string' ? normalizeAnswer(json.answer) : ''

    const matched = VALID_ANSWERS.includes(candidate as TAIAnswer)
    if (!matched) {
      return { answer: '无关', raw, invalidOutput: true }
    }

    return { answer: candidate as TAIAnswer, raw, invalidOutput: json.invalidOutput }
  } finally {
    clearTimeout(timeout)
  }
}

