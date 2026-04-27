import { renderHook, act } from '@testing-library/react'
import useSessionToken from '../lib/useSessionToken'

const COOKIE_NAME = 'TETHYS_SESSION_TOKEN'

const clearCookie = () => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

const writeCookie = (value: string) => {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/`
}

describe('useSessionToken', () => {
  afterEach(() => clearCookie())

  it('should initialise with an empty token (mirrors SSR where document.cookie is unavailable)', () => {
    clearCookie()
    const { result } = renderHook(() => useSessionToken(COOKIE_NAME))
    // On first render the useState initialiser returns '' because we start
    // with an empty default and the useEffect hasn't run yet.
    expect(result.current.sessionToken).toBe('')
  })

  it('should read an existing cookie value after the effect runs', async () => {
    writeCookie('my-real-session-token')
    const { result } = renderHook(() => useSessionToken(COOKIE_NAME))

    // After the useEffect fires the token should be populated.
    await act(async () => {})
    expect(result.current.sessionToken).toBe('my-real-session-token')
  })

  it('should write the cookie and update state when setSessionToken is called', () => {
    clearCookie()
    const { result } = renderHook(() => useSessionToken(COOKIE_NAME))

    act(() => {
      result.current.setSessionToken('brand-new-token')
    })

    expect(result.current.sessionToken).toBe('brand-new-token')
    // Verify the cookie was actually written to document.cookie
    expect(document.cookie).toContain(COOKIE_NAME)
    expect(document.cookie).toContain(encodeURIComponent('brand-new-token'))
  })

  it('should not update state when the cookie is absent (stays empty after effect)', async () => {
    clearCookie()
    const { result } = renderHook(() => useSessionToken(COOKIE_NAME))

    await act(async () => {})
    // No cookie set → useEffect finds nothing → state stays ''
    expect(result.current.sessionToken).toBe('')
  })

  it('should update state and cookie when called with an empty string (logout)', () => {
    writeCookie('existing-token')
    const { result } = renderHook(() => useSessionToken(COOKIE_NAME))

    act(() => {
      result.current.setSessionToken('')
    })

    expect(result.current.sessionToken).toBe('')
  })
})
