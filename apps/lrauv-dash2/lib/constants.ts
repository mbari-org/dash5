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
