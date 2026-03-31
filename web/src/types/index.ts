export type TDifficulty = 'easy' | 'medium' | 'hard'

export interface TStory {
  id: string
  title: string
  difficulty: TDifficulty
  surface: string
  bottom: string
}

export type TMessageRole = 'user' | 'assistant'

export interface TMessage {
  id: string
  role: TMessageRole
  content: string
  timestamp: number
  // AI 输出校验失败时，用于前端给出提示
  invalidOutput?: boolean
}

