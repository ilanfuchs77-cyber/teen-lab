import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AIProvider } from '../lib/ai'

const STORAGE_KEY = 'teenlab.aiProvider'

interface AIProviderCtx {
  /** The user's chosen AI provider (persisted to localStorage). */
  provider: AIProvider
  setProvider: (p: AIProvider) => void
  /** Real providers the backend reports as having an API key configured. */
  configured: string[]
}

const Ctx = createContext<AIProviderCtx>({
  provider: 'auto',
  setProvider: () => {},
  configured: [],
})

function readStored(): AIProvider {
  if (typeof localStorage === 'undefined') return 'auto'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'gemini' || v === 'openai' || v === 'claude' || v === 'ollama' || v === 'auto' ? v : 'auto'
}

export function AIProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<AIProvider>(readStored)
  const [configured, setConfigured] = useState<string[]>([])

  function setProvider(p: AIProvider) {
    setProviderState(p)
    try { localStorage.setItem(STORAGE_KEY, p) } catch { /* ignore */ }
  }

  // Ask the backend which providers actually have keys, so the picker can show
  // "Connected" vs "Demo" without exposing the keys themselves.
  useEffect(() => {
    let cancelled = false
    fetch('/api/ai-providers')
      .then((r) => (r.ok ? r.json() : { configured: [] }))
      .then((d) => { if (!cancelled) setConfigured(d.configured ?? []) })
      .catch(() => { /* offline / mock mode — leave empty */ })
    return () => { cancelled = true }
  }, [])

  return (
    <Ctx.Provider value={{ provider, setProvider, configured }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAIProvider() {
  return useContext(Ctx)
}
