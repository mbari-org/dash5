# MBARI

## Setup

Simply install the project dependencies, run the bootstrap script to build the packages in this monorepo, and start the client workspace. See the specific README for each workspace for any additional setup that may be required.

```
yarn install
yarn build
yarn workspace @mrari/lrauv-dash2 start
```

If you want to run tests across the entire monorepo you can run the following command from the project root:

```
yarn test
```

### Autostart the UI Development Environment With VSCode Tasks

We have supplied some default tasks located in `.vscode/tasks.json`. You can load these in VSCode by hitting `cmd+shift+P` and searching / selecting `"Tasks: Manage Automated Tasks in Folder"`. Upon selecting this option just close and re-open this project in VSCode. Three terminal windows will appear automatically launching the storybook, jest, and tailwind under watch commands so that you can get straight into developing your project.

### A Note on Monorepo Dependencies

Some projects in this repo depend on their siblings. For example the `@mbari/react-ui` package depends on `@mbari/utils` package. If you update `@mbari/utils` you will need to run `yarn build` from the project root to rebuild the packages and then restart your storybook and test runner so that the updated build is loaded.

### Deployment

Deployments are handled automatically via [CircleCI](https://www.circleci.com).

## Packages

### @mbari/react-ui

A typescript based module that utilizes tailwind css and react storyboard to build, manage, and document the interface components used on the dash2 client application. We've pre-fixed the ui workspace with 'react' to future proof in case we create a duplicate component set in another framework down the road (i.e. Vue.js)

### @mbari/utils

A common set of helper functions we may use in various packages within this monorepo.

## Apps

### lrauv-dash2

This is the client side application for the second iteration of the LRAUV Dash application.
