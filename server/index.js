const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const chatRouter = require('./routes/chat')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/test', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', chatRouter)

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on :${PORT}`)
})

