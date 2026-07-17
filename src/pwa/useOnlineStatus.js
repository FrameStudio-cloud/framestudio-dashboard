import { useState, useEffect, useCallback } from 'react'

function getConnectionInfo() {
  const conn = navigator.connection
  return {
    type: conn?.type || null,
    effectiveType: conn?.effectiveType || null,
  }
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [connectionType, setConnectionType] = useState(() => getConnectionInfo().type)
  const [effectiveType, setEffectiveType] = useState(() => getConnectionInfo().effectiveType)

  const updateConnectivity = useCallback(() => {
    const info = getConnectionInfo()
    setConnectionType(info.type)
    setEffectiveType(info.effectiveType)
  }, [])

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      setWasOffline(true)
      setTimeout(() => setWasOffline(false), 3000)
    }

    const goOffline = () => {
      setOnline(false)
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    const conn = navigator.connection
    if (conn) {
      conn.addEventListener('change', updateConnectivity)
    }

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      if (conn) conn.removeEventListener('change', updateConnectivity)
    }
  }, [updateConnectivity])

  return {
    online,
    offline: !online,
    wasOffline,
    connectionType,
    effectiveType,
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g',
  }
}
