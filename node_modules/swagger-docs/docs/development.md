# Development
Make sure you have Node.js installed. Then execute following commands: 

```shell
git clone git@github.com:mohsen1/swagger-docs.git
cd swagger-docs
npm start
```
This will open a browser with current development version of Swagger Docs

#### ES6
This project uses EcmaScript 6 for source files. Make sure you are familiar with it before starting to edit files.
Pull requests that don't use ES6 where it's possible will get rejected.

#### `gulp` tasks
* `gulp` or `gulp build` to build an optimized version of your application in `/dist`
* `gulp serve` to launch a browser sync server on your source files
* `gulp serve:dist` to launch a server on your optimized application
* `gulp test` to launch your unit tests with Karma
* `gulp test:auto` to launch your unit tests with Karma in watch mode
* `gulp protractor` to launch your e2e tests with Protractor
* `gulp protractor:dist` to launch your e2e tests with Protractor on the dist files

### Configuring Swagger Docs
Read [configuration documentations here](./config.md)
