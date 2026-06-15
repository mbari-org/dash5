# Dash 5 — New Developer Onboarding Guide

This document will get you from zero to a running local dev environment and give you enough context to start contributing to Dash 5 confidently.

---

## Table of Contents

1. [What is Dash 5?](#what-is-dash-5)
2. [Prerequisites](#prerequisites)
3. [Clone and Install](#clone-and-install)
4. [Project Structure](#project-structure)
5. [Running the Dev Server](#running-the-dev-server)
6. [Making Changes — The Critical "Rebuild" Rule](#making-changes--the-critical-rebuild-rule)
7. [Running Tests](#running-tests)
8. [Code Style and Conventions](#code-style-and-conventions)
9. [Branching and Pull Request Workflow](#branching-and-pull-request-workflow)
10. [Who to Ask](#who-to-ask)

---

## What is Dash 5?

Dash 5 is the fifth-generation operator dashboard for MBARI's **LRAUV** (Long-Range Autonomous Underwater Vehicle) fleet. It is a React + Next.js web application that gives engineers real-time situational awareness of deployed vehicles: their location, depth, science data, mission schedules, notifications, and more.

The repo is a **Yarn monorepo** managed with [Turborepo](https://turbo.build/repo). It contains:

| Path                   | What it is                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `apps/lrauv-dash2/`    | The main Next.js application (the actual dashboard UI)            |
| `packages/react-ui/`   | Shared React component library (Storybook-documented)             |
| `packages/api-client/` | Typed Axios + React Query wrappers for the TethysDash backend API |
| `packages/utils/`      | Common helpers shared across packages                             |

---

## Prerequisites

You need the following tools installed before you can run the project.

### Node.js — version 20.x

The project requires **Node 20**. We strongly recommend managing Node versions with [nvm](https://github.com/nvm-sh/nvm):

```bash
# Install nvm (skip if already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload your shell, then:
nvm install 20
nvm use 20
nvm alias default 20

# Confirm
node --version   # should print v20.x.x
```

### Yarn — version 1.22.x

```bash
npm install -g yarn@1.22
yarn --version   # should print 1.22.x
```

### Git

Make sure you have Git configured with your GitHub credentials (SSH key or HTTPS token) and that you have access to the `mbari-org/dash5` repository.

---

## Clone and Install

```bash
# Clone the repo (use SSH if you have a key set up)
git clone git@github.com:mbari-org/dash5.git
cd dash5

# Install all workspace dependencies (this takes ~1–2 minutes the first time)
yarn install
```

`yarn install` installs dependencies for every package in the monorepo in one pass. You do **not** need to `cd` into individual packages and run install separately.

---

## Project Structure

```
dash5/
├── apps/
│   └── lrauv-dash2/           # Next.js app
│       ├── components/        # App-level React components and context providers
│       ├── lib/               # Custom hooks, utilities, and helpers
│       ├── pages/             # Next.js file-based routes
│       │   ├── index.tsx      # Overview map (home page)
│       │   └── vehicle/       # Per-vehicle deployment views
│       └── styles/            # Global CSS
├── packages/
│   ├── react-ui/
│   │   └── src/               # Shared component library
│   │       ├── Cells/         # Small display units
│   │       ├── Charts/
│   │       ├── Forms/
│   │       ├── Map/           # Leaflet/map components
│   │       ├── Modal/         # Base modal primitives
│   │       ├── Modals/        # Domain-specific modal components
│   │       ├── Tables/
│   │       └── ...
│   ├── api-client/
│   │   └── src/
│   │       ├── axios/         # Raw Axios request functions
│   │       └── react-query/   # React Query hooks wrapping the Axios calls
│   └── utils/
│       └── src/               # Pure helper functions (date, string, logging, etc.)
├── docs/                      # Developer documentation (you are here)
├── CLAUDE.md                  # AI assistant instructions — useful reading for conventions
└── README.md                  # Quick-start overview
```

### Key files to know

| File                                                     | Role                                            |
| -------------------------------------------------------- | ----------------------------------------------- |
| `apps/lrauv-dash2/pages/_app.tsx`                        | App entry point — providers, global layout      |
| `apps/lrauv-dash2/components/Layout.tsx`                 | Main shell: nav, sidebar, modal triggers        |
| `apps/lrauv-dash2/components/SelectedStationContext.tsx` | React context for map station selection state   |
| `packages/react-ui/src/index.ts`                         | Public exports for the component library        |
| `packages/api-client/src/index.ts`                       | Public exports for the API client               |
| `CLAUDE.md`                                              | Project coding conventions — good early reading |

---

## Running the Dev Server

### 1. Build the packages first

The two shared packages behave differently:

- **`@mbari/react-ui`** — `main` points to `src/index.ts` and Next.js has `transpilePackages` configured, so TypeScript edits are picked up by HMR without a rebuild. However, if you change styles, you will need to rebuild to regenerate `dist/mbari-ui.css`.
- **`@mbari/api-client`** — has an `exports` field that directs webpack to pre-built `dist/` files. Any change here **requires a rebuild** before the app reflects it.

As a safe default, build both before starting the dev server for the first time:

```bash
# From the repo root
yarn workspace @mbari/react-ui build
yarn workspace @mbari/api-client build
```

### 2. Start the dev server

```bash
cd apps/lrauv-dash2
yarn dev
```

This starts two processes on the same terminal:

- **Next.js dev server** on `http://localhost:3000`
- **API proxy** on `http://localhost:3002` (forwards requests to the TethysDash backend)

Wait until the terminal prints:

```
✓ Ready in Xs
```

Then open `http://localhost:3000` in your browser.

> **Note:** The app proxies API calls to the TethysDash staging server. Ask Karen or the team for the correct `.env.local` file if the app shows connection errors on startup.

---

## Making Changes — The Critical "Rebuild" Rule

This is the most important thing to understand about the local dev loop.

**Editing `apps/lrauv-dash2/`** — HMR picks up changes automatically. No restart needed.

**Editing TypeScript/TSX in `packages/react-ui/`** — HMR picks these up too, because the package is compiled in-place by Next.js via `transpilePackages`. No rebuild needed for TS/TSX changes. Exception: if you change styles, rebuild to regenerate the CSS:

```bash
yarn workspace @mbari/react-ui build
```

**Editing anything in `packages/api-client/`** — always requires a full rebuild and dev server restart, because webpack resolves it through pre-built `dist/` files:

```bash
# From the repo root:
yarn workspace @mbari/api-client build

# Free the dev server ports
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null

# Clear Next.js cache and restart
rm -rf apps/lrauv-dash2/.next
cd apps/lrauv-dash2 && yarn dev
```

---

## Running Tests

### Unit / component tests (Jest)

```bash
# Single shared package
yarn workspace @mbari/react-ui test
yarn workspace @mbari/api-client test

# App unit tests (Jest, not Playwright)
yarn workspace @mbari/lrauv-dash2 test:ci

# Single test file in the app
yarn workspace @mbari/lrauv-dash2 test:ci -- --testPathPattern=CommsSection
```

> **Note:** `yarn test` at the repo root runs `turbo run test`, which triggers each workspace's `test` script — including Playwright for the app. Use the `test:ci` script above when you only want Jest.

### End-to-end tests (Playwright)

```bash
cd apps/lrauv-dash2
yarn test   # Playwright starts the dev server automatically; reuses it if already running
```

### Linting

```bash
# Lint and auto-fix shared packages (packages/*/src/)
yarn lint
yarn lint:watch   # live, on save

# Lint the Next.js app
yarn workspace @mbari/lrauv-dash2 lint
```

---

## Code Style and Conventions

A few things to internalize early:

- **TypeScript everywhere.** All files are `.ts` or `.tsx`. Type all props, return values, hook signatures, and API shapes explicitly.
- **2-space indentation, single quotes, no semicolons.** The linter (ESLint + Prettier) will enforce this automatically.
- **Functional components only.** No class components. Use hooks (`useState`, `useCallback`, `useMemo`, `useContext`, etc.).
- **Import order:** React → third-party libraries → local modules. Group by blank lines.
- **Test file naming:** `ComponentName.test.tsx`, living alongside the component file.
- **Avoid obvious comments.** Comments should explain _why_, not _what_. Don't narrate the code.
- **Error handling:** use `try/catch` or the project's `tryCatch` helper from `@mbari/utils`.

---

## Branching and Pull Request Workflow

1. **Always branch off `develop`**, not `main`.

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

2. **Commit messages** are conventional: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, etc.

3. **Open a PR against `develop`**.

4. **All PRs need Karen's review and approval before merge.** Do not merge your own PR. Ping Karen when it's ready for review — she'll take a look and may have feedback or want to discuss the change before it goes in.

5. Deployment is automatic:
   - Merges to `develop` → staging environment (automatic via Watchtower)
   - Merges to `main` → production (manual deploy step)

---

## Who to Ask

| Person    | Role                               | Best for                                                                                 |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **Karen** | Dash 5 lead — your primary contact | Code reviews, architecture decisions, PR merges, "is this the right approach?" questions |
| **Quinn** | LRAUV software engineering lead    | Operational context, what features matter most to operators                              |
| **Zack**  | Contributor, past PR reviewer      | Has reviewed most recent PRs; good for "what did we do in PR #X?" questions              |

Don't hesitate to ask questions early and often. The codebase has some accumulated complexity and the team would rather answer a question upfront than have you go down a wrong path for a day.

---

_Last updated: June 2026_
