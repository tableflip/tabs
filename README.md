# TABS

TABLEFLIP Automated Build System.

## Getting started

1. Install Node.js
2. Install dependencies `npm install`
3. (Optional) Add TABS config file `.tabsrc` (defaults below):

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
2. In **Collaborators**, add `tableflip-tabs` as a collaborator with **write** access
3. in **Webhooks & services** add a new webhook with the following info:
    * Payload URL: `http://tabs.tableflip.io:7777/webhook`
    * Content type: `application/json`
    * Secret: **Retrieve from secrets.yaml for tabs-infrastructure project**

## Programmatic usage

**build.js**
```js
const build = require('./build')

const repo = 'git@github.com:tableflip/tableflip-www.git'
const commit = 'a0342ede2ea56c799d8ad40937267ba2875e9d88'
const opts = {stdout: process.stdout, stderr: process.stderr}

build(repo, commit, opts, (err, info) => {
  console.log(`Built in ${info.dir}`)
})
```

**deploy.js**
```js
const deploy = require('./deploy')

const dir = '/path/to/built/tableflip-www'
const repo = 'https://github.com/tableflip/tableflip-www.git'
const opts = {stdout: process.stdout, stderr: process.stderr}

// Deploy built `dir` to `repo` on `branch`
deploy(dir, repo, 'gh-pages', opts, (err) => {
  console.log(`Deployed`)
})
```
