import { Router, Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const launchPlanRouter = Router()

let genAI: GoogleGenerativeAI | null = null
function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

const MOCK_PLAN = {
  ideaTitle: 'Your Selected App',
  painPoints: [
    'Existing tools are too expensive or complex for teenagers',
    'No existing solution targets this specific audience with the right UX',
    'Users currently waste time on manual workarounds that your app automates',
  ],
  targetAudience: 'Teens and young adults aged 13–22 who are frustrated with existing solutions',
  uvp: 'The first app built specifically for teens — fast, affordable, and actually fun to use',
  marketingStrategy: [
    'Post a 60-second demo on TikTok and YouTube Shorts — teens discover apps on video',
    'Share in 5 relevant subreddits (target subreddits with 100k+ members in your niche)',
    'DM 20 potential users personally and offer them free access for feedback',
    'Reach out to student-focused newsletters and blogs for a feature',
    'Add "Made by a teen" to your landing page — it gets free press and trust',
  ],
  runningCosts: [
    'Domain + hosting: $0–$15/mo (Vercel free tier + Namecheap domain)',
    'Database: $0/mo (Supabase or PlanetScale free tier)',
    'Payment processor: 2.9% + $0.30 per transaction (Stripe)',
    'AI API costs: $5–$20/mo depending on usage (Gemini or OpenAI)',
    'Total: under $25/mo to run professionally',
  ],
  actionSteps: [
    'Day 1: Write down 5 pain points your app solves and pick the most painful one',
    'Week 1: Build a no-code or coded MVP with just the core feature',
    'Week 2: Share with 5 friends and collect written feedback on what to fix',
    'Week 3: Add payment and launch a simple Carrd or Vercel landing page',
    'Week 4: Post your launch on Reddit, TikTok, and reach out to 10 potential users personally',
    'Month 2: Based on feedback, ship your first major update and double your outreach',
  ],
  estimatedRevenue: 'Realistic range: $50–$300/mo in month 1 growing to $300–$1,500/mo by month 6 with consistent marketing',
}

launchPlanRouter.post('/', async (req: Request, res: Response) => {
  const { idea } = req.body
  if (!idea?.title) {
    return res.status(400).json({ error: 'Missing idea data' })
  }

  const ai = getGenAI()
  if (!ai) {
    return res.json({ ...MOCK_PLAN, ideaTitle: idea.title })
  }

  const prompt = `You are a startup mentor helping a teenager launch their first digital product. Create a friendly, practical, teenager-friendly 1-page business plan.

Product: "${idea.title}"
Description: "${idea.description}"
Tech Stack: ${(idea.techStack ?? []).join(', ')}
Monetization Approach: ${(idea.monetization ?? []).slice(0, 2).join('; ')}

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "ideaTitle": "${idea.title}",
  "painPoints": ["3 specific pain points this product solves"],
  "targetAudience": "Specific description of paying users (age, situation, what they currently do instead)",
  "uvp": "One sentence unique value proposition — what makes this different from alternatives",
  "marketingStrategy": ["5 specific, free/cheap marketing tactics a teenager can execute"],
  "runningCosts": ["4-5 specific monthly cost line items with actual dollar amounts"],
  "actionSteps": ["6 sequential action steps from today to first dollar earned — be very specific"],
  "estimatedRevenue": "Realistic month 1 and month 6 revenue range with brief explanation"
}`

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return res.json(JSON.parse(clean))
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(500).json({ error: 'Failed to generate plan. Check your GEMINI_API_KEY.' })
  }
})
