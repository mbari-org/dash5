Map development guide

Goal

Make map features easy to add without breaking SSR, Leaflet, Google Maps, or creating circular dependencies between the app and @mbari/react-ui.

⸻

The golden rules

Rule 1: The library map stays “pure”

packages/react-ui must never import from any app (like apps/lrauv-dash2).

✅ OK in @mbari/react-ui
• React + react-leaflet components
• Map controls, base layers, measurement UI
• Generic map helpers and types
• Callback props (to ask the app to do something)

❌ Not OK in @mbari/react-ui
• Importing app modals/components
• Loading Google Maps scripts
• Importing Leaflet side-effect plugins (googlemutant, markercluster, etc.)
• Reading env variables or calling app APIs directly

⸻

Rule 2: The app owns side effects and plugins

Anything that:
• touches window, document, navigator
• loads a <script>
• imports a Leaflet plugin that changes globals (side effects)

…belongs in the app, in one place.

Use one initializer file (example name):
• apps/lrauv-dash2/lib/leafletPlugins.ts

That file should:
• run only in the browser
• be idempotent (safe to call many times)
• load in the right order (Leaflet first, then plugins)

⸻

Rule 3: Map “children” are either generic or app-specific

When you add a new map-related feature, decide where it belongs:

Put it in @mbari/react-ui if:
• it’s reusable across apps
• it doesn’t depend on app routes/auth/data fetching
• it doesn’t load scripts/plugins
• it can be controlled by props and callbacks

Put it in the app if:
• it’s app-specific UI (vehicle modals, login stuff, app state)
• it needs API base URLs / siteConfig
• it loads Leaflet plugins or Google Maps
• it depends on app contexts/store

⸻

How to build map features (recommended patterns)

Pattern A: Add a new map UI feature inside @mbari/react-ui

Use props and local state.

Examples:
• a new control button
• a measurement overlay
• a generic marker layer

Checklist:
• No app imports
• No plugin imports
• No window access during module load (only inside effects)

⸻

Pattern B: App-owned feature triggered by the map (callbacks)

If the map needs to open something app-owned (like a modal), add a callback prop.

Example approach:
• Map computes an anchor position for UI placement
• Map calls onRequestSomething(anchor)
• App opens its modal and uses the anchor

Guidelines:
• Callback params should be simple and serializable (like { top, left }, ids, booleans)
• Don’t pass whole React components through the callback

⸻

Pattern C: App adds custom layers/markers/handlers (render props)

If the app needs to render custom map content:
• provide a render prop that receives a small “map context” (map state, handlers)
• the app returns React nodes (markers, overlays)

Guidelines:
• Keep the render prop context stable (useMemo/useCallback)
• Don’t pass huge app objects if you can pass ids/derived values

⸻

SSR and “client-only” rules

Never run Leaflet or Google code on the server

Anything that uses Leaflet/Google should be:
• inside useEffect, and/or
• in a component loaded with dynamic(..., { ssr: false })

Safe checks:
• typeof window !== 'undefined'
• window.google?.maps exists before using Google-dependent components

⸻

Plugin loading checklist (Leaflet + GoogleMutant)

Only load plugins in the app initializer

In the app, your initializer should:
• load Leaflet
• ensure window.L exists
• load the plugin after Leaflet is global
• load Google Maps script once

Common pitfall:
• If GoogleMutant is imported before Leaflet is global you get: ReferenceError: L is not defined

Rule:
• Leaflet first, then plugin

⸻

TypeScript rules that prevent weird breakage

Don’t use un-exported subpath imports

✅ Do:
• import { useDepthRequest } from '@mbari/utils'

❌ Don’t:
• import { useDepthRequest } from '@mbari/utils/useDepthRequest' unless exports explicitly support it

⸻

If a plugin requires a dist/... import, add a .d.ts shim in the app

If you import:
• leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant.js

TypeScript may complain it has no types.

Fix by adding a local declaration file like:
• apps/lrauv-dash2/types/leaflet-googlemutant-shim.d.ts

Containing:
• declare module 'leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant.js'

⸻

Define window.google in one place only

Never declare Window.google in multiple files with different types.

Use one file:
• apps/lrauv-dash2/types/global.d.ts

Keep it simple:
• google?: any

If you “tighten” it in one file but another file uses any, TypeScript will fail with:
• “Subsequent property declarations must have the same type”

⸻

Build and import rules (monorepo hygiene)

Library output must be stable

@mbari/react-ui must always emit:
• packages/react-ui/dist/index.d.ts

If it doesn’t, apps will fail with:
• “Cannot find module ‘@mbari/react-ui’ or its corresponding type declarations”

⸻

Don’t import library source paths from the app

✅ Do:
• import { Map } from '@mbari/react-ui'

❌ Don’t:
• import Map from '../../packages/react-ui/src/Map/Map'
• import 'react-ui/src/...'

⸻

Debugging quick checks

If “map doesn’t show”
• Check Console for first error
• Confirm Leaflet CSS is loaded
• Confirm the map component is client-only (dynamic ssr false or gated)

If “Google layer doesn’t show”
• Confirm Google script loaded once
• Confirm window.google?.maps exists before rendering Google-dependent layers
• Confirm plugin initializer ran and didn’t throw

If “vehicles/login don’t load”
• Check Network requests for /info and API base URL
• Verify .env and siteConfig are present
• Verify API calls are hitting the proxy/API host, not Next on port 3000

⸻

When adding a new map feature, ask these questions first 1. Does this feature need Leaflet plugins or scripts

    •	If yes: app initializer
    •	If no: library is fine

    2.	Does this feature depend on app data/auth/routes

    •	If yes: app-owned component
    •	If no: library is fine

    3.	Does the map need to trigger app UI

    •	If yes: callback prop or render prop
    •	If no: keep it inside the map

⸻

“Done” definition for a map PR
• yarn workspace @mbari/react-ui build works
• yarn build works
• yarn workspace @mbari/lrauv-dash2 dev shows map and main app flows
• No library → app imports
• Plugins/scripts only loaded in app initializer
