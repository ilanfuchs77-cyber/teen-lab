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
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      <Header />

      {/* Glass tab navigation — floating */}
      <div className="sticky top-0 z-40 px-4 pt-3 pb-3">
        <div className="max-w-7xl mx-auto">
          <div className="glass glass-highlight inline-flex p-1.5 gap-1" style={{ borderRadius: '18px' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap rounded-xl ${
                  activeTab === tab.id ? 'text-white' : 'text-white/55 hover:text-white/90'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 glass-btn-primary"
                    style={{ borderRadius: '12px' }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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

      <footer className="py-8 text-center text-white/40 text-sm">
        <span className="text-gradient-teal font-semibold">Teen Lab</span>
        {' '}· Build something real. Ship it. Earn from it.
      </footer>
    </div>
  )
}
