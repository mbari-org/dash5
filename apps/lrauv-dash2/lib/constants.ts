/** Base URL for the ODSS API, used to resolve relative platform icon paths. */
export const ODSS_BASE_URL = 'https://odss.mbari.org/odss'

/** LRAUV Watchbill signup spreadsheet — single source of truth for the URL
 *  so the profile dropdown and resources dropdown stay in sync. */
export const WATCHBILL_URL =
  'https://docs.google.com/spreadsheets/d/1kOTNsOcUKWlfK1YHQAq38arX9HLQINzlpuR-vL6bCrE/edit?gid=0#gid=0'

/** Leaflet pane name and z-index for ship/platform track layers.
 *  Defined here (Leaflet-free module) so both PlatformPath and PlatformPaths
 *  can import them without pulling Leaflet into PlatformPaths' initial bundle. */
export const PLATFORM_PANE = 'platformsPane'
export const PLATFORM_PANE_Z = 450

/** How far back to search TrackDB for map-track positions. 365 days keeps
 *  infrequently-updated fixed platforms (e.g. CA offshore structures that may
 *  not report for months) visible on the map. Center Map fly-to sends no date
 *  window and does not use this constant. */
export const PLATFORM_LOOKBACK_DAYS = 365
