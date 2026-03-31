import { useEffect, useState } from 'react'
import { getCookie, setCookie } from 'react-use-cookie'

// react-use-cookie initializes via useState() on the server where
// document.cookie is unavailable, so it always starts as ''. During
// Next.js SSR hydration React reuses that server state, meaning the
// real cookie value is never read. We bypass that by owning the state
// ourselves and syncing from document.cookie in a useEffect (which
// only runs on the client, after hydration).
const useSessionToken = (name: string) => {
  const [sessionToken, setSessionToken_] = useState('')

  useEffect(() => {
    const stored = getCookie(name)
    if (stored) {
      setSessionToken_(stored)
    }
  }, [name])

  const setSessionToken = (token: string) => {
    setSessionToken_(token)
    setCookie(name, token, {
      days: 7,
      SameSite: 'Strict',
      Secure: window.location.protocol === 'https:',
    })
  }

  return { sessionToken, setSessionToken }
}

export default useSessionToken
