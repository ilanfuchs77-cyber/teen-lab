// Shared AI-provider metadata for the frontend. The `id` values must match
// what the backend's resolveProvider() understands (see server/ai/provider.ts).

export type AIProvider = 'auto' | 'gemini' | 'openai' | 'claude'

export interface AIProviderMeta {
  id: AIProvider
  label: string
  company: string
  blurb: string
  /** Tailwind text color used for the provider's accent dot/label. */
  accent: string
}

export const AI_PROVIDERS: AIProviderMeta[] = [
  { id: 'auto',   label: 'Smart Auto', company: 'Best available', blurb: 'Automatically uses whichever AI is connected.',        accent: 'text-teal-300' },
  { id: 'gemini', label: 'Gemini',     company: 'Google',         blurb: 'Fast, great at structured product ideas.',             accent: 'text-sky-300' },
  { id: 'openai', label: 'GPT',        company: 'OpenAI',         blurb: 'Creative and well-rounded for brainstorming.',         accent: 'text-emerald-300' },
  { id: 'claude', label: 'Claude',     company: 'Anthropic',      blurb: 'Thoughtful and detailed launch plans.',                accent: 'text-orange-300' },
]

export function providerMeta(id: AIProvider): AIProviderMeta {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0]
}

/** Short label for the AI currently doing the work, used in loading text. */
export function thinkingLabel(id: AIProvider): string {
  return id === 'auto' ? 'AI' : providerMeta(id).label
}
