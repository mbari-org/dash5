/**
 * Single initializer for Google Maps JS + Leaflet googlemutant plugin.
 * Run only in the browser. Call from GoogleMapsProvider; do not load Google elsewhere.
 */

let initPromise: Promise<void> | null = null

/**
 * Ensures Google Maps JS is loaded (with places,elevation) then loads
 * leaflet.gridlayer.googlemutant (registers L.gridLayer.googleMutant).
 * Idempotent: repeated calls reuse the same promise.
 */
export function initLeafletGoogle(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('initLeafletGoogle must run in the browser')
    )
  }

  if (window.google?.maps) {
    return initPromise ?? (initPromise = loadGoogleMutantOnly())
  }

  if (!initPromise) {
    initPromise = (async () => {
      const existing = document.getElementById('google-maps-script')
      if (existing) {
        await waitForGoogle(10000)
        await loadGoogleMutantOnly()
        return
      }

      const script = document.createElement('script')
      script.id = 'google-maps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,elevation`
      script.async = true
      script.defer = true

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = (e) => reject(e)
        document.head.appendChild(script)
      })

      await waitForGoogle(10000)
      await loadGoogleMutantOnly()
    })().catch((err) => {
      initPromise = null
      throw err
    })
  }

  return initPromise
}

function waitForGoogle(timeoutMs = 10000): Promise<void> {
  if (window.google?.maps) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const start = Date.now()
    let rafId = 0

    const check = () => {
      if (window.google?.maps) {
        cancelAnimationFrame(rafId)
        resolve()
        return
      }

      if (Date.now() - start >= timeoutMs) {
        cancelAnimationFrame(rafId)
        reject(new Error('Timed out waiting for Google Maps API'))
        return
      }

      rafId = requestAnimationFrame(check)
    }

    rafId = requestAnimationFrame(check)
  })
}

async function loadLeafletAndExposeGlobal(): Promise<void> {
  if (typeof window === 'undefined') return
  if ((window as any).L) return

  const leaflet = await import('leaflet')
  ;(window as any).L = leaflet.default ?? leaflet
}

async function loadGoogleMutantOnly(): Promise<void> {
  await loadLeafletAndExposeGlobal()
  await import('leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant.js')
}
