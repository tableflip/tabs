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

## Configure a site to be built

1. Navigate to **Settings** for the repo
2. In **Collaborators**, add `tableflip-deploy` as a collaborator with **write** access
3. in **Webhooks & services** add a new webhook with the following info:
    * Payload URL: `http://builder.tableflip.io:7777/webhook`
    * Content type: `application/json`
    * Secret: **Retrieve from secrets.yaml in infrastructure project**

## Programmatic usage

**build.js**
```js
var build = require('./build')

var repo = 'git@github.com:tableflip/tableflip-www.git'
var commit = 'a0342ede2ea56c799d8ad40937267ba2875e9d88'
var opts = {stdout: process.stdout, stderr: process.stderr}

build(repo, commit, opts, (err, info) => {
  console.log(`Built in ${info.dir}`)
})
```

**deploy.js**
```js
var deploy = require('./deploy')

var dir = '/path/to/built/tableflip-www'
var repo = 'https://github.com/tableflip/tableflip-www.git'
var opts = {stdout: process.stdout, stderr: process.stderr}

// Deploy built `dir` to `repo` on `branch`
deploy(dir, repo, 'gh-pages', opts, (err) => {
  console.log(`Deployed`)
})
```
