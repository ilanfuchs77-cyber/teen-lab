import { Router, Request, Response } from 'express'
import { resolveProvider, generateText } from '../ai/provider'

export const codegenPromptRouter = Router()

const MOCK_NOCODE_PROMPT = (title: string, desc: string) => `
Build me a complete, polished web app called "${title}".

WHAT IT DOES:
${desc}

DESIGN REQUIREMENTS:
- Dark mode UI with a modern, clean aesthetic
- Smooth animations and micro-interactions
- Mobile-first responsive design
- Professional color scheme with teal/indigo accents

KEY FEATURES TO BUILD:
1. Landing page with a clear hero section and call-to-action
2. Core product functionality (the main feature users pay for)
3. Simple user onboarding flow
4. Pricing/upgrade page with free and paid tiers
5. Basic settings or profile section

TECH STACK:
- Use Next.js + Tailwind CSS + shadcn/ui components
- Add Framer Motion for smooth animations
- Connect to Supabase for auth and data storage
- Use Stripe for payments (test mode)

IMPORTANT: Make it look like a real, shipped product — not a demo. Include empty states, loading states, and error messages. The UI should be something a teenager would actually want to use.
`.trim()

const MOCK_DEV_PROMPT = (title: string, desc: string, stack: string[]) => `
You are an expert full-stack developer. Build a complete, production-ready web application called "${title}".

PRODUCT DESCRIPTION:
${desc}

TECH STACK TO USE:
${stack.join(', ')}

FULL FEATURE REQUIREMENTS:

1. AUTHENTICATION
   - Email/password sign up and login
   - Persist session using localStorage or Supabase Auth
   - Protected routes that redirect to login if not authenticated

2. CORE PRODUCT FEATURE
   - Build the primary value feature of this app end-to-end
   - Include proper loading, error, and empty states
   - All data must persist (use Supabase or localStorage)

3. MONETIZATION LAYER
   - Free tier with clear feature limits
   - Upgrade prompt when limits are hit
   - Stripe checkout integration (test mode) for premium unlock

4. UI/UX
   - Dark mode using Tailwind CSS with slate-950 background
   - Fully responsive (mobile + desktop)
   - Smooth transitions using Framer Motion
   - Professional typography with Inter font

5. CODE QUALITY
   - TypeScript throughout
   - Proper error boundaries
   - Modular component structure
   - Comments explaining non-obvious logic

Start with the complete file structure, then implement each file with full code. Do not use placeholder comments — write the actual implementation for everything.
`.trim()

codegenPromptRouter.post('/', async (req: Request, res: Response) => {
  const { idea, mode, aiProvider } = req.body
  if (!idea?.title) {
    return res.status(400).json({ error: 'Missing idea data' })
  }

  const provider = resolveProvider(aiProvider)
  if (!provider) {
    const mockPrompt = mode === 'dev'
      ? MOCK_DEV_PROMPT(idea.title, idea.description, idea.techStack ?? [])
      : MOCK_NOCODE_PROMPT(idea.title, idea.description)
    return res.json({ prompt: mockPrompt })
  }

  const isNoCode = mode !== 'dev'

  const systemPrompt = isNoCode
    ? `You are helping a teenager with NO coding experience build their first app using AI tools like v0.dev, bolt.new, or lovable.dev.

Generate a detailed, copy-pasteable prompt they can drop directly into one of those tools to generate their entire app. The prompt should:
- Describe the app's purpose and target user clearly
- List 5–7 specific UI screens/pages to build
- Specify the design style (dark mode, modern, aesthetic)
- Request specific features for monetization (free tier + paid upgrade)
- Ask for mobile-responsive design
- Be written in plain English that the AI builder can understand

Product: "${idea.title}"
Description: "${idea.description}"

Return ONLY the raw prompt text — no JSON, no markdown headers, just the prompt itself that they will copy-paste.`
    : `You are helping a teenage developer build their first SaaS product.

Generate a detailed, technical code-generation prompt they can paste into ChatGPT or Claude to get a complete, working codebase. The prompt should:
- Specify the exact tech stack: ${(idea.techStack ?? []).join(', ')}
- List all features to implement with technical detail
- Request proper auth, database schema, and API routes
- Ask for TypeScript, proper error handling, and responsive UI
- Include Stripe payment integration details
- Be specific enough that the AI generates real, working code

Product: "${idea.title}"
Description: "${idea.description}"

Return ONLY the raw prompt text — no JSON, no markdown headers, just the prompt itself.`

  try {
    const text = await generateText(provider, systemPrompt)
    return res.json({ prompt: text })
  } catch (err) {
    console.error('AI error:', err)
    return res.status(500).json({ error: 'AI request failed. Failed to generate prompt.' })
  }
})
