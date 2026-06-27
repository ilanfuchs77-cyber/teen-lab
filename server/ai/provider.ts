/**
 * Unified AI provider layer.
 *
 * The app can be backed by Google Gemini, OpenAI, or Anthropic Claude — the
 * user picks which one in the UI, and the chosen provider id arrives on each
 * request as `aiProvider`. We talk to every provider over its plain REST API
 * with the built-in `fetch`, so no extra SDKs are needed and the same code
 * runs under tsx (dev), esbuild (desktop), and Vercel serverless.
 *
 * If the chosen provider has no API key configured, callers fall back to their
 * existing rich mock data, so every feature keeps working with zero setup.
 */

export type AIProvider = 'auto' | 'gemini' | 'openai' | 'claude'
export type RealProvider = Exclude<AIProvider, 'auto'>

export interface ProviderInfo {
  id: RealProvider
  label: string
  company: string
  model: string
  envKey: string
}

export const PROVIDER_INFO: Record<RealProvider, ProviderInfo> = {
  gemini: { id: 'gemini', label: 'Gemini',  company: 'Google',    model: 'gemini-1.5-flash',        envKey: 'GEMINI_API_KEY' },
  openai: { id: 'openai', label: 'GPT',     company: 'OpenAI',    model: 'gpt-4o-mini',             envKey: 'OPENAI_API_KEY' },
  claude: { id: 'claude', label: 'Claude',  company: 'Anthropic', model: 'claude-3-5-haiku-latest', envKey: 'ANTHROPIC_API_KEY' },
}

// Order used when resolving 'auto' — first one with a key wins.
const RESOLUTION_ORDER: RealProvider[] = ['claude', 'openai', 'gemini']

export function isConfigured(p: RealProvider): boolean {
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

/** Raw text completion from a specific, already-resolved provider. */
export async function generateText(provider: RealProvider, prompt: string): Promise<string> {
  const { model } = PROVIDER_INFO[provider]
  switch (provider) {
    case 'gemini': return callGemini(model, prompt)
    case 'openai': return callOpenAI(model, prompt)
    case 'claude': return callClaude(model, prompt)
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
