# Changelog

All notable changes to LRAUV Dash 5 are documented here.  
Versions on `develop` are deployed to **dash5-staging.mbari.org**; versions merged to `main` are deployed to **dash5.mbari.org** (production).

---

## [v5.2.18] — 2026-07-15 · Staging

**Mission schedule label cleanup — vehicle-reported mission ID as display name (PR #776)**

- Mission rows in the schedule now display the clean vehicle-reported mission name (e.g. `keepstation`) instead of the raw operator command text (e.g. `load Transport/keepstation.tl`)
- For missions where the declared mission ID differs from the filename (e.g. `tail_acoustic_contact.tl` with ID `follow_that_car`), the vehicle-reported ID is used as the label — matching what the vehicle actually calls the mission
- "Use for new mission" modal pre-fill is preserved correctly in all cases, including when mission ID and filename differ
- Falls back to the clean filename (without path or extension) when no telemetry match is available

---

## [v5.2.17] — 2026-07-15 · Production mirror (port 4051)

Same content as v5.2.16 — production image tagged from `main`.

---

## [v5.2.16] — 2026-07-15 · Staging

Same content as v5.2.15 — staging image tagged from `develop` after v5.2.15 was accidentally tagged from `main`.

---

## [v5.2.15] — 2026-07-15 · Production mirror (port 4051)

**Depth chart ↔ map scrubber bidirectional sync (PR #773)**

- Full Deployment Depth Chart and map scrubber now stay in sync in both directions — hovering the scrubber highlights the matching depth point; hovering the chart moves the scrubber to that GPS fix
- Active deployments auto-refresh depth data every 5 minutes (previously could show data hours stale without a page reload)
- Tooltip shows depth with unit, local time, and UTC time in parentheses; also appears automatically while scrubbing the map timeline
- Performance: Plotly import is lazy-loaded and cached; hover point de-duplication skips redundant calls; hover cache resets on data refresh so tooltip never goes stale after a poll
- Security: unit, trace name, and chart title strings from API metadata are HTML-escaped before embedding in Plotly hovertemplate

**Mission Details — `_vt` mission matching (PR #774)**

- Dash5 was displaying a simplified synthetic command (`load profile_station;run`) as the active mission instead of the actual scheduled mission (`profile_station_vt.tl`). The vehicle omits the `_vt` suffix when reporting the mission name; Dash5 now ignores that suffix when matching, so the correct mission is highlighted
- Fixes the "Use for new mission" modal showing the wrong command

**Other fixes**

- Amend command: strip trailing whitespace and semicolons; show type-annotation units (`bool`, `enum`, etc.) in unit dropdown
- Version string: strip `-production` suffix from the displayed app version

---

## [v5.2.13] — 2026-07-08 · Staging

**Fix depth chart zoom resetting on mouse move (Issue #763, PR #764)**

- Depth chart zoom now persists while hovering — moving the mouse over the chart no longer snaps the view back to the full range after zooming in
- Zoom correctly resets when switching time windows, logsets, vehicles, or deployments
- Added opt-in `uirevision` prop to `LineChart` so other charts keep Plotly's default behavior unless they explicitly opt in

---

## [v5.2.12] — 2026-07-07 · Staging

**Watch Bill link, ship marker visibility, deployment start date UX, Schedule tab ordering (Issues #753, #755, #757, #760, #762)**

### User interface

- **Watch Bill link** — the user account dropdown now includes a direct link to the Watch Bill spreadsheet for quick access (Issue #753, PR #754)

### Map

- **Ship/platform position markers** — current-position markers for TrackDB ships (e.g. R/V Paragon) are now significantly larger and more prominent; icon size increased and the fallback circle marker uses a bold colored fill with white border so the current location is always obvious (Issue #755, PR #756)

### Deployment details

- **Start date quick-pick** — clicking the Start date field now shows a two-option confirmation ("Now" or "Custom date…") instead of opening the date picker immediately; clicking "Now" saves the timestamp instantly and closes the editor, preventing accidental future-date entries that caused vehicles to disappear from the map. An inline warning is shown when the start date is in the future (Issue #757, PR #759)

### Schedule tab

- **Correct queue ordering** — pending missions in the active queue are now displayed newest-queued first (most recently sent command at the top) with the currently running mission anchored at the bottom of the queue, matching the expected FIFO execution order (Issue #760, PR #761)
- **Missing pending mission fix** — a second queued instance of the same mission (e.g. a future-scheduled `profile_station`) is no longer incorrectly promoted to "running" status and hidden from the pending queue (Issue #762, PR #761)

### Ctrl+C clipboard fix

- Map coordinates no longer clobber the clipboard when Ctrl+C is pressed inside a text field, textarea, or contenteditable element — native copy behavior is fully restored in those contexts (Issue #751, PR #752)

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
