var execFile = require('./exec-file')

module.exports = {
  checkout (path, commit, opts, cb) {
    execFile('git', ['checkout', commit], path, opts, cb)
  },

  pull (path, opts, cb) {
    execFile('git', 'pull', path, opts, cb)
  },

  clone (path, url, opts, cb) {
    execFile('git', ['clone', url], path, opts, cb)
  }
}
