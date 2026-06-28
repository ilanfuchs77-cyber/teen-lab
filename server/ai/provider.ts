/**
 * Unified AI provider layer.
 *
 * The app can be backed by Google Gemini, OpenAI, Anthropic Claude, or a local
 * Ollama instance — the user picks which one in the UI, and the chosen provider
 * id arrives on each request as `aiProvider`. We talk to every provider over its
 * plain REST API with the built-in `fetch`, so no extra SDKs are needed and the
 * same code runs under tsx (dev), esbuild (desktop), and Vercel serverless.
 *
 * If the chosen provider has no API key configured, callers fall back to their
 * existing rich mock data, so every feature keeps working with zero setup.
 *
 * Ollama is special: it's a local runtime with no API key, so it's always
 * offered. Point it elsewhere with OLLAMA_HOST and pick a model with
 * OLLAMA_MODEL (defaults: http://localhost:11434 and llama3.2).
 */

export type AIProvider = 'auto' | 'gemini' | 'openai' | 'claude' | 'ollama'
export type RealProvider = Exclude<AIProvider, 'auto'>

export interface ProviderInfo {
  id: RealProvider
  label: string
  company: string
  model: string
  envKey: string
}

// Local Ollama server — no key required. Overridable via env.
const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://localhost:11434').replace(/\/+$/, '')
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

export const PROVIDER_INFO: Record<RealProvider, ProviderInfo> = {
  gemini: { id: 'gemini', label: 'Gemini',  company: 'Google',    model: 'gemini-1.5-flash',        envKey: 'GEMINI_API_KEY' },
  openai: { id: 'openai', label: 'GPT',     company: 'OpenAI',    model: 'gpt-4o-mini',             envKey: 'OPENAI_API_KEY' },
  claude: { id: 'claude', label: 'Claude',  company: 'Anthropic', model: 'claude-3-5-haiku-latest', envKey: 'ANTHROPIC_API_KEY' },
  ollama: { id: 'ollama', label: 'Ollama',  company: 'Local',     model: OLLAMA_MODEL,              envKey: 'OLLAMA_HOST' },
}

// Order used when resolving 'auto' — first one with a key wins. Ollama is left
// out on purpose: 'auto' should never quietly depend on a local server, so
// zero-setup users keep getting mock data instead of a connection error.
const RESOLUTION_ORDER: RealProvider[] = ['claude', 'openai', 'gemini']

export function isConfigured(p: RealProvider): boolean {
  // Ollama has no key — it's always selectable. If it isn't actually running we
  // surface a clear error when called rather than hiding the option here.
  if (p === 'ollama') return true
  return !!process.env[PROVIDER_INFO[p].envKey]
}

/** Which real providers currently have an API key set. */
export function configuredProviders(): RealProvider[] {
  return (Object.keys(PROVIDER_INFO) as RealProvider[]).filter(isConfigured)
}

/**
 * Turn the requested provider into one we can actually call, or null (→ mock).
 *
 * - An explicit pick is honored only if its key exists; otherwise null, so we
 *   never silently answer as a different AI than the user selected.
 * - 'auto' (or missing) uses the first configured provider in RESOLUTION_ORDER.
 */
export function resolveProvider(requested?: string): RealProvider | null {
  const req = (requested as AIProvider) || 'auto'
  if (req !== 'auto') {
    const p = req as RealProvider
    return PROVIDER_INFO[p] && isConfigured(p) ? p : null
  }
  return RESOLUTION_ORDER.find(isConfigured) ?? null
}

/** Human label for whatever will actually answer — for UI flavor / logging. */
export function providerLabel(requested?: string): string {
  const resolved = resolveProvider(requested)
  if (resolved) return PROVIDER_INFO[resolved].label
  const req = (requested as AIProvider) || 'auto'
  if (req !== 'auto' && PROVIDER_INFO[req as RealProvider]) {
    return PROVIDER_INFO[req as RealProvider].label
  }
  return 'Demo AI'
}

// ── REST callers ──────────────────────────────────────────────────────────

async function callGemini(model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`)
  const data: any = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callOpenAI(model: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`)
  const data: any = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

async function callClaude(model: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`)
  const data: any = await res.json()
  return data?.content?.[0]?.text ?? ''
}

// When OLLAMA_MODEL isn't set, use whatever model the user already pulled so
// the app works out of the box. Cached after the first lookup.
let cachedOllamaModel: string | null = null
async function pickOllamaModel(preferred: string): Promise<string> {
  if (process.env.OLLAMA_MODEL) return process.env.OLLAMA_MODEL
  if (cachedOllamaModel) return cachedOllamaModel
  try {
    const r = await fetch(`${OLLAMA_HOST}/api/tags`)
    if (r.ok) {
      const first = (await r.json())?.models?.[0]?.name
      if (first) return (cachedOllamaModel = first)
    }
  } catch { /* server unreachable — handled by callOllama */ }
  return preferred
}

async function callOllama(modelHint: string, prompt: string): Promise<string> {
  const model = await pickOllamaModel(modelHint)
  let res: Response
  try {
    res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.85 } }),
    })
  } catch {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_HOST}. Make sure the Ollama app is running, then run: ollama pull ${model}`
    )
  }
  if (!res.ok) {
    const body = await res.text()
    // 404 from Ollama almost always means the model hasn't been pulled yet.
    if (res.status === 404) throw new Error(`Ollama has no model "${model}". Run: ollama pull ${model}`)
    throw new Error(`Ollama API ${res.status}: ${body}`)
  }
  const data: any = await res.json()
  // Reasoning models (e.g. qwen3) wrap their scratch-work in <think>…</think>;
  // strip it so JSON parsing and prompt output stay clean.
  return (data?.response ?? '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

/** Raw text completion from a specific, already-resolved provider. */
export async function generateText(provider: RealProvider, prompt: string): Promise<string> {
  const { model } = PROVIDER_INFO[provider]
  switch (provider) {
    case 'gemini': return callGemini(model, prompt)
    case 'openai': return callOpenAI(model, prompt)
    case 'claude': return callClaude(model, prompt)
    case 'ollama': return callOllama(model, prompt)
  }
}

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim()
}

/** Text completion expected to be JSON; strips ``` fences and parses. */
export async function generateJSON<T = any>(provider: RealProvider, prompt: string): Promise<T> {
  const raw = await generateText(provider, prompt)
  return JSON.parse(stripFences(raw)) as T
}
