import useCookie from 'react-use-cookie'

const useSessionToken = (name: string) => {
  const [sessionToken, setToken] = useCookie(name, '')

  const setSessionToken = (token: string) => {
    setToken(token, {
      days: 7,
      SameSite: 'Strict',
      Secure:
        typeof window !== 'undefined' && window.location.protocol === 'https:',
    })
  }

  return { sessionToken, setSessionToken }
}

export default useSessionToken
