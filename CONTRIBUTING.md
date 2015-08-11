
> Contributors Welcome!

## Environment Variables

The following environment variables **must** be specified for a production API instance:

- `GITHUB=<github token>`

- `SQL_HOST=<api sql instance host>`
- `SQL_PASSWORD=<api sql instance password>`

## Local Development

The jsdelivr api takes a dependency on [api-sync](https://github.com/jsdelivr/api-sync) to maintain a current data set,
it's advisable to test against a local api-sync instance when developing locally.

To that end:

1. Clone and run [api-sync](https://github.com/jsdelivr/api-sync), you may want to edit the `config/config.template.js` file
to restrict the scope of libraries (this provides a predictably small data set to test against).
2. Fork the [Jsdelivr api]([api-sync](https://github.com/jsdelivr/api), clone and edit the `config/config.template.js` file
s.t. `syncUrl` = `http://localhost:8000/data/` (or whatever endpoint your local api-sync instance is at).
3. Run the application via `node serve.js`.
