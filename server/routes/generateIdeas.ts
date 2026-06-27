import { Router, Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const generateIdeasRouter = Router()

let genAI: GoogleGenerativeAI | null = null
function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

interface MockIdea {
  title: string
  description: string
  targetAudience: string
  monetization: string
  techStack: string[]
  timeToLaunch: string
  potentialEarnings: string
  firstStep: string
  whyItWorks: string
}

// A pool of idea templates keyed loosely by interest. Earnings are
// generated dynamically so no two ideas ever show the same number.
const IDEA_POOL: (Omit<MockIdea, 'potentialEarnings' | 'techStack' | 'timeToLaunch'> & {
  tags: string[]
  base: number // base monthly earning floor in $
  nocodeStack: string[]
  devStack: string[]
})[] = [
  {
    title: 'StudySync Dashboard',
    description: 'A personal study tracker that syncs your subjects, goals, and daily progress. Students love tracking streaks and visualizing their improvement over time.',
    targetAudience: 'High school and college students aged 14–22',
    monetization: 'Free basic tracker + $3.99/mo Premium with smart study suggestions',
    firstStep: 'Sketch out the 5 key features your tracker must have before touching code.',
    whyItWorks: 'Every student needs to track study time, and existing apps are too complex or not visual enough for teens.',
    tags: ['Study/School', 'Productivity', 'Tech'],
    base: 120,
    nocodeStack: ['Glide', 'Google Sheets', 'Canva'],
    devStack: ['React', 'Supabase', 'Chart.js'],
  },
  {
    title: 'GameClip Highlights Bot',
    description: 'A Discord bot that auto-shares curated gaming clip highlights in servers with upvote ranking. Server owners pay for premium analytics and custom branding.',
    targetAudience: 'Gaming Discord server owners with 100+ members',
    monetization: 'Free under 500 members, $4.99/mo for premium analytics',
    firstStep: 'Create a Discord Developer account and send a "Hello World" message to a test server.',
    whyItWorks: 'Gaming communities crave engagement tools, and active server owners will pay to keep members active.',
    tags: ['Gaming', 'Tech'],
    base: 220,
    nocodeStack: ['BotGhost', 'Airtable', 'Zapier'],
    devStack: ['Node.js', 'Discord.js', 'MongoDB'],
  },
  {
    title: 'MoodPalette Journal',
    description: 'A color-coded daily mood and journal app. Each mood maps to a palette that builds a visual calendar of your emotional landscape over months.',
    targetAudience: 'Teens aged 13–24 into mental wellness and aesthetics',
    monetization: '$2.99 one-time unlock for color themes and PDF export',
    firstStep: 'Design your color-to-mood mapping system in Figma — it is the core UX of the whole app.',
    whyItWorks: 'Wellness apps for teens are exploding, and a visual approach beats plain journaling for the TikTok generation.',
    tags: ['Art', 'Productivity', 'Fashion'],
    base: 90,
    nocodeStack: ['Glide', 'Notion', 'Canva'],
    devStack: ['React Native', 'Expo', 'AsyncStorage'],
  },
  {
    title: 'BeatLoop Sampler',
    description: 'A web app that lets bedroom producers chop, loop, and preview royalty-free samples in the browser, then export a starter project. Sell sample packs on top.',
    targetAudience: 'Teen music producers using FL Studio, GarageBand, or Ableton',
    monetization: 'Free preview, $5.99/mo for unlimited exports + monthly pack drops',
    firstStep: 'Record or collect 20 royalty-free one-shot samples and organize them into a folder.',
    whyItWorks: 'Young producers constantly hunt for fresh sounds, and a browser tool removes all friction.',
    tags: ['Music', 'Art'],
    base: 150,
    nocodeStack: ['Gumroad', 'Bandlab', 'Canva'],
    devStack: ['React', 'Web Audio API', 'Vercel'],
  },
  {
    title: 'FitStreak Coach',
    description: 'A gamified workout-streak app where teens log quick home workouts and earn badges. Friends compete on weekly leaderboards to stay consistent.',
    targetAudience: 'Teens aged 14–20 starting their fitness journey at home',
    monetization: 'Free core app, $3.49/mo for custom workout plans and badge packs',
    firstStep: 'List 15 no-equipment exercises and group them into beginner, medium, and hard.',
    whyItWorks: 'Consistency is the #1 fitness problem, and gamification with friends solves it better than any plain tracker.',
    tags: ['Fitness', 'Sports', 'Productivity'],
    base: 110,
    nocodeStack: ['Glide', 'Airtable', 'Canva'],
    devStack: ['React Native', 'Firebase', 'Expo'],
  },
  {
    title: 'SnapCaption AI',
    description: 'Paste a photo description or video idea and instantly get viral-ready captions and hashtag sets tuned to your niche. Built for creators who post daily.',
    targetAudience: 'Teen content creators on TikTok and Instagram',
    monetization: 'Free 5/day, $4.99/mo unlimited with saved tone presets',
    firstStep: 'Write down the 4 caption "tones" you want to support: Funny, Aesthetic, Hype, Educational.',
    whyItWorks: 'Creators post daily but hate writing captions — a fast generator saves them real time every single day.',
    tags: ['Marketing', 'Writing', 'Fashion', 'Tech'],
    base: 180,
    nocodeStack: ['Carrd', 'Zapier', 'OpenAI plugin'],
    devStack: ['React', 'Gemini API', 'Vercel'],
  },
  {
    title: 'SnackPlan Weekly',
    description: 'An AI meal/snack planner that takes your budget and taste and spits out a week of cheap, easy recipes plus a grocery list. Affiliate links monetize it.',
    targetAudience: 'Students and broke teens who want to eat better cheaply',
    monetization: 'Free 3 plans/mo, $2.99/mo unlimited + grocery affiliate commissions',
    firstStep: 'Write a single prompt that turns "budget + diet" into a 7-day plan and test it by hand.',
    whyItWorks: 'Eating cheap and healthy is a universal student pain point with strong affiliate upside.',
    tags: ['Food', 'Productivity'],
    base: 80,
    nocodeStack: ['Carrd', 'Notion', 'OpenAI plugin'],
    devStack: ['React', 'Gemini API', 'Vercel'],
  },
  {
    title: 'SnapPort Folio',
    description: 'A drag-and-drop portfolio builder for teen photographers and designers, with aesthetic templates and a one-click shareable link. No coding needed.',
    targetAudience: 'Teen photographers, artists, and designers building a first portfolio',
    monetization: 'Free 1 page, $3.99/mo for custom domains + premium templates',
    firstStep: 'Collect your 10 best pieces of work and decide the 3 layout styles you want to offer.',
    whyItWorks: 'Young creatives need a polished online presence, and existing builders feel corporate and boring.',
    tags: ['Photography', 'Design', 'Art', 'Fashion'],
    base: 100,
    nocodeStack: ['Carrd', 'Webflow', 'Canva'],
    devStack: ['React', 'Supabase', 'Tailwind CSS'],
  },
]

// Deterministic-ish hash so the same profile gives stable-but-varied results
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

function buildMockIdeas(
  skills: string[],
  interests: string[],
  timeCommitment: string,
  hasCodingKnowledge: boolean
): MockIdea[] {
  const profile = [...skills, ...interests]
  const seed = hashString(profile.join('|') + timeCommitment + hasCodingKnowledge)

  // Score each idea by how well its tags overlap the chosen interests/skills
  const scored = IDEA_POOL.map((idea, idx) => {
    const overlap = idea.tags.filter((t) => profile.includes(t)).length
    // tie-break with seed so unmatched profiles still vary
    const jitter = ((seed >> idx) & 7)
    return { idea, idx, score: overlap * 10 + jitter }
  }).sort((a, b) => b.score - a.score)

  // More time available → higher earning multiplier
  const timeMult =
    timeCommitment?.startsWith('30') ? 3.0 :
    timeCommitment?.startsWith('20') ? 2.2 :
    timeCommitment?.startsWith('10') ? 1.6 : 1.0
  // Coding ability unlocks higher-ceiling products
  const codeMult = hasCodingKnowledge ? 1.4 : 1.0

  const top = scored.slice(0, 3)

  return top.map(({ idea, idx }, rank) => {
    // Each idea gets a distinct earning range driven by its base + profile
    const wiggle = ((seed >> (rank * 3)) & 15) // 0–15
    const floor = Math.round(((idea.base + wiggle * 12) * timeMult * codeMult) / 10) * 10
    const ceil = Math.round((floor * (2.4 + (wiggle % 5) * 0.15)) / 10) * 10
    const weeks = hasCodingKnowledge ? 2 + (idx % 3) : 1 + (idx % 2)

    return {
      title: idea.title,
      description: idea.description,
      targetAudience: idea.targetAudience,
      monetization: idea.monetization,
      techStack: hasCodingKnowledge ? idea.devStack : idea.nocodeStack,
      timeToLaunch: `${weeks}–${weeks + 2} weeks`,
      potentialEarnings: `$${floor.toLocaleString()}–$${ceil.toLocaleString()}/mo`,
      firstStep: idea.firstStep,
      whyItWorks: idea.whyItWorks,
    }
  })
}

generateIdeasRouter.post('/', async (req: Request, res: Response) => {
  const { skills, interests, timeCommitment, hasCodingKnowledge, monetizationModel } = req.body

  const ai = getGenAI()
  if (!ai) {
    const ideas = buildMockIdeas(
      skills ?? [],
      interests ?? [],
      timeCommitment ?? '10–20 hours/week',
      !!hasCodingKnowledge
    )
    return res.json({ ideas, mock: true })
  }

  const prompt = `You are an expert startup mentor helping a teenager build their first digital product to make money online.

Based on the following profile, generate exactly 3 highly specific, achievable micro-SaaS or digital product ideas:

Profile:
- Skills: ${(skills ?? []).join(', ') || 'None specified'}
- Interests & Hobbies: ${(interests ?? []).join(', ') || 'None specified'}
- Weekly Time Available: ${timeCommitment || '10–20 hours/week'}
- Has Coding Knowledge: ${hasCodingKnowledge ? 'Yes (can write real code)' : 'No (needs no-code or low-code tools like Glide, Webflow, Gumroad, Carrd, Notion)'}
- Preferred Monetization: ${monetizationModel || 'freemium'}

Rules:
- Ideas must be REAL software products or digital assets (NOT freelancing or gig work)
- Each idea must be achievable by a teenager within the stated time commitment
- Match ideas closely to their skills and interests
- If hasCodingKnowledge is false, suggest no-code tools (Glide, Webflow, Gumroad, Carrd, Notion databases, etc.)
- Ideas should have clear monetization paths

Return ONLY a valid JSON object in this exact format (no markdown, no backticks, just raw JSON):
{
  "ideas": [
    {
      "title": "Product name (2-3 words)",
      "description": "2-3 sentence description of what it is and why teens would use it",
      "targetAudience": "Specific description of who would pay for this",
      "monetization": "Exact pricing strategy and revenue model",
      "techStack": ["Tool1", "Tool2", "Tool3"],
      "timeToLaunch": "X–Y weeks",
      "potentialEarnings": "$X–$Y/mo",
      "firstStep": "Single specific action they can take TODAY to start",
      "whyItWorks": "One sentence explaining why this idea has real market demand"
    }
  ]
}`

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(clean)
    return res.json(parsed)
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(500).json({ error: 'AI generation failed. Make sure your GEMINI_API_KEY is valid.' })
  }
})
