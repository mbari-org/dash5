# Changelog

All notable changes to LRAUV Dash 5 are documented here.  
Versions on `develop` are deployed to **dash5-staging.mbari.org**; versions merged to `main` are deployed to **dash5.mbari.org** (production).

---

## [v5.2.11] — 2026-07-01 · Staging

**Fix 3 pre-existing failing unit tests (Issue #750)**

No user-facing changes. Internal test-suite cleanup only.

- Fixed `LogsSection` test that was incorrectly matching the "Data" download button as a log-cell label
- Fixed `LogsSection` "Updated … ago" assertion to handle text rendered across three stacked `<span>` elements
- Fixed `VehicleAccordion` queue-count test to use the current `eventTypes=note` API parameter (the old `noteMatches` param was removed in backend v4.99.77)

---

## [v5.2.10] — 2026-07-01 · Staging

**Add unit test coverage for v5.2.9 map features (Issue #748)**

No user-facing changes. Tests added to prevent regressions.

- `vehiclePathUtils.test.ts` — 18 tests covering GPS-fix deduplication and position-count accuracy during track-split/dimming
- `useLastCommsTime.test.ts` — 10 tests verifying correct discrimination between satellite and cell comms events
- `useMissionModalSteps.test.ts` — 12 tests for mission wizard forward/back navigation; writing these tests discovered and fixed a crash bug where pressing **Back** at the first step caused a `TypeError`
- `PlatformPath.test.tsx` — 9 tests covering timeout-vs-error log-level routing and rendering behavior

---

## [v5.2.9] — 2026-07-01 · Staging

**Major release — map enhancements, mission wizard back button, doc editor clipboard, vehicle widget parity, planktivore indicator, and more**

PRs included: #734, #737, #738, #739, #742, #743, #745 (Issues #718, #723, #728, #729, #732, #733, #740, #744)

### Map improvements (aligns Dash 5 with Dash 4)

- **GPS surfacing dots** — small filled dots now appear along the full deployment track at every surface position, so you can see surfacing frequency and distribution at a glance
- **Vehicle position marker** — the latest position is now a solid dot with a white border ring, always drawn on top of historical dots and visible at any zoom level
- **Hover tooltip** — hovering anywhere along the track now shows vehicle name (color-coded), lat/lon, date/time in UTC, elapsed time since fix received, and number of positions displayed
- **"Position before waypoint trajectory"** — when a projected route is shown, the junction between the actual GPS track and the projected route is clearly labeled in the tooltip
- **Corrected projected route** — fixed a bug where the projected waypoint route would backtrack to a previous waypoint before continuing forward
- **Center-button zoom** — the "center on GPS fixes" button no longer zooms in to maximum; it now caps at a comfortable zoom level

### Mission wizard

- **Back button** — pressing Back now correctly re-shows the Parameters Summary screen (previously it skipped back to the raw Parameters form, bypassing the summary)
- **Tab memory** — the selected tab (Templates / Frequent Runs / Recent Runs) is preserved when navigating Back, so the user returns to the same tab they were on

### Document editor

- **Clipboard fix (Ctrl-C / Ctrl-V)** — fixed a bug where pasting would sometimes insert the previously-copied text instead of the most-recently-copied content

### Vehicle widgets

- **Overview widget parity** — the compact vehicle widget on the Overview page now shows the same data as the full vehicle page widget: schedule indicator, payload information, and correct Recovered / Plugged in / On mission status
- **Auto-refresh** — vehicle status, position, last comms, and next comms on the Overview page now refresh automatically every 30 seconds without a manual page reload
- **Planktivore payload indicator** — the vehicle widget now shows planktivore tail and LED status, and the galene AUV LED indicators, matching the Dash 4 widget
- **Document duplication** — fixed a bug where duplicating a document created an empty file instead of a copy

### Other fixes

- Logset dropdown tooltip no longer gets clipped when the dropdown is near the edge of the screen
- Silenced noisy console messages about external platform position timeouts (expected/harmless for offline platforms)

---

## [v5.2.8] — 2026-06-26 · Staging

**Fix LRAUV type annotations in amend parser**

- Corrected the mission-amend parser to recognise LRAUV type annotations (e.g. `uint32`) as unit tokens rather than treating them as invalid input

---

## [v5.2.1 – v5.2.7] — 2026-06-05 to 2026-06-26 · Staging

Earlier staging iterations covering incremental development work including:

- Unit filtering in Build a Command (filter units by parameter type, human-readable unit names)
- Deprecated missions sorted to the bottom of the mission picker
- Accessibility and dropdown focus improvements
- Amend parser fixes (superseded by v5.2.8)

---

## [v5.1.0] — 2026-02-17 · Production

Production release syncing `develop` into `main`.

---

_For changes prior to v5.1.0 see the [GitHub release history](https://github.com/mbari-org/dash5/releases)._
