# jsDelivr Official API

Built with [rest-sugar](https://github.com/bebraw/rest-sugar)

## Documentation

Root: `api/v1/libraries`. 

Only GET requests are allowed. No limits are set.


Get all hosted libraries in JSON format

```
http://api.jsdelivr.net/api/v1/libraries
```


Get full information for a single library based on `name` parameter.

```
http://api.jsdelivr.net/api/v1/libraries?name=jquery
```

You can use any of the following parameters to search for libraries. A search will be performed for projects matching your input. If multiple projects match they all will be outputed :

* `name` - name of library. Example jquery
* `zip` - zip name of project. example jquery.zip
* `mainfile` - mainfile parameter in info.ini. example jquery.min.js
* `lastversion`- lastversion of the project. Example 2.0.3 (will match multiple projects)
* `homepage`- webpage of project. Example http://jquery.com/"
* `github`- github page of project. Example https://github.com/jquery/jquery
* `author` the author of project. Example jQuery Foundation


```
http://jsdelivr-api.herokuapp.com/api/v1/libraries?name=jquery&fields=mainfile,name
```
