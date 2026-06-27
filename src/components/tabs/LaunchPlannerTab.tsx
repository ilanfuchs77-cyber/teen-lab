import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Loader2,
  FileText,
  Code2,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Rocket,
  Megaphone,
  Settings,
  Lightbulb,
  PenLine,
} from 'lucide-react'
import { LaunchTask, BusinessPlan } from '../../types'
import { IDEAS } from '../../data/ideas'

const STORAGE_KEY = 'teen-app-lab-tasks'

const DEFAULT_TASKS: LaunchTask[] = [
  { id: 'p1', category: 'Planning', task: 'Define your core value proposition in one sentence', completed: false },
  { id: 'p2', category: 'Planning', task: 'Research 3 competitor apps and note their weaknesses', completed: false },
  { id: 'p3', category: 'Planning', task: 'Identify your target user and write a user persona', completed: false },
  { id: 'p4', category: 'Planning', task: 'Set a launch date 4 weeks from today', completed: false },
  { id: 'd1', category: 'Development', task: 'Build a working MVP (minimum viable product)', completed: false },
  { id: 'd2', category: 'Development', task: 'Test on 3 real users and note feedback', completed: false },
  { id: 'd3', category: 'Development', task: 'Set up payments (Stripe, Gumroad, or Patreon)', completed: false },
  { id: 'd4', category: 'Development', task: 'Deploy to production (Vercel, Railway, or App Store)', completed: false },
  { id: 'm1', category: 'Marketing', task: 'Create a simple landing page explaining the product', completed: false },
  { id: 'm2', category: 'Marketing', task: 'Post in 3 relevant subreddits or Discord servers', completed: false },
  { id: 'm3', category: 'Marketing', task: 'Make a 60-second TikTok or YouTube Short demo', completed: false },
  { id: 'm4', category: 'Marketing', task: 'DM 10 potential users personally and ask for feedback', completed: false },
  { id: 'o1', category: 'Operations', task: 'Set up a support email or contact form', completed: false },
  { id: 'o2', category: 'Operations', task: 'Write a simple privacy policy using a free generator', completed: false },
  { id: 'o3', category: 'Operations', task: 'Track revenue weekly in a simple spreadsheet', completed: false },
  { id: 'o4', category: 'Operations', task: 'Plan your first update/feature based on user feedback', completed: false },
]

