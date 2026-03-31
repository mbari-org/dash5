import { createRoleLabel } from './createRoleLabel'

describe('createRoleLabel', () => {
  describe('loading state', () => {
    it('should return loading indicator when loading, regardless of authenticated state', () => {
      expect(
        createRoleLabel({
          operators: [],
          role: 'PIC',
          loading: true,
          authenticated: false,
        })
      ).toBe('...')
    })

    it('should return loading indicator when loading, even if authenticated', () => {
      expect(
        createRoleLabel({
          operators: ['John Doe'],
          role: 'PIC',
          loading: true,
          authenticated: true,
        })
      ).toBe('...')
    })
  })

  describe('unauthenticated state', () => {
    it('should return Unavailable for PIC when not authenticated and not loading', () => {
      expect(
        createRoleLabel({
          operators: [],
          role: 'PIC',
          loading: false,
          authenticated: false,
        })
      ).toBe('Unavailable')
    })

    it('should return empty string for On-Call when not authenticated and not loading', () => {
      expect(
        createRoleLabel({
          operators: [],
          role: 'On-Call',
          loading: false,
          authenticated: false,
        })
      ).toBe('')
    })
  })

  describe('authenticated state', () => {
    it('should return No PIC when authenticated and no operators', () => {
      expect(
        createRoleLabel({
          operators: [],
          role: 'PIC',
          authenticated: true,
        })
      ).toBe('No PIC')
    })

    it('should return No On-Call when authenticated and no operators', () => {
      expect(
        createRoleLabel({
          operators: [],
          role: 'On-Call',
          authenticated: true,
        })
      ).toBe('No On-Call')
    })

    it('should return You when the current user is the only operator', () => {
      expect(
        createRoleLabel({
          operators: ['John Doe'],
          role: 'PIC',
          currentUser: 'John Doe',
          authenticated: true,
        })
      ).toBe('You')
    })

    it('should return You and N others when the current user is one of multiple operators', () => {
      expect(
        createRoleLabel({
          operators: ['John Doe', 'Jane Smith'],
          role: 'PIC',
          currentUser: 'John Doe',
          authenticated: true,
        })
      ).toBe('You and 1 other')
    })

    it('should return operator name when there is one operator and current user is not them', () => {
      expect(
        createRoleLabel({
          operators: ['John Doe'],
          role: 'PIC',
          currentUser: 'Jane Smith',
          authenticated: true,
        })
      ).toBe('John D.')
    })

    it('should return operator count when there are multiple operators and current user is not one', () => {
      expect(
        createRoleLabel({
          operators: ['John Doe', 'Jane Smith'],
          role: 'PIC',
          currentUser: 'Alice Johnson',
          authenticated: true,
        })
      ).toBe('2 PIC')
    })
  })
})
