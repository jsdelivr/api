
# Public CDNs API

The JSDelivr API provides a queryable interface for accessing information about the libraries hosted by major CDN's,
the API is free to use and imposes no rate limit on the end user.

Currently supporting the following CDN's:

- `jsdelivr`
- `cdnjs`
- `bootstrap`
- `google`
- `jquery`

*For v1 API docs, please see the [v1 README](v1README.md).*

## Index

- [Usage][usage-url]
- [Resources Served by the API][resources-url]
  - [library][resources-library-url]
  - [error][resources-error-url]
- [API Endpoints][endpoints-url]
- [Optinal Query Parameters][parameters-query-url]
  - [Query Scoping Parameters][parameters-scoping-url]
  - [Response Modifier Parameters][parameters-modifier-url]

## Usage

All [resources][resources-url] are exposed at `api.jsdelivr.com/v2`
at the appropriate [endpoints][endpoints-url].

## Response Resource Objects

All responses are given in JSON format.

#### `library`

Queries to either the `.../libraries` or `.../library/<library>` endpoints are formatted as follows.

```
{
  "name": <libraryName>,
  "mainfile": <libraryMainFile>,
  "lastversion": <currentLibraryVersion>,
  "description": <libraryDescription | "">
  "homepage": <libraryHomepageURL | "">,
  "github": <libraryGihubURL | "">,
  "author": <libraryAuthor | "">,
  "versions": <arrayOfLibraryVersions>,
  "meta": {
    "created": <apiLibraryCreationTime>,
    "updated": <apiLibraryUpdatedTime | undefined>
  }
}
```

e.g.
```
api.jsdelivr.com/v2/jsdelivr/library/jquery

// =>
{
  "name": "jquery",
  "mainfile": "jquery.min.js",
  "lastversion": "2.1.4",
  "description": "jQuery is a fast and concise JavaScript Library that simplifies HTML document traversing, event handling, animating, and Ajax interactions for rapid web development. jQuery is designed to change the way that you write JavaScript.",
  "homepage": "http://jquery.com/",
  "github": "https://github.com/jquery/jquery",
  "author": "jQuery Foundation",
  "versions": [
    "2.1.4",
    "2.1.3",
    ...
  ],
  "meta": {
    "created": 1436126637972,
  }
}
```

#### `error`

Should you ever be so unlucky, an error response is as follows

```
{
  "status": <httpStatusCode>,
  "message": <errorMessage>
}
```

e.g.

```
api.jsdelivr.com/v2/foo

// =>
{
  "status": 404,
  "message": "Requested url /v2/foo not found."
}
```

## Endpoints

Where `<cdn> == jsdelivr | cdnjs | google | bootstrap`,
`<library>` is a library provided by `<cdn>`
and `<version>` is some version of `<library>`.

- `/<cdn>/libraries`
  - Returns an array of library objects for all libraries hosted by <cdn>;
  optionally provide query arguments to narrow the scope of your search or to return only specific object fields in the response.

  e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries

  // specify a named library

  api.jsdelivr.com/v2/jsdelivr/libraries?name=<library>
  ```

- `/<cdn>/library/<library>`
  - Returns a library object for a specific library contained in the CDN;
  optionally provide query parameters to return specific response fields.
- `/<cdn>/library/<library>/<version>/files`
  - Get low level information about the files w/i `<version>` of `<library>`
- `/analytics/<library>`
  - Returns CDN hit metrics for the named library in the formate `{<date>: <hitsTotal>}`.
  - Optionally specify `from_date` (default '30 days ago') and/or `to_date` (default 'today') in your query.

## Optional Query Parameters

> Providing multiple parameters in a single search will cause all parameters to be applied, and the resulting set returned.

### Scoping Parameters

The following parameters may be used to scope an API query response.

- `name` - name of the library.
  -  Fuzzy string matching on the library name is supported e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?name=jquery

  // => returns both jquery and jquerypp
  ```
- `mainfile` - mainfile parameter in info.ini.
  - Query string is evaluated on a strictly equal basis e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?mainfile=jquery.min.js
  ```
- `lastversion`- lastversion of the project.
  - e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?lastversion=2.0.3

  // => matches multiple projects
  ```
- `author` - the author of project. Example: jQuery Foundation
  - e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?author=jQuery%20Foundation
  ```

### Modifier Parameters

The following parameters can be provided to alter the response format of your query.

- `fields` - a comma delimited list of fields to return in the response,
  this will automatically exclude any fields *not* specified by `fields`.
  - e.g.

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?fields=name,mainfile

  // => this will return only the `name` and `mainfile` fields for all libraries hosted by JsDelivr
  ```

[usage-url]: #usage
[resources-url]: #response-resource-objects
[resources-library-url]: #library
[resources-error-url]: #error
[endpoints-url]: #endpoints
[parameters-query-url]: #optional-query-parameters
[parameters-scoping-url]: #scoping-parameters
[parameters-modifier-url]: #modifier-parameters
