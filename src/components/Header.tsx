import { Rocket, Zap } from 'lucide-react'
import { motion } from 'motion/react'

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center glow-teal">
            <Rocket size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-gradient-teal">Teen App Lab</span>
            </h1>
            <p className="text-xs text-slate-500 leading-none">Build · Ship · Earn</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hidden sm:flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1.5">
            <Zap size={12} className="text-teal-400" />
            <span className="text-xs text-teal-400 font-medium">Powered by Gemini AI</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        </motion.div>
      </div>
    </header>
  )
}
