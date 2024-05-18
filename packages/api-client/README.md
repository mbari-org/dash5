# API Client

Any API request required to communicate to the `tethysdash` API.

To test this project:

```
yarn workspace @mbari/api-client test
```

To build this project:

```
yarn workspace @mbari/api-client build
```

## Generating New Requests

Use our scaffolding library. To create a new axios request you can create one as follows:

```
yarn scaffold -t axiosRequest ./packages/api-client/src/axios/TrackDB/getPlatforms -method get
```

Where getPlatforms is the name of the actual request and `-method` is the HTTP verb that will be used.
