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
        dir: './build'
      }
    }
    ```
4. Start the webhook `npm start`

## Programmatic usage

**build.js**
```js
var build = require('./build')()

var repo = 'https://github.com/tableflip/tableflip-www.git'
var commit = 'a0342ede2ea56c799d8ad40937267ba2875e9d88'
var opts = {stdout: process.stdout, stderr: process.stderr}

build(repo, commit, opts, (err, info) => {
  console.log(`Built in ${info.dir}`)
})
```
