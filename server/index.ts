import express from 'express'
import cors from 'cors'
import path from 'path'
import http from 'http'
import { generateIdeasRouter } from './routes/generateIdeas'
import { launchPlanRouter } from './routes/launchPlan'
import { codegenPromptRouter } from './routes/codegenPrompt'
import { improveIdeaRouter } from './routes/improveIdea'
import { configuredProviders } from './ai/provider'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api/generate-ideas', generateIdeasRouter)
  app.use('/api/launch-plan', launchPlanRouter)
  app.use('/api/codegen-prompt', codegenPromptRouter)
  app.use('/api/improve-idea', improveIdeaRouter)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', geminiKeySet: !!process.env.GEMINI_API_KEY })
  })

  // Which AI providers have an API key configured. Exposes only booleans (the
  // provider ids), never the keys — lets the UI show Connected vs Demo.
  app.get('/api/ai-providers', (_req, res) => {
    res.json({ configured: configuredProviders() })
  })

  // In the packaged desktop app, this same server also serves the built
  // React frontend, so the UI and /api/* live on one origin (no proxy needed).
  const clientDir = process.env.CLIENT_DIR
  if (clientDir) {
    app.use(express.static(clientDir))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'))
    })
  }

  return app
}

// Starts the server, automatically trying the next port if one is taken.
export function startServer(
  startPort = Number(process.env.PORT) || 3001
): Promise<number> {
  const app = createApp()

  return new Promise((resolve, reject) => {
    const tryListen = (port: number, attemptsLeft: number) => {
      const server = http.createServer(app)
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
          tryListen(port + 1, attemptsLeft - 1)
        } else {
          reject(err)
        }
      })
      server.listen(port, () => {
        console.log(`\n🚀 Teen Lab running on http://localhost:${port}`)
        if (!process.env.GEMINI_API_KEY) {
          console.warn('⚠️  GEMINI_API_KEY not set — AI endpoints will return mock data')
        } else {
          console.log('✅ Gemini API key detected')
        }
        resolve(port)
      })
    }
    tryListen(startPort, 10)
  })
}

// Auto-start when run directly (dev via `tsx watch`).
// The Electron desktop app sets ELECTRON_APP=true and calls startServer() itself.
if (process.env.ELECTRON_APP !== 'true') {
  startServer()
}
