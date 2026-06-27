import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Header from './components/Header'
import DiscoverTab from './components/tabs/DiscoverTab'
import MoneySimulatorTab from './components/tabs/MoneySimulatorTab'
import AIIdeaGeneratorTab from './components/tabs/AIIdeaGeneratorTab'
import LaunchPlannerTab from './components/tabs/LaunchPlannerTab'
import { Tab } from './types'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'discover', label: 'Discover', emoji: '🧭' },
  { id: 'simulator', label: 'Money Sim', emoji: '🧮' },
  { id: 'generator', label: 'AI Ideas', emoji: '✨' },
  { id: 'planner', label: 'Planner', emoji: '📋' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('discover')
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 bg-slate-900 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.emoji}</span>
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'discover' && (
              <DiscoverTab
                selectedIdeaId={selectedIdeaId}
                onSelectIdea={setSelectedIdeaId}
                onGoToPlanner={() => setActiveTab('planner')}
              />
            )}
            {activeTab === 'simulator' && <MoneySimulatorTab />}
            {activeTab === 'generator' && (
              <AIIdeaGeneratorTab onGoToPlanner={() => setActiveTab('planner')} />
            )}
            {activeTab === 'planner' && (
              <LaunchPlannerTab selectedIdeaId={selectedIdeaId} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-600 text-sm">
        <span className="text-gradient-teal font-semibold">Teen App Lab</span>
        {' '}· Build something real. Ship it. Earn from it. 🚀
      </footer>
    </div>
  )
}
