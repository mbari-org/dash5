import { getWindowFrom } from './timeWindows'

const DAY = 24 * 60 * 60 * 1000

// Fixed reference timestamps
const deploymentFrom = 1_000_000_000_000 // some past start
const now = deploymentFrom + 10 * DAY // 10 days after start

describe('getWindowFrom', () => {
  describe("'latest' window", () => {
    it('returns deploymentFrom for an active deployment', () => {
      expect(getWindowFrom('latest', deploymentFrom, undefined, now)).toBe(
        deploymentFrom
      )
    })

    it('returns deploymentFrom for an ended deployment', () => {
      const deploymentTo = deploymentFrom + 5 * DAY
      expect(getWindowFrom('latest', deploymentFrom, deploymentTo, now)).toBe(
        deploymentFrom
      )
    })
  })

  describe("'deployment' window", () => {
    it('returns deploymentFrom regardless of deploymentTo', () => {
      expect(getWindowFrom('deployment', deploymentFrom, undefined, now)).toBe(
        deploymentFrom
      )
      const deploymentTo = deploymentFrom + 3 * DAY
      expect(
        getWindowFrom('deployment', deploymentFrom, deploymentTo, now)
      ).toBe(deploymentFrom)
    })
  })

  describe("'3d' window", () => {
    it('returns now minus 3 days for an active deployment with plenty of history', () => {
      expect(getWindowFrom('3d', deploymentFrom, undefined, now)).toBe(
        now - 3 * DAY
      )
    })

    it('clamps to deploymentFrom when deployment is shorter than 3 days', () => {
      const recentFrom = now - 1 * DAY // deployment started only 1 day ago
      expect(getWindowFrom('3d', recentFrom, undefined, now)).toBe(recentFrom)
    })

    it('anchors to deploymentTo (not now) for an ended deployment', () => {
      const deploymentTo = deploymentFrom + 4 * DAY
      expect(getWindowFrom('3d', deploymentFrom, deploymentTo, now)).toBe(
        deploymentTo - 3 * DAY
      )
    })

    it('anchors to now when deploymentTo is in the future (active deployment padding)', () => {
      const futureDeploymentTo = now + 2 * DAY
      expect(getWindowFrom('3d', deploymentFrom, futureDeploymentTo, now)).toBe(
        now - 3 * DAY
      )
    })
  })

  describe("'7d' window", () => {
    it('returns now minus 7 days for an active deployment with plenty of history', () => {
      expect(getWindowFrom('7d', deploymentFrom, undefined, now)).toBe(
        now - 7 * DAY
      )
    })

    it('clamps to deploymentFrom when deployment is shorter than 7 days', () => {
      const recentFrom = now - 3 * DAY // deployment started only 3 days ago
      expect(getWindowFrom('7d', recentFrom, undefined, now)).toBe(recentFrom)
    })

    it('anchors to deploymentTo (not now) for an ended deployment', () => {
      const deploymentTo = deploymentFrom + 8 * DAY
      expect(getWindowFrom('7d', deploymentFrom, deploymentTo, now)).toBe(
        deploymentTo - 7 * DAY
      )
    })

    it('anchors to now when deploymentTo is in the future (active deployment padding)', () => {
      const futureDeploymentTo = now + 5 * DAY
      expect(getWindowFrom('7d', deploymentFrom, futureDeploymentTo, now)).toBe(
        now - 7 * DAY
      )
    })
  })
})
