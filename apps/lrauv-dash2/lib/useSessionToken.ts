import { useEffect, useState } from 'react'
import { getCookie, setCookie } from 'react-use-cookie'

// react-use-cookie initializes via useState() on the server where
// document.cookie is unavailable, so it always starts as ''. During
// Next.js static-export hydration React reuses that server state, meaning
// the real cookie value is never read on page refresh.
// We bypass that by owning the state ourselves and syncing from
// document.cookie in a useEffect (which only runs on the client, after
// hydration).
const useSessionToken = (name: string) => {
  const [sessionToken, setSessionToken_] = useState('')

  useEffect(() => {
    const stored = getCookie(name)
    console.log(
      '[useSessionToken] hydrate — raw cookie length:',
      stored?.length ?? 0,
      '| has value:',
      stored?.length > 0
    )
    if (stored) {
      setSessionToken_(stored)
    } else {
      console.warn(
        '[useSessionToken] cookie is empty on hydrate — user will see login page'
      )
    }
  }, [name])

  const setSessionToken = (token: string) => {
    console.log(
      '[useSessionToken] setSessionToken — length:',
      token?.length ?? 0,
      '| preview:',
      token ? token.substring(0, 20) + '...' : '(empty)'
    )
    setSessionToken_(token)
    setCookie(name, token, {
      days: 7,
      SameSite: 'Strict',
      Secure:
        typeof window !== 'undefined' && window.location.protocol === 'https:',
    })
    const verify = getCookie(name)
    console.log(
      '[useSessionToken] post-write verify — cookie length:',
      verify?.length ?? 0,
      '| match:',
      verify === token
    )
  }

  return { sessionToken, setSessionToken }
}

export default useSessionToken
