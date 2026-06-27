import { Rocket, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

export default function Header() {
  return (
    <header className="px-4 pt-4">
      <div className="max-w-7xl mx-auto glass glass-highlight px-5 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
              boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.5) inset, 0 6px 20px -4px rgba(20, 184, 166, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Rocket size={20} className="text-white relative z-10" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                borderRadius: 'inherit',
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">
              <span className="text-gradient-teal">Teen Lab</span>
            </h1>
            <p className="text-xs text-white/45 leading-none mt-0.5">Build · Ship · Earn</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hidden sm:flex items-center gap-2 glass-chip px-3 py-1.5">
            <Sparkles size={12} className="text-teal-300" />
            <span className="text-xs text-white/80 font-medium">Powered by Gemini AI</span>
          </div>
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-teal-400 blur-sm" />
          </div>
        </motion.div>
      </div>
    </header>
  )
}
