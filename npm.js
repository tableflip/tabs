const execFile = require('./exec-file')
const xtend = require('xtend')

module.exports = {
  install (path, opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    opts = opts || {}

    // Ensure development NODE_ENV for installing dependencies since
    // devDependencies are used for building the site
    opts.env = xtend(process.env, {NODE_ENV: 'development', npm_config_production: false}, opts.env)

    execFile('npm', 'install', path, opts, (err) => cb(err))
  },

  run (path, script, opts, cb) {
    execFile('npm', ['run', script], path, opts, (err) => cb(err))
  }
}
