var execFile = require('./exec-file')

module.exports = {
  install (path, opts, cb) {
    execFile('npm', 'install', path, opts, cb)
  },

  run (path, script, opts, cb) {
    execFile('npm', ['run', script], path, opts, cb)
  }
}
