import {
  AUTH_BANNER_DISMISS_KEY,
  shouldShowAuthBanner,
} from './shouldShowAuthBanner'

describe('shouldShowAuthBanner', () => {
  it('is hidden while auth is still loading (session restore)', () => {
    expect(
      shouldShowAuthBanner({
        mounted: true,
        authenticated: false,
        authLoading: true,
        dismissed: false,
      })
    ).toBe(false)
  })

  it('is shown when mounted, logged out, not loading, and not dismissed', () => {
    expect(
      shouldShowAuthBanner({
        mounted: true,
        authenticated: false,
        authLoading: false,
        dismissed: false,
      })
    ).toBe(true)
  })

  it('is hidden when authenticated', () => {
    expect(
      shouldShowAuthBanner({
        mounted: true,
        authenticated: true,
        authLoading: false,
        dismissed: false,
      })
    ).toBe(false)
  })

  it('is hidden when the user chose Do not show again', () => {
    expect(
      shouldShowAuthBanner({
        mounted: true,
        authenticated: false,
        authLoading: false,
        dismissed: true,
      })
    ).toBe(false)
  })

  it('is hidden before the client has mounted', () => {
    expect(
      shouldShowAuthBanner({
        mounted: false,
        authenticated: false,
        authLoading: false,
        dismissed: false,
      })
    ).toBe(false)
  })

  it('exports a stable localStorage key', () => {
    expect(AUTH_BANNER_DISMISS_KEY).toBe('dash5.hideAuthBanner')
  })
})
