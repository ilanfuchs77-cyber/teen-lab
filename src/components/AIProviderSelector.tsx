import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, Cpu } from 'lucide-react'
import { AI_PROVIDERS, providerMeta } from '../lib/ai'
import { useAIProvider } from '../context/AIProviderContext'

export default function AIProviderSelector() {
  const { provider, setProvider, configured } = useAIProvider()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = providerMeta(provider)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Is a given provider live (has a key) or running on demo data?
  function status(id: string): 'live' | 'demo' {
    if (id === 'auto') return configured.length > 0 ? 'live' : 'demo'
    return configured.includes(id) ? 'live' : 'demo'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass-chip flex items-center gap-2 px-3 py-1.5 text-white/85 hover:text-white transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Cpu size={13} className={current.accent} />
        <span className="text-xs font-medium hidden sm:inline">AI:</span>
        <span className="text-xs font-semibold">{current.label}</span>
        <ChevronDown size={13} className={`text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-deep glass-highlight absolute right-0 mt-2 w-72 p-2 z-50"
            role="listbox"
          >
            <div className="px-2 py-1.5 text-[0.65rem] uppercase tracking-widest text-white/45 font-semibold">
              Choose your AI helper
            </div>
            {AI_PROVIDERS.map((p) => {
              const selected = p.id === provider
              const live = status(p.id) === 'live'
              return (
                <button
                  key={p.id}
                  role="option"
                  aria-selected={selected}
                  onClick={() => { setProvider(p.id); setOpen(false) }}
                  className={`w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-3 transition-colors ${
                    selected ? 'bg-white/12' : 'hover:bg-white/8'
                  }`}
                >
                  <span className="mt-0.5">
                    {selected
                      ? <Check size={15} className="text-teal-300" />
                      : <span className="block w-[15px]" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${p.accent}`}>{p.label}</span>
                      <span className="text-[0.65rem] text-white/40">{p.company}</span>
                      <span
                        className={`ml-auto text-[0.6rem] px-1.5 py-0.5 rounded-full border ${
                          live
                            ? 'text-teal-300 border-teal-400/40 bg-teal-400/10'
                            : 'text-white/45 border-white/15 bg-white/5'
                        }`}
                      >
                        {live ? 'Connected' : 'Demo'}
                      </span>
                    </span>
                    <span className="block text-xs text-white/55 mt-0.5 leading-snug">{p.blurb}</span>
                  </span>
                </button>
              )
            })}
            <div className="px-3 pt-2 pb-1 text-[0.65rem] text-white/35 leading-snug">
              "Demo" providers return sample data until an API key is added.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
