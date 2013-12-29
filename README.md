# jsDelivr Official API


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

You can use any of the following parameters to search for libraries. A search will be performed for projects matching your input. You can use multiple parameters at the same time. If multiple projects match they all will be outputed.

* `name` - name of library. Example jquery
* `zip` - zip name of project. example jquery.zip
* `mainfile` - mainfile parameter in info.ini. example jquery.min.js
* `lastversion`- lastversion of the project. Example 2.0.3 (will match multiple projects)
* `versions` -  all hosted versions for selected project. (read only)
* `homepage`- webpage of project. Example http://jquery.com/
* `github`- github page of project. Example https://github.com/jquery/jquery
* `author` - the author of project. Example jQuery Foundation
* `assets` - files hosted per versions. (read only)


You can combine the above parameters with the parameter `fields`. This way you can control the output. For example to get the `mainfile` for jQuery you would run the following request.

```
http://api.jsdelivr.net/api/v1/libraries?name=jquery&fields=mainfile
```

Get hosted files per version for jQuery
```
http://jimaek-prod.apigee.net/api/v1/libraries?name=jquery&fields=assets
```

It's possible to set multiple fields using a comma for seperation.

```
http://api.jsdelivr.net/api/v1/libraries?name=jquery&fields=mainfile,name
```



Built with [rest-sugar](https://github.com/bebraw/rest-sugar)