const CATEGORY_META = {
  Planning:    { icon: Lightbulb, color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   bar: 'bg-teal-500' },
  Development: { icon: Code2,     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', bar: 'bg-purple-500' },
  Marketing:   { icon: Megaphone, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', bar: 'bg-indigo-500' },
  Operations:  { icon: Settings,  color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', bar: 'bg-orange-500' },
} as const

type Category = keyof typeof CATEGORY_META

// Shared idea shape passed to AI panels
interface ActiveIdea {
  title: string
  description: string
  techStack: string[]
  monetization: string[]
}

// ─── TaskList ────────────────────────────────────────────────────────────────

function TaskList({ category, tasks, onToggle, onDelete, onAdd }: {
  category: Category
  tasks: LaunchTask[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (task: string) => void
}) {
  const [newTask, setNewTask] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const meta = CATEGORY_META[category]
  const Icon = meta.icon
  const done = tasks.filter((t) => t.completed).length

  return (
    <div className={`card-base border ${meta.border} overflow-hidden`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center justify-between px-4 py-3 ${meta.bg}`}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={meta.color} />
          <span className={`font-semibold text-sm ${meta.color}`}>{category}</span>
          <span className="text-xs text-white/45 font-normal">{done}/{tasks.length} done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
              style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : '0%' }}
            />
          </div>
          {collapsed
            ? <ChevronDown size={14} className="text-slate-400" />
            : <ChevronUp size={14} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                    {task.completed
                      ? <CheckCircle2 size={16} className="text-teal-500" />
                      : <Circle size={16} className="text-white/35 group-hover:text-slate-400" />}
                  </button>
                  <span className={`flex-1 text-sm leading-relaxed transition-colors ${task.completed ? 'text-white/45 line-through' : 'text-slate-300'}`}>
                    {task.task}
                  </span>
                  <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/35 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTask.trim()) { onAdd(newTask.trim()); setNewTask('') }
                  }}
                  placeholder={`Add ${category} task...`}
                  className="flex-1 bg-white/8 border border-white/12 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
                <button
                  onClick={() => { if (newTask.trim()) { onAdd(newTask.trim()); setNewTask('') } }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-teal-500/20 transition-colors"
                >
                  <Plus size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── BusinessPlanPanel ───────────────────────────────────────────────────────

function BusinessPlanPanel({ idea }: { idea: ActiveIdea | null }) {
  const [plan, setPlan] = useState<BusinessPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setPlan(null); setError(null) }, [idea?.title])

  async function buildPlan() {
    if (!idea) return
    setLoading(true); setError(null); setPlan(null)
    try {
      const res = await fetch('/api/launch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server error ${res.status}`)
      setPlan(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-teal-400" />
          <h3 className="font-semibold text-slate-200">1-Page Lean Startup Plan</h3>
        </div>
        <button
          onClick={buildPlan}
          disabled={!idea || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            idea && !loading
              ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:opacity-90'
              : 'bg-white/8 text-white/45 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Building...' : 'Build Plan'}
        </button>
      </div>

      {!idea && <p className="text-xs text-white/45 mb-3">Select or describe an idea above to generate your plan.</p>}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h4 className="text-base font-bold text-gradient-teal">{plan.ideaTitle} — Business Plan</h4>
          {[
            { label: '🎯 Pain Points Solved', items: plan.painPoints, color: 'teal' },
            { label: '📣 Marketing Strategy', items: plan.marketingStrategy, color: 'indigo' },
            { label: '💸 Running Costs', items: plan.runningCosts, color: 'purple' },
            { label: '🚀 Action Steps', items: plan.actionSteps, color: 'teal' },
          ].map(({ label, items, color }) => (
            <div key={label}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${color === 'teal' ? 'bg-teal-500' : color === 'indigo' ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/8 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">👥 Target Audience</div>
              <div className="text-sm text-slate-200">{plan.targetAudience}</div>
            </div>
            <div className="bg-white/8 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">💡 Unique Value Prop</div>
              <div className="text-sm text-slate-200">{plan.uvp}</div>
            </div>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
            <div className="text-xs text-teal-400 font-semibold mb-1">📈 Revenue Estimate</div>
            <div className="text-sm text-slate-200">{plan.estimatedRevenue}</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── CodegenPanel ─────────────────────────────────────────────────────────────

function CodegenPanel({ idea }: { idea: ActiveIdea | null }) {
  const [mode, setMode] = useState<'nocode' | 'dev'>('nocode')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setPrompt(''); setError(null) }, [idea?.title])

  async function generatePrompt() {
    if (!idea) return
    setLoading(true); setError(null); setPrompt('')
    try {
      const res = await fetch('/api/codegen-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, mode }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server error ${res.status}`)
      setPrompt((await res.json()).prompt)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function copyPrompt() {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-1">
        <Code2 size={16} className="text-purple-400" />
        <h3 className="font-semibold text-slate-200">Code-Gen & No-Code Prompt Workbench</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Generate a ready-to-paste prompt for v0, Bolt, Lovable, or ChatGPT to build your app instantly.
      </p>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'nocode', label: '🎨 Zero-Code Creator', sub: 'v0 / Bolt / Lovable' },
          { value: 'dev',    label: '💻 Developer Code',    sub: 'React / TypeScript' },
        ].map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value as 'nocode' | 'dev')}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
              mode === m.value
                ? 'bg-purple-500/15 border-purple-500/50 text-purple-200'
                : 'bg-white/8 border-white/12 text-slate-400 hover:border-purple-500/30'
            }`}
          >
            <div className="font-semibold">{m.label}</div>
            <div className="text-xs opacity-60">{m.sub}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={generatePrompt}
          disabled={!idea || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            idea && !loading
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90'
              : 'bg-white/8 text-white/45 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Generate Prompt
        </button>
      </div>

      {!idea && <p className="text-xs text-white/45 mb-3">Select or describe an idea above first.</p>}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {prompt && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative">
            <div className="absolute top-2 right-2">
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-white/8 border border-white/12 rounded-xl p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-auto max-h-80 leading-relaxed pt-10">
              {prompt}
            </pre>
          </div>
          <p className="text-xs text-white/45 mt-2">
            Paste into {mode === 'nocode' ? 'v0.dev, bolt.new, or lovable.dev' : 'ChatGPT or Claude'} to generate your app.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Tab ────────────────────────────────────────────────────────────────

interface Props {
  selectedIdeaId: string | null
}

export default function LaunchPlannerTab({ selectedIdeaId: initialIdeaId }: Props) {
  const [activeIdeaId, setActiveIdeaId] = useState(initialIdeaId ?? '')
  const [customIdeaText, setCustomIdeaText] = useState('')

  useEffect(() => {
    if (initialIdeaId) { setActiveIdeaId(initialIdeaId); setCustomIdeaText('') }
  }, [initialIdeaId])

  const [tasks, setTasks] = useState<LaunchTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_TASKS
    } catch { return DEFAULT_TASKS }
  })

  const persist = useCallback((updated: LaunchTask[]) => {
    setTasks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [])

  function toggleTask(id: string) { persist(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)) }
  function deleteTask(id: string) { persist(tasks.filter((t) => t.id !== id)) }
  function addTask(category: Category, taskText: string) {
    persist([...tasks, { id: `custom-${Date.now()}`, category, task: taskText, completed: false }])
  }

  const totalDone = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const overallPct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0
  const categories: Category[] = ['Planning', 'Development', 'Marketing', 'Operations']

  // Derive the active idea object passed to AI panels
  const curatedIdea = IDEAS.find((i) => i.id === activeIdeaId)
  const activeIdea: ActiveIdea | null = curatedIdea
    ? { title: curatedIdea.title, description: curatedIdea.description, techStack: curatedIdea.techStack, monetization: curatedIdea.monetization }
    : customIdeaText.trim().length > 3
      ? { title: customIdeaText.trim(), description: customIdeaText.trim(), techStack: [], monetization: [] }
      : null

  // Label shown in the confirmation banner
  const activeLabel = curatedIdea ? `${curatedIdea.icon} ${curatedIdea.title}` : customIdeaText.trim() || null

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">📋 My Launch Planner</h2>
            <p className="text-slate-400">
              Pick or describe your idea, then track tasks, generate a startup plan, and get a build prompt.
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-mono text-3xl font-bold text-gradient-teal">{overallPct}%</div>
            <div className="text-xs text-white/45">{totalDone}/{totalTasks} tasks done</div>
          </div>
        </div>

        {/* ── Idea Picker ─────────────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/12 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={14} className="text-teal-400" />
            <span className="text-sm font-semibold text-slate-300">Which idea are you building?</span>
            {activeIdeaId && (
              <span className="ml-auto text-xs text-white/45">Click again to deselect</span>
            )}
          </div>

          {/* Curated idea grid — click same idea to toggle off */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {IDEAS.map((idea) => {
              const isActive = activeIdeaId === idea.id
              return (
                <motion.button
                  key={idea.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveIdeaId((prev) => prev === idea.id ? '' : idea.id)
                    if (activeIdeaId !== idea.id) setCustomIdeaText('')
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-500/15 border-teal-500/50 text-teal-200 glow-teal'
                      : 'bg-white/8 border-white/12 text-slate-400 hover:border-white/25 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{idea.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{idea.title}</div>
                    <div className="text-xs opacity-60 truncate">{idea.category}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* ── Custom Idea Text Box ─────────────────────────────────────── */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <PenLine size={13} className="text-purple-400" />
              <span className="text-xs font-semibold text-slate-400">Or describe your own idea</span>
            </div>
            <textarea
              rows={2}
              value={customIdeaText}
              onChange={(e) => {
                setCustomIdeaText(e.target.value)
                if (e.target.value.trim()) setActiveIdeaId('') // deselect curated when typing
              }}
              placeholder="e.g. A browser extension that tracks my mood while I study and gives me Spotify playlist suggestions..."
              className="w-full bg-white/8 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none leading-relaxed"
            />
            {customIdeaText.trim().length > 0 && customIdeaText.trim().length <= 3 && (
              <p className="text-xs text-amber-400/80 mt-1">Keep typing — describe it a bit more for better AI results.</p>
            )}
          </div>

          {/* Active idea confirmation banner */}
          <AnimatePresence>
            {activeLabel && (
              <motion.div
                key={activeLabel}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 flex items-center gap-2 text-xs bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 text-teal-300"
              >
                <Sparkles size={12} className="flex-shrink-0" />
                <span>Planning: <strong>{activeLabel}</strong></span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket size={14} className="text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-300">Launch Checklist</h3>
          </div>
          {categories.map((cat) => (
            <TaskList
              key={cat}
              category={cat}
              tasks={tasks.filter((t) => t.category === cat)}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={(text) => addTask(cat, text)}
            />
          ))}
          <button
            onClick={() => { if (confirm('Reset checklist to defaults? This will clear all progress.')) persist(DEFAULT_TASKS) }}
            className="text-xs text-white/35 hover:text-slate-400 transition-colors"
          >
            Reset to defaults
          </button>
        </div>

        {/* AI Panels — receive the derived idea object directly */}
        <div className="space-y-6">
          <BusinessPlanPanel idea={activeIdea} />
          <CodegenPanel idea={activeIdea} />
        </div>
      </div>
    </div>
  )
}
