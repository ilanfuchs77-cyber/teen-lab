import { Router, Request, Response } from 'express'
import { resolveProvider, generateJSON } from '../ai/provider'

export const improveIdeaRouter = Router()

improveIdeaRouter.post('/', async (req: Request, res: Response) => {
  const { ideaText, aiProvider } = req.body
  if (!ideaText || ideaText.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe your idea in a bit more detail.' })
  }

  const provider = resolveProvider(aiProvider)

  const prompt = `You are a startup mentor helping a teenager turn a rough idea into a polished, actionable micro-SaaS concept.

The teenager's raw idea: "${ideaText}"

Your job:
1. Keep the core of their idea but make it sharper, more focused, and more monetizable
2. Give it a great product name (2-3 words)
3. Identify the exact audience who would pay for this
4. Suggest a realistic, beginner-friendly tech stack
5. Be encouraging and practical

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "title": "Polished product name",
  "description": "2-3 sentences describing the improved product clearly and compellingly",
  "targetAudience": "Exact description of who pays for this",
  "monetization": "Specific pricing model and price point",
  "techStack": ["Tool1", "Tool2", "Tool3"],
  "timeToLaunch": "X–Y weeks",
  "potentialEarnings": "$X–$Y/mo",
  "firstStep": "One specific action they can take TODAY to start",
  "whyItWorks": "One sentence explaining the market demand",
  "improvements": "2-3 sentence explanation of what you improved from their original idea and why"
}`

  if (!provider) {
    // Rich mock improvement so the feature still works without an API key
    return res.json({
      title: 'PolishedIdea Pro',
      description: `Your concept of "${ideaText.slice(0, 60)}..." has real potential! We've refined it into a focused digital product with clear monetization — a subscription tool that solves a specific pain point for a niche audience who actively spend money online.`,
      targetAudience: 'Young professionals and students aged 16–28 looking for productivity or creative tools',
      monetization: 'Freemium: free basic tier + $4.99/mo Pro unlock with advanced features',
      techStack: ['React', 'Supabase', 'Tailwind CSS', 'Stripe'],
      timeToLaunch: '3–5 weeks',
      potentialEarnings: '$150–$700/mo',
      firstStep: 'Write a 1-paragraph description of your product as if explaining it to a friend, then share it in 3 relevant Discord servers or subreddits to see if people ask "how do I sign up?"',
      whyItWorks: 'Niche digital tools with tight focus consistently outperform broad apps because users feel like it was built exactly for them.',
      improvements: 'We narrowed the target audience from "everyone" to a specific group, added a clear freemium pricing model, and identified a concrete first step you can take this week without writing any code.',
    })
  }

  try {
    const parsed = await generateJSON(provider, prompt)
    return res.json(parsed)
  } catch (err) {
    console.error('AI error:', err)
    return res.status(500).json({ error: 'AI request failed. Check your API key.' })
  }
})
