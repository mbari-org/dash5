import useCookie from 'react-use-cookie'

const useSessionToken = () => {
  const [sessionToken, setSessionToken] = useCookie('TETHYS_ACCESS_TOKEN', '')

  const setToken = (token: string) => {
    setSessionToken(token, {
      days: 7,
      SameSite: 'Strict',
      Secure:
        typeof window !== 'undefined' && window.location.protocol === 'https:',
    })
  }

  return [sessionToken, setToken]
}

export default useSessionToken
