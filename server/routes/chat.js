const express = require('express')
const { getChatAnswer } = require('../services/aiClient')

const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { question, story } = req.body || {}

    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Invalid question', code: 'BAD_REQUEST' })
    }

    if (
      !story ||
      typeof story !== 'object' ||
      typeof story.id !== 'string' ||
      typeof story.surface !== 'string' ||
      typeof story.bottom !== 'string'
    ) {
      return res.status(400).json({ message: 'Invalid story', code: 'BAD_REQUEST' })
    }

    const { answer, invalidOutput } = await getChatAnswer({
      question: question.trim().slice(0, 500),
      story,
    })

    return res.json({ answer, invalidOutput })
  } catch (err) {
    return res.status(500).json({ message: 'AI reply error', code: 'AI_ERROR' })
  }
})

module.exports = router

