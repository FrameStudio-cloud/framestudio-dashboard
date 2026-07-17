import { useState, useEffect, useCallback } from 'react'
import { FiRefreshCw, FiX } from 'react-icons/fi'
import { applyUpdate } from './registerSW'

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      setUpdateAvailable(true)
      setRegistration(event.detail.registration)
    }
    window.addEventListener('sw-update-available', handler)

    const activatedHandler = () => {
      setUpdateAvailable(false)
    }
    window.addEventListener('sw-update-activated', activatedHandler)

    return () => {
      window.removeEventListener('sw-update-available', handler)
      window.removeEventListener('sw-update-activated', activatedHandler)
    }
  }, [])

  const handleUpdate = useCallback(() => {
    applyUpdate(registration)
    setUpdateAvailable(false)
  }, [registration])

  const handleDismiss = useCallback(() => {
    setUpdateAvailable(false)
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm animate-in slide-in-from-bottom fade-in">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e293b] border border-white/10 shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <FiRefreshCw size={16} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Update available</p>
          <p className="text-xs text-slate-400">A new version is ready. Reload to apply.</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex-shrink-0"
        >
          Reload
        </button>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  )
}
