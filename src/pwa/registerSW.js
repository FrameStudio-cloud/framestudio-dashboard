const isDev = import.meta.env.DEV

function getSWPath() {
  if (isDev) {
    return '/dev-sw.js?dev-sw'
  }
  return '/sw.js'
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.log('PWA: Service Worker not supported.')
    return null
  }

  try {
    const swPath = getSWPath()
    const regOpts = {
      scope: '/',
      updateViaCache: 'none',
    }

    if (isDev) {
      regOpts.type = 'module'
    }

    const registration = await navigator.serviceWorker.register(swPath, regOpts)

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      let shown = false
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (!shown) {
            shown = true
            window.dispatchEvent(new CustomEvent('sw-update-available', { detail: { registration } }))
          }
        }
        if (newWorker.state === 'activated') {
          window.dispatchEvent(new CustomEvent('sw-update-activated'))
        }
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.dispatchEvent(new CustomEvent('sw-controller-change'))
    })

    console.log('PWA: Service Worker registered', swPath)
    return registration
  } catch (error) {
    console.log('PWA: Registration skipped (non-critical):', error.message)
    return null
  }
}

export function applyUpdate(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}
