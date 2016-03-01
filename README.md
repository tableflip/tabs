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
var build = require('./build')()

var url = 'https://github.com/tableflip/tableflip-www.git'
var commit = 'a0342ede2ea56c799d8ad40937267ba2875e9d88'
var opts = {stdout: process.stdout, stderr: process.stderr}

build(url, commit, opts, (err) => console.log('done'))
```
