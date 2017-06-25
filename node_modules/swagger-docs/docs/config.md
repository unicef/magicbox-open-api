# Configuration

### `config.json` File

The `config.json` file is used to override defaults of Swagger Docs. If this file is not
provided Swagger Docs will use it's own defaults. You can find default [`config.json`](../src/config.json) under `src` folder.

#### Available configurations in `config.json`

##### `loadSwaggerFrom`
A relative or absolute URL of Swagger document you want to show in Swagger Docs. 
Swagger document can be in YAML or JSON.


#### Embedding configuration object
To speed up the startup speed you can embed the configuration object. Instead of serving configuration object from your server you can put a `<script>` tag in `<head>` of `index.html` and provide the configuration.
This script should define `swaggerDocsConfiguration` object that has configuration options in it.

###### Example
```html
<head>
  <script>
    window.swaggerDocsConfiguration = {
      loadSwaggerFrom: './my-swagger-doc.json'
    };
  </script>
</head>
```

#### Embedding Swagger specs object
You can also embed swagger specs object to speed up the startup time. You need to define `swaggerDocsSpecs` variable globally. It's best to put this code in `<head>` of `index.html`

###### Example
```html
<head>
  <script>
    window.swaggerDocsSpecs = {
      info: {/* ... */},
      paths: {/* ... */}
    };
  </script>
</head
```
