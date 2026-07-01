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

**Map track enhancements: GPS surfacing dots, hover tooltips, vehicle position marker (PR #745, Issue #744)**

Brings the Dash 5 map track display into alignment with Dash 4's situational awareness features.

### New features

- **GPS surfacing dots** — small filled dots are now shown along the full deployment track at every position where the vehicle surfaced, making it easy to see surfacing frequency and distribution
- **"Position before waypoint trajectory" marker** — when a projected (future) route is displayed, the junction between the actual GPS track and the projected route is now marked and labeled in the hover tooltip
- **Improved vehicle position marker** — the latest vehicle position is now rendered as a solid filled dot with a white border ring, always drawn on top of historical dots at any zoom level; z-ordering is correct when dots overlap
- **Informative hover tooltip** — hovering anywhere along the track now shows:
  - Vehicle name (black text with a colored dot matching the track color)
  - Latitude / Longitude
  - ISO date/time in UTC
  - Time elapsed since the fix was received (smaller italic text, same line as timestamp)
  - Count of positions displayed (accurate during track-split/dimming mode)

### Bug fixes

- Eliminated React duplicate-key warnings caused by the TethysDash API occasionally returning GPS fixes with duplicate timestamps
- Silenced noisy `[PlatformPath] No positions found` console messages when external platforms have no data in the query window
- Downgraded external platform position timeout log messages from `warn` to `debug` — these timeouts are expected for offline platforms and are not actionable errors

---

## [v5.2.8] — 2026-06-26 · Staging

**Fix LRAUV type annotations in amend parser**

- Corrected the mission-amend parser to recognise LRAUV type annotations (e.g. `uint32`) as unit tokens rather than treating them as invalid input

---

## [v5.2.7] — 2026-06-26 · Staging

- Additional amend parser fixes (superseded by v5.2.8)

---

## [v5.2.6] — 2026-06-18 · Staging

**Back button & summary screens in mission wizard (PR #739, Issue #723)**

- Pressing **Back** in the mission wizard now correctly re-shows the Parameters Summary screen (previously it skipped back to the raw Parameters form)
- Added `useMissionModalSteps` unit tests for forward and back navigation paths

---

## [v5.2.5] — 2026-06-18 · Staging

**Preserve clipboard between Ctrl-C / Ctrl-V in the doc editor (PR #741, Issue #740)**

- Fixed a bug where pasting (`Ctrl-V`) inside a document would sometimes insert the previous clipboard content instead of the most-recently-copied text
- The editor now tracks internally-generated HTML changes and avoids resetting ProseMirror's clipboard state on every keystroke

---

## [v5.2.4] — 2026-06-17 · Staging

**Overview vehicle widget: parity with full vehicle page (PR #743, Issue #732)**

- The compact vehicle widget on the Overview page now shows the same data as the full vehicle page widget:
  - Schedule indicator and payload information (planktivore tail/LED, waypoint label)
  - Correct **Recovered** / **Plugged in** / **On mission** status derived consistently across both widgets
- Vehicle status, position, last comms, and next comms times now auto-refresh every 30 seconds on the Overview page — no manual page reload needed
- Fixed a rare edge case where a vehicle with an empty `recoverEvent` object could be incorrectly shown as Recovered

---

## [v5.2.3] — 2026-06-11 · Staging

**Deprecated missions sorted to bottom of mission picker (PR #711)**

- Missions under a `Deprecated/` path are now collapsed into a single group and sorted to the bottom of the mission picker list

---

## [v5.2.2] — 2026-06-10 · Staging

**Unit filtering in Build a Command (PR #708)**

- The unit dropdown in Build a Command now filters to show only units compatible with the selected mission parameter (e.g. distance units for a distance parameter, time units for a duration parameter)
- Unit names are shown in a human-readable form (e.g. "meters" instead of "m")
- Time units are sorted by magnitude

---

## [v5.2.1] — 2026-06-05 · Staging

**Various bug fixes and accessibility improvements**

- Removed stale Mission Script Guide link and clarified variable descriptions in Build a Command
- Miscellaneous accessibility and dropdown focus fixes

---

## [v5.1.0] — 2026-02-17 · Production

Production release syncing `develop` into `main`.

---

_For changes prior to v5.1.0 see the [GitHub release history](https://github.com/mbari-org/dash5/releases)._
