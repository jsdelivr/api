
# Public CDNs API

The jsDelivr API provides an interface for accessing information about the libraries hosted by major CDN's,
it's free to use and imposes no rate limits.

Currently supports the following CDN's:

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

## Usage

All [resources][resources-url] are exposed at `api.jsdelivr.com/v2`
at the appropriate [endpoints][endpoints-url].

## Response Resource Objects

All responses are in JSON or JSONP (if `callback` parameter is provided).

#### `library`

Queries to `/v2/<cdn>/libraries` are formatted as follows.

```
{
  "name": <libraryName>,
  "mainfile": <libraryMainFile | "">,
  "lastversion": <currentLibraryVersion>,
  "description": <libraryDescription | "">
  "homepage": <libraryHomepageURL | "">,
  "github": <libraryGihubURL | "">,
  "author": <libraryAuthor | "">,
  "versions": <arrayOfLibraryVersions>,
  "repositories": <arrayOfLibraryRepositories>,
  "meta": {
    "created": <apiLibraryCreationTime>,
    "updated": <apiLibraryUpdatedTime | undefined>
  }
}
```

Queries to `/v2/<cdn>/library` additionally include `assets` field.

```
"assets": [
  {
    "<version>": {
      "baseUrl": "<baseUrlOnTheCdn>",
      "files": <arrayOfFiles>,
      "mainfile": <libraryMainFileForThisVersion | "">
    }
  },
]
```

**Example**
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
  "assets": [
    {
      "1.0.1": {
        "files": [
          "jquery-1.0.1.pack.js",
          "jquery-1.0.1.js"
        ]
      }
    },
    ...
  ],
  "repositories": [
    {
      "type": "git",
      "url": "https://github.com/jquery/jquery"
    }
  ],
  "meta": {
    "created": 1436126637972,
  }
}
```

#### `error`

Should you ever be so unlucky, an error response is as follows.

```
{
  "status": <httpStatusCode>,
  "message": <errorMessage>
}
```

**Example**

```
api.jsdelivr.com/v2/foo

// =>
{
  "status": 404,
  "message": "Requested url /v2/foo not found."
}
```

## Endpoints

- `/<cdn>/libraries`
  - Returns an array of library objects for all libraries hosted by `<cdn>`; you can provide query arguments to narrow the scope of your search, or to return only specific object fields in the response.
  
  **Example**
  ```
  api.jsdelivr.com/v2/jsdelivr/libraries
  // => returns a list of all libraries hosted by the CDN
  ```

  **Optional Query Parameters**

  ```
  api.jsdelivr.com/v2/jsdelivr/libraries?name=jquery
  api.jsdelivr.com/v2/jsdelivr/libraries/jquery (alias)
  // => fuzzy string matching on the library name; returns jquery and jquerypp
  
  api.jsdelivr.com/v2/jsdelivr/libraries?name=jquery*
  // => while fuzzy matching only matches names that are very similar,
  // "*" means any number of any characters, so this will return all projects with names starting with jquery
  
  api.jsdelivr.com/v2/jsdelivr/libraries?name=jquery,bootstrap
  // => you can also use a comma to match several projects at once;
  // note that fuzzy matching is disabled in this case, but you can still use "*"
  
  api.jsdelivr.com/v2/jsdelivr/libraries?mainfile=jquery.min.js
  // => all libraries with mainfile named jquery.min.js
  
  api.jsdelivr.com/v2/jsdelivr/libraries?lastversion=2.0.3
  // => all libraries with lastversion equal to 2.0.3

  api.jsdelivr.com/v2/jsdelivr/libraries?author=jQuery%20Foundation
  // => all libraries by the specified author
  
  api.jsdelivr.com/v2/jsdelivr/libraries?homepage=http://jquery.com/
  // => all libraries with homepage equal to http://jquery.com/

  api.jsdelivr.com/v2/jsdelivr/libraries?github=https://github.com/jquery/jquery
  // => all libraries with github equal to https://github.com/jquery/jquery
  
  api.jsdelivr.com/v2/jsdelivr/libraries?fields=name,mainfile
  // => only include the specified fields in the response
  ```

- `/<cdn>/library/<library>`
  - Returns a library object for a specific library contained in the CDN; supports the same query parameters as `/<cdn>/libraries/`
- `/<cdn>/library/<library>/<version>`
  - Returns a list of files for the specified `<version>` of `<library>`

[usage-url]: #usage
[resources-url]: #response-resource-objects
[resources-library-url]: #library
[resources-error-url]: #error
[endpoints-url]: #endpoints
