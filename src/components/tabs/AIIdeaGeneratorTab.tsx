import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Loader2,
  Clock,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Code2,
  Target,
  Zap,
  PenLine,
  Wand2,
  ChevronRight,
} from 'lucide-react'
import { GeneratedIdea, MonetizationModel } from '../../types'
import { useAIProvider } from '../../context/AIProviderContext'
import { thinkingLabel } from '../../lib/ai'

const SKILLS = ['Design', 'Writing', 'Basic Code', 'Video Editing', 'Marketing', 'Photography', 'Music']
const INTERESTS = ['Gaming', 'Productivity', 'Sports', 'Art', 'Music', 'Study/School', 'Fashion', 'Fitness', 'Tech', 'Food']
const TIME_OPTIONS = ['5–10 hours/week', '10–20 hours/week', '20–30 hours/week', '30+ hours/week']
const MONETIZATION_OPTIONS: { value: MonetizationModel; label: string; emoji: string }[] = [
  { value: 'freemium',     label: 'Freemium',            emoji: '⚡' },
  { value: 'one-time',    label: 'One-Time Purchase',   emoji: '💳' },
  { value: 'subscription', label: 'Subscription',        emoji: '🔄' },
  { value: 'ads',          label: 'Ad Revenue',           emoji: '📢' },
  { value: 'marketplace',  label: 'Marketplace/Gig',     emoji: '🛒' },
]

interface ImprovedIdea extends GeneratedIdea {
  improvements?: string
}

