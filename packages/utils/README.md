# Utils

A shared library containing a mix of utility or helper functions. It's likely this package can be a dependency in every other package contained within this monorepo and as such you should likely run the bootstrap script to rebuild all other associated packages in your environment if you want an update to take place on a local client you might be running.

To test this project:

```
yarn workspace utils test
```

To build this project:

```
yarn workspace utils build
```
