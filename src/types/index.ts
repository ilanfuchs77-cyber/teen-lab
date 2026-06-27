export interface IdeaCard {
  id: string
  title: string
  tagline: string
  description: string
  category: string
  categoryColor: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  startupCost: string
  timeToLaunch: string
  potentialMonthly: string
  techStack: string[]
  monetization: string[]
  skills: string[]
  roadmap: string[]
  icon: string
}

export interface GeneratedIdea {
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

export interface LaunchTask {
  id: string
  category: 'Planning' | 'Development' | 'Marketing' | 'Operations'
  task: string
  completed: boolean
}

export interface BusinessPlan {
  ideaTitle: string
  painPoints: string[]
  targetAudience: string
  uvp: string
  marketingStrategy: string[]
  runningCosts: string[]
  actionSteps: string[]
  estimatedRevenue: string
}

export type Tab = 'discover' | 'simulator' | 'generator' | 'planner'

export type MonetizationModel =
  | 'ads'
  | 'freemium'
  | 'one-time'
  | 'subscription'
  | 'marketplace'
