# AI海龟汤游戏 技术设计文档

## 1. 设计目标
- 与 `PRD.md` 保持一致，优先实现 MVP：大厅、游戏对话页、汤底结果页
- AI 回答严格限制为：`是 / 否 / 无关`
- 结构清晰、可迭代、便于后续扩展（用户系统、排行榜、更多故事）

## 2. 技术栈
### 2.1 前端
- 框架：React 18 + TypeScript + Vite
- 样式：Tailwind CSS
- 路由：React Router
- 状态管理：React Hooks（`useState`、`useMemo`、`useEffect`）

### 2.2 后端（推荐，生产更安全）
- 运行时：Node.js
- 框架：Express
- 中间件：CORS、JSON body parser
- 职责：代理 AI 请求，保护 API Key，不向前端暴露密钥

### 2.3 AI 接入
- 模型提供方：DeepSeek / 兼容 OpenAI Chat Completions 的服务
- 请求方式：HTTP `POST`
- 关键约束：系统提示词强制输出 `是|否|无关`

### 2.4 部署
- 前端：Vercel（静态站点）
- 后端：Railway / Vercel Serverless Functions（按实际选择）

## 3. 项目结构
```text
ai-haigui-game/
├─ PRD.md
├─ TECH_DESIGN.md
├─ AGENTS.md
├─ web/                         # 前端
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ GameCard.tsx
│  │  │  ├─ Message.tsx
│  │  │  └─ ChatBox.tsx
│  │  ├─ pages/
│  │  │  ├─ Home.tsx
│  │  │  ├─ Game.tsx
│  │  │  └─ Result.tsx
│  │  ├─ data/
│  │  │  └─ stories.ts
│  │  ├─ services/
│  │  │  └─ api.ts
│  │  ├─ types/
│  │  │  └─ index.ts
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  ├─ .env.local.example
│  └─ vite.config.ts
└─ server/                      # 后端（可选但推荐）
   ├─ index.js
   ├─ routes/
   │  └─ chat.js
   ├─ services/
   │  └─ aiClient.js
   └─ .env.example
```

## 4. 数据模型
### 4.1 Story
```ts
export type TDifficulty = 'easy' | 'medium' | 'hard';

export interface TStory {
  id: string;
  title: string;
  difficulty: TDifficulty;
  surface: string;
  bottom: string;
}
```

### 4.2 Message
```ts
export type TMessageRole = 'user' | 'assistant';

export interface TMessage {
  id: string;
  role: TMessageRole;
  content: string; // 预期仅“是/否/无关”
  timestamp: number;
}
```

### 4.3 ChatRequest / ChatResponse
```ts
export interface TChatRequest {
  question: string;
  story: TStory;
}

export interface TChatResponse {
  answer: '是' | '否' | '无关';
  raw?: string; // 可选，便于调试
}
```

## 5. 路由设计
### 5.1 前端路由
- `/`：`Home`，展示故事列表
- `/game/:id`：`Game`，基于故事 ID 进入对话
- `/result/:id`：`Result`，展示汤底与回到大厅入口

### 5.2 后端接口
- `GET /api/test`：健康检查
- `POST /api/chat`：
  - 入参：`{ question, story }`
  - 出参：`{ answer }`，其中 `answer ∈ {是, 否, 无关}`

## 6. 核心流程
1. 用户在大厅选择故事，跳转到 `Game` 页面
2. 用户输入问题，前端立即追加用户消息
3. 前端调用 `/api/chat`
4. 后端拼装 Prompt 调用 AI 服务
5. 后端校验输出：
   - 若是 `是/否/无关`，直接返回
   - 若不合规，执行回退策略并返回 `无关`
6. 前端展示 AI 回答；用户可继续提问或跳转结果页

## 7. Prompt 设计（核心）
```text
你是一个海龟汤游戏主持人。
当前汤面：{surface}
当前汤底：{bottom}

规则：
1) 玩家会提问，你只能回答“是”或“否”或“无关”三者之一。
2) 严格依据汤底判断，不得猜测。
3) 不得解释，不得补充，不得泄露汤底。
4) 你的输出必须是一个词：是 / 否 / 无关。

玩家问题：{question}
请直接输出：
```

## 8. 异常与回退策略
### 8.1 AI 输出不合规
- 规范化处理（trim、去标点、去引号）
- 若仍不匹配三值，直接回退为 `无关`

### 8.2 网络/服务异常
- 后端返回统一错误结构：`{ message, code }`
- 前端提示：`AI回复出错了，稍后再试`
- 不清空历史消息，允许继续提问

### 8.3 无效输入
- 空字符串直接拦截，不发请求
- 过长文本可截断（如 500 字）并提示用户精简问题

## 9. 状态管理方案（前端）
- 页面级状态：
  - `currentStory`
  - `messages`
  - `isLoading`
  - `errorMessage`
- 设计原则：
  - 优先本地状态，MVP 不引入全局状态库
  - 会话只在页面生命周期内有效（后续可扩展本地存储）

## 10. 安全设计
- API Key 仅存在后端环境变量（推荐）
- 前端不持有真实密钥
- CORS 仅放行必要来源
- 日志中不打印密钥、完整用户隐私信息

## 11. 测试计划
### 11.1 功能测试
- 大厅渲染故事列表
- 点击卡片正确跳转
- 游戏页发送消息与显示回答
- 回答严格三选一
- 查看汤底与再来一局流程正常

### 11.2 异常测试
- 断网/超时提示是否生效
- 后端 500 时前端是否友好提示
- AI 输出异常时是否回退为 `无关`

### 11.3 兼容与响应式
- 桌面端（Chrome/Edge）
- 移动端（375x667、390x844）

## 12. 里程碑建议
- M1：项目初始化与路由跑通
- M2：大厅与故事数据完成
- M3：游戏对话 UI + 本地假数据联调
- M4：后端 `/api/chat` 打通，真实 AI 可用
- M5：结果页 + 体验优化 + 部署上线

## 13. 环境变量约定
### 13.1 前端（web/.env.local）
```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 13.2 后端（server/.env）
```bash
PORT=3000
AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat
```
