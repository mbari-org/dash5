# MBARI

## Setup

Simply install the project dependencies, run the bootstrap script to build the packages in this monorepo, and start the client workspace. See the specific README for each workspace for any additional setup that may be required.

```
yarn install
./scripts/bootstrap.build
yarn workspace lrauv-dash2 start
```

### Deployment

Deployments are handled via [CircleCI](https://www.circleci.com).

## Packages

### react-ui

A typescript based module that utilizes tailwind css and react storyboard to build, manage, and document the interface components used on the dash2 client application.

### lrauv-dash2

This is the client side application for the second iteration of the LRAUV Dash application.

### utils

A common set of helper functions we may use in various packages within this monorepo.
