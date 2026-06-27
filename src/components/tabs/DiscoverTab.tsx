import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Zap,
  Code2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { IDEAS } from '../../data/ideas'
import { IdeaCard } from '../../types'

const DIFFICULTY_COLORS = {
  Beginner: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Intermediate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const CATEGORY_COLORS: Record<string, string> = {
  teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

interface Props {
  selectedIdeaId: string | null
  onSelectIdea: (id: string | null) => void
  onGoToPlanner: () => void
}

function IdeaCardComponent({
  idea,
  isSelected,
  onSelect,
}: {
  idea: IdeaCard
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      layout
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className={`card-base cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-teal-500/60 glow-teal'
          : 'hover:border-white/12'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{idea.icon}</span>
            <div>
              <h3 className="font-bold text-slate-100 text-base">{idea.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{idea.tagline}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isSelected ? (
              <ChevronUp size={16} className="text-teal-400 mt-1" />
            ) : (
              <ChevronDown size={16} className="text-white/45 mt-1" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              CATEGORY_COLORS[idea.categoryColor]
            }`}
          >
            {idea.category}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              DIFFICULTY_COLORS[idea.difficulty]
            }`}
          >
            {idea.difficulty}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/8 rounded-lg p-2 text-center">
            <DollarSign size={12} className="text-teal-400 mx-auto mb-1" />
            <div className="font-mono text-xs font-bold text-slate-200">{idea.startupCost}</div>
            <div className="text-white/45 text-xs">Startup</div>
          </div>
          <div className="bg-white/8 rounded-lg p-2 text-center">
            <Clock size={12} className="text-purple-400 mx-auto mb-1" />
            <div className="font-mono text-xs font-bold text-slate-200">{idea.timeToLaunch}</div>
            <div className="text-white/45 text-xs">Launch</div>
          </div>
          <div className="bg-white/8 rounded-lg p-2 text-center">
            <Zap size={12} className="text-indigo-400 mx-auto mb-1" />
            <div className="font-mono text-xs font-bold text-teal-400">{idea.potentialMonthly}</div>
            <div className="text-white/45 text-xs">/mo earn</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {idea.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs bg-white/8 text-slate-400 px-2 py-0.5 rounded font-mono border border-white/12"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function IdeaDetail({ idea, onGoToPlanner }: { idea: IdeaCard; onGoToPlanner: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="mt-6 card-base border-teal-500/30 glow-teal overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/5 to-transparent p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{idea.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gradient-teal">{idea.title}</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">{idea.description}</p>
          </div>
        </div>
      </div>

      <div className="p-5 grid md:grid-cols-3 gap-6">
        {/* Monetization */}
        <div>
          <h4 className="text-sm font-semibold text-teal-400 flex items-center gap-2 mb-3">
            <DollarSign size={14} />
            How to Monetize
          </h4>
          <ul className="space-y-2">
            {idea.monetization.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-3">
            <Code2 size={14} />
            Skills to Practice
          </h4>
          <div className="flex flex-wrap gap-2">
            {idea.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-3">
            <Sparkles size={14} />
            Quick Launch Roadmap
          </h4>
          <ol className="space-y-2">
            {idea.roadmap.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-3">
        <button
          onClick={onGoToPlanner}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity glow-teal"
        >
          Plan This Idea in My Planner
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}

export default function DiscoverTab({ selectedIdeaId, onSelectIdea, onGoToPlanner }: Props) {
  const selectedIdea = IDEAS.find((i) => i.id === selectedIdeaId) ?? null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          🧭 Proven Digital Products to Build
        </h2>
        <p className="text-slate-400">
          Real software products teens are shipping and earning from — not gig jobs, but actual
          digital assets that make money while you sleep.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {IDEAS.map((idea) => (
          <IdeaCardComponent
            key={idea.id}
            idea={idea}
            isSelected={selectedIdeaId === idea.id}
            onSelect={() =>
              onSelectIdea(selectedIdeaId === idea.id ? null : idea.id)
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedIdea && (
          <IdeaDetail idea={selectedIdea} onGoToPlanner={onGoToPlanner} />
        )}
      </AnimatePresence>
    </div>
  )
}
