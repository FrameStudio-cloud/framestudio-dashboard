import { useState, useEffect, useCallback } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('fs-pwa-install-dismissed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (isStandalone()) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const changeHandler = () => {
      if (mediaQuery.matches) setShow(false)
    }
    mediaQuery.addEventListener('change', changeHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mediaQuery.removeEventListener('change', changeHandler)
    }
  }, [dismissed])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    setDismissed(true)
    try {
      localStorage.setItem('fs-pwa-install-dismissed', 'true')
    } catch {}
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm animate-in slide-in-from-bottom fade-in">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e293b] border border-white/10 shadow-2xl">
        <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          F
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Install FrameStudio</p>
          <p className="text-xs text-slate-400">Add to your home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex-shrink-0"
        >
          <FiDownload size={13} />
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label="Not now"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  )
}
