# DASH5 Development Guidelines

## Build & Test Commands
- Build: `yarn build`
- Test all: `yarn test`
- Test single file: `yarn workspace <package-name> test <test-file-path>`
- Lint: `yarn lint` (or `yarn lint:watch` for live updates)
- Storybook: `yarn workspace react-ui storybook`

## Code Style
- TypeScript with React+Next.js in a Yarn monorepo structure
- 2-space indentation, single quotes, no semicolons
- Type all parameters, return values, and React props
- Use React functional components with hooks, not classes
- Follow existing import pattern: React → libraries → local modules
- Async/await preferred over raw promises
- Use compound components when applicable for complex UI
- PascalCase for components/interfaces, camelCase for variables/functions
- Handle errors with try/catch or the included `tryCatch` utility
- Prefix test files with component name (e.g., `Component.test.tsx`)

## Test Guidelines
- Write tests for all new components and logic
- Mock API calls and external dependencies
- Test rendering, interactions, error states