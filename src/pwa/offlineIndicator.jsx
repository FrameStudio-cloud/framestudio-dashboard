import { useOnlineStatus } from './useOnlineStatus'
import { useEffect, useState, useRef } from 'react'
import { SyncManager, drainSyncQueue } from './syncManager'
import { FiWifi, FiWifiOff, FiRefreshCw, FiCheck } from 'react-icons/fi'

export default function OfflineIndicator() {
  const { online, wasOffline, isSlowConnection } = useOnlineStatus()
  const [queueSize, setQueueSize] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const syncingRef = useRef(false)

  useEffect(() => {
    SyncManager.getQueueSize().then(setQueueSize)
    const interval = setInterval(() => {
      SyncManager.getQueueSize().then(setQueueSize)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (online && queueSize > 0 && !syncingRef.current) {
      syncingRef.current = true
      setSyncing(true)
      drainSyncQueue().then((result) => {
        syncingRef.current = false
        setSyncing(false)
        if (result.drained > 0) {
          setLastSync(new Date().toLocaleTimeString())
          SyncManager.getQueueSize().then(setQueueSize)
        }
      })
    }
  }, [online, queueSize])

  if (!online) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm animate-in slide-in-from-left">
        <FiWifiOff size={14} />
        <span>Offline</span>
        {queueSize > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
            {queueSize} pending
          </span>
        )}
      </div>
    )
  }

  if (syncing) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm">
        <FiRefreshCw size={14} className="animate-spin" />
        <span>Syncing...</span>
      </div>
    )
  }

  if (wasOffline && online) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm animate-in slide-in-from-left fade-out-3s">
        <FiCheck size={14} />
        <span>Back online</span>
      </div>
    )
  }

  if (queueSize > 0) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm">
        <FiRefreshCw size={14} />
        <span>{queueSize} pending sync</span>
        <button
          onClick={async () => {
            setSyncing(true)
            await drainSyncQueue()
            setSyncing(false)
            SyncManager.getQueueSize().then(setQueueSize)
          }}
          className="ml-1 px-1.5 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[10px]"
        >
          Sync now
        </button>
      </div>
    )
  }

  if (isSlowConnection) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/80 text-white text-xs font-medium shadow-lg backdrop-blur-sm">
        <FiWifi size={14} />
        <span>Slow connection</span>
      </div>
    )
  }

  return null
}
