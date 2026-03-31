const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'

const VALID_ANSWERS = ['是', '否', '无关']
const DEBUG_ENABLED = /^(1|true|yes|on)$/i.test(String(process.env.DEBUG_AI || '').trim())

function normalizeAnswer(input) {
  return String(input || '')
    .trim()
    .replace(/["'`“”‘’]/g, '')
    .replace(/[。！？!?,，、\s]/g, '')
}

function parseAnswer(input) {
  const normalized = normalizeAnswer(input)
  if (!normalized) return null

  if (VALID_ANSWERS.includes(normalized)) return normalized

  // 放宽匹配：优先判定是/否，只有明确无关才判无关，减少过度“无关”
  if (/(^|[^不])是(的|吗)?$|^正确$|^有关$/.test(normalized)) return '是'
  if (/^不是$|^否$|^不$|^错误$|^没(有|错)?$/.test(normalized)) return '否'
  if (/无关|不相关|无法判断|信息不足|未知/.test(normalized)) return '无关'

  return null
}

function logDebug(payload) {
  if (!DEBUG_ENABLED) return
  // eslint-disable-next-line no-console
  console.log('[ai-debug]', JSON.stringify(payload, null, 2))
}

async function callChatCompletions({ system, question, surface, bottom }) {
  const apiBaseUrl = process.env.AI_BASE_URL || DEFAULT_BASE_URL
  const model = process.env.AI_MODEL || DEFAULT_MODEL
  const apiKey = process.env.AI_API_KEY

  if (!apiKey) {
    // 本地未配置 key 时，保持前端可用（永远返回无关）
    return { raw: '', content: '无关' }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const payload = {
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: system
            .replaceAll('{surface}', surface)
            .replaceAll('{bottom}', bottom),
        },
        {
          role: 'user',
          content: question,
        },
      ],
      stream: false,
    }

    const url = `${apiBaseUrl.replace(/\/+$/, '')}/chat/completions`

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`HTTP ${resp.status}: ${text}`.trim())
    }

    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content

    return { raw: content, content }
  } finally {
    clearTimeout(timeout)
  }
}

async function getChatAnswer({ question, story }) {
  const surface = story.surface
  const bottom = story.bottom

  const system = `你是一个海龟汤游戏主持人。
当前汤面：{surface}
当前汤底：{bottom}

规则：
1) 玩家会提问，你只能回答“是”或“否”或“无关”三者之一。
2) 严格依据汤底判断，不得猜测。
3) 不得解释，不得补充，不得泄露汤底。
4) 你的输出必须是一个词：是 / 否 / 无关。
5) 当问题与汤底存在直接因果、条件、事实关联时，优先回答“是”或“否”。
6) 只有在问题确实与汤底无直接关联，或汤底完全无法支持判断时，才回答“无关”。

示例：
问：监控空白是设备故障吗？
答：否
问：监控空白是店长人为造成的吗？
答：是
问：店长今天中午吃了什么？
答：无关
`

  const { content } = await callChatCompletions({
    system,
    question,
    surface,
    bottom,
  })

  const normalized = normalizeAnswer(content)
  const parsed = parseAnswer(content)

  if (!parsed) {
    logDebug({
      question,
      raw: content,
      normalized,
      parsed,
      finalAnswer: '无关',
      invalidOutput: true,
    })
    return { answer: '无关', invalidOutput: true }
  }

  logDebug({
    question,
    raw: content,
    normalized,
    parsed,
    finalAnswer: parsed,
    invalidOutput: false,
  })
  return { answer: parsed, invalidOutput: false }
}

module.exports = { getChatAnswer }

