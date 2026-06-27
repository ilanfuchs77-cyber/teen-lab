import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return

    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false) })
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
    setDeferredPrompt(null)
  }

  if (installed) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="glass glass-highlight px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(94,234,212,0.9),rgba(99,102,241,0.9))' }}>
              <Download size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">Install Teen Lab</p>
              <p className="text-xs text-white/55 leading-snug">Add to your desktop — no SmartScreen, no setup</p>
            </div>
            <button
              onClick={install}
              className="glass-btn-primary glass-btn px-3 py-1.5 text-xs font-semibold flex-shrink-0"
            >
              Install
            </button>
            <button onClick={() => setShow(false)} className="text-white/40 hover:text-white/70 flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
