# Builder

## Getting started

1. Install Node.js
2. Install dependencies `npm install`
3. (Optional) Add builder config file `.builderrc` (defaults below):
    ```js
    {
      webhook: {
        path: '/webhook',
        secret: '(╯°□°）╯︵TABLEFLIP',
        port: 7777
      },
      build: {
        path: './build'
      }
    }
    ```
4. Start the webhook `npm start`

## Programmatic usage

**build.js**
```js
var build = require('./build')

var url = 'https://github.com/tableflip/marmalade-productions.git'
var commit = 'a888f56d1b6219ac13a1135535f7ef0a1455ce0c'
var opts = {stdout: process.stdout, stderr: process.stderr}

build(url, commit, opts, (err) => console.log('done'))
```