function ToggleChip({ label, selected, onToggle, color = 'teal' }: {
  label: string; selected: boolean; onToggle: () => void; color?: 'teal' | 'purple' | 'indigo'
}) {
  const colors = {
    teal:   selected ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'   : 'bg-white/8 border-white/12 text-slate-400 hover:border-teal-500/40 hover:text-teal-400',
    purple: selected ? 'bg-purple-500/20 border-purple-500/60 text-purple-300' : 'bg-white/8 border-white/12 text-slate-400 hover:border-purple-500/40 hover:text-purple-400',
    indigo: selected ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300' : 'bg-white/8 border-white/12 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400',
  }[color]
  return (
    <button onClick={onToggle} className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all duration-150 ${colors}`}>
      {label}
    </button>
  )
}

function IdeaResultCard({ idea, index, onGoToPlanner, accent }: {
  idea: GeneratedIdea; index: number; onGoToPlanner: () => void; accent?: 'teal' | 'purple' | 'indigo'
}) {
  const idx = accent === 'teal' ? 0 : accent === 'purple' ? 1 : accent === 'indigo' ? 2 : index % 3
  const gradients = [
    'from-teal-500/10 to-transparent border-teal-500/30',
    'from-purple-500/10 to-transparent border-purple-500/30',
    'from-indigo-500/10 to-transparent border-indigo-500/30',
  ]
  const textColors = ['text-teal-400', 'text-purple-400', 'text-indigo-400']
  const btnColors = [
    'bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20',
    'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
    'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20',
  ]

  const improvedIdea = idea as ImprovedIdea

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`card-base border bg-gradient-to-br ${gradients[idx]} overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${textColors[idx]}`}>
              {accent ? '✨ Polished Idea' : `Idea #${index + 1}`}
            </div>
            <h3 className="text-lg font-bold text-slate-100">{idea.title}</h3>
          </div>
          <span className={`font-mono text-sm font-bold ${textColors[idx]} bg-white/8 px-2.5 py-1 rounded-lg border border-white/12 whitespace-nowrap`}>
            {idea.potentialEarnings}
          </span>
        </div>

        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{idea.description}</p>

        {improvedIdea.improvements && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4">
            <div className="text-xs text-indigo-400 font-semibold mb-1">🔧 What we improved</div>
            <p className="text-sm text-slate-300">{improvedIdea.improvements}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/8 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1"><Target size={12} className="text-slate-400" /><span className="text-xs text-slate-400 font-medium">Target Audience</span></div>
            <p className="text-sm text-slate-200">{idea.targetAudience}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1"><Clock size={12} className="text-slate-400" /><span className="text-xs text-slate-400 font-medium">Time to Launch</span></div>
            <p className="text-sm text-slate-200">{idea.timeToLaunch}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1"><DollarSign size={12} className="text-slate-400" /><span className="text-xs text-slate-400 font-medium">Monetization</span></div>
            <p className="text-sm text-slate-200">{idea.monetization}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1"><Zap size={12} className="text-slate-400" /><span className="text-xs text-slate-400 font-medium">Why It Works</span></div>
            <p className="text-sm text-slate-200">{idea.whyItWorks}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2"><Code2 size={12} className="text-slate-400" /><span className="text-xs text-slate-400 font-medium">Tech / Tools</span></div>
          <div className="flex flex-wrap gap-1.5">
            {idea.techStack.map((tech) => (
              <span key={tech} className="text-xs bg-white/8 border border-white/12 text-slate-300 px-2 py-0.5 rounded font-mono">{tech}</span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/12 rounded-lg p-3 mb-4">
          <div className="text-xs text-slate-400 font-medium mb-1">🚀 First Step to Take Today</div>
          <p className="text-sm text-slate-200">{idea.firstStep}</p>
        </div>

        <button
          onClick={onGoToPlanner}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${btnColors[idx]}`}
        >
          Plan This in My Planner <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ── Polish My Idea Panel ─────────────────────────────────────────────────────

function PolishIdeaPanel({ onGoToPlanner }: { onGoToPlanner: () => void }) {
  const { provider } = useAIProvider()
  const [ideaText, setIdeaText] = useState('')
  const [result, setResult] = useState<ImprovedIdea | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function polishIdea() {
    if (ideaText.trim().length < 5) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/improve-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: ideaText.trim(), aiProvider: provider }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server error ${res.status}`)
      setResult(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = ideaText.trim().length >= 5 && !loading

  return (
    <div className="card-base border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-1">
        <Wand2 size={16} className="text-purple-400" />
        <h3 className="font-semibold text-slate-200">Polish My Own Idea</h3>
        <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">AI Improver</span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Already have an idea? Describe it in plain English and AI will sharpen it, name it, and give you a full plan — only if it needs improving.
      </p>

      <textarea
        rows={3}
        value={ideaText}
        onChange={(e) => setIdeaText(e.target.value)}
        placeholder="e.g. An app where students can find study partners near them who are taking the same classes..."
        className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-colors resize-none leading-relaxed mb-3"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/45">
          {ideaText.trim().length < 5
            ? 'Describe your idea to continue'
            : `${ideaText.trim().length} chars — ready to polish ✓`}
        </div>
        <button
          onClick={polishIdea}
          disabled={!canSubmit}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 shadow-purple'
              : 'bg-white/8 text-white/45 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          {loading ? 'Polishing...' : 'Polish This Idea'}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 flex gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <IdeaResultCard idea={result} index={0} onGoToPlanner={onGoToPlanner} accent="purple" />
        </motion.div>
      )}
    </div>
  )
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

interface Props { onGoToPlanner: () => void }

export default function AIIdeaGeneratorTab({ onGoToPlanner }: Props) {
  const { provider } = useAIProvider()
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [timeCommitment, setTimeCommitment] = useState(TIME_OPTIONS[1])
  const [hasCodingKnowledge, setHasCodingKnowledge] = useState(false)
  const [monetization, setMonetization] = useState<MonetizationModel>('freemium')
  const [customSkill, setCustomSkill] = useState('')
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = <T,>(arr: T[], item: T) => arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  async function generateIdeas() {
    setLoading(true); setError(null); setIdeas([])
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: customSkill ? [...skills, customSkill] : skills,
          interests, timeCommitment, hasCodingKnowledge, monetizationModel: monetization,
          aiProvider: provider,
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server error ${res.status}`)
      setIdeas((await res.json()).ideas)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = skills.length > 0 || interests.length > 0 || customSkill.trim()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">✨ AI Idea Generator</h2>
        <p className="text-slate-400">
          Let AI match ideas to your profile — or write your own idea and have it polished into a full product plan.
        </p>
      </div>

      {/* ── Polish My Idea — prominent at top ─────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <PenLine size={14} className="text-purple-400" />
          <span className="text-sm font-semibold text-slate-300">Have an idea already? Let AI make it better</span>
          <ChevronRight size={13} className="text-white/35" />
        </div>
        <PolishIdeaPanel onGoToPlanner={onGoToPlanner} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-white/35 uppercase tracking-widest font-semibold">or generate ideas from your profile</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* ── Profile-Based Generator ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base p-5 space-y-6">
            {/* Skills */}
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-3">
                Your Skills <span className="text-white/45 font-normal">(pick all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <ToggleChip key={s} label={s} selected={skills.includes(s)} onToggle={() => setSkills(toggle(skills, s))} color="teal" />
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="+ Add custom skill (e.g. 3D Modeling)"
                  className="w-full bg-white/8 border border-white/12 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-3">Interests & Hobbies</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <ToggleChip key={i} label={i} selected={interests.includes(i)} onToggle={() => setInterests(toggle(interests, i))} color="purple" />
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-3">Weekly Time Available</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t} onClick={() => setTimeCommitment(t)}
                    className={`text-sm px-3 py-2 rounded-lg border transition-all duration-150 font-medium text-left ${
                      timeCommitment === t
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300'
                        : 'bg-white/8 border-white/12 text-slate-400 hover:border-indigo-500/40'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Coding toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-300">I can write code</div>
                <div className="text-xs text-white/45">Turn off for no-code/low-code ideas</div>
              </div>
              <button
                onClick={() => setHasCodingKnowledge(!hasCodingKnowledge)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${hasCodingKnowledge ? 'bg-teal-500' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasCodingKnowledge ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Monetization */}
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-3">Preferred Monetization</label>
              <div className="space-y-2">
                {MONETIZATION_OPTIONS.map((m) => (
                  <button
                    key={m.value} onClick={() => setMonetization(m.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all duration-150 ${
                      monetization === m.value
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-200'
                        : 'bg-white/8 border-white/12 text-slate-400 hover:border-purple-500/30'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateIdeas}
              disabled={loading || !canGenerate}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                canGenerate && !loading
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:opacity-90 glow-teal'
                  : 'bg-white/8 text-white/45 cursor-not-allowed'
              }`}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />{thinkingLabel(provider)} is thinking...</> : <><Sparkles size={16} />Generate Matched Ideas</>}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-red-400 mb-1">Generation Failed</div>
                  <div className="text-sm text-red-300/80">{error}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {ideas.length === 0 && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-slate-300 font-semibold mb-2">Your matched ideas will appear here</h3>
              <p className="text-white/45 text-sm max-w-sm">
                Select your skills and interests, then click Generate. Or use the "Polish My Idea" box above to start from your own concept.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={24} className="text-teal-400 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-300 font-semibold">{thinkingLabel(provider)} AI is crafting your ideas...</p>
              <p className="text-white/45 text-sm mt-2">Analyzing your skills and matching opportunities</p>
            </div>
          )}

          {ideas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-teal-400" />
                <span className="text-sm text-slate-400">{ideas.length} ideas matched to your profile</span>
              </div>
              {ideas.map((idea, i) => (
                <IdeaResultCard key={i} idea={idea} index={i} onGoToPlanner={onGoToPlanner} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
