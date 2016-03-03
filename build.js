const Path = require('path')
const Fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Async = require('async')
const parse = require('github-url')
const Git = require('./git')
const Npm = require('./npm')

module.exports = function build (repo, commit, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.dir = opts.dir || Path.join(process.cwd(), 'build')

  var urlInfo = parse(repo)
  var userDir = Path.join(opts.dir, urlInfo.user)
  var repoDir = Path.join(userDir, urlInfo.project)

  Async.waterfall([
    // Ensure user build dir exists
    (cb) => mkdirp(userDir, cb),
    // Determine if newly created or existing
    (made, cb) => Fs.access(repoDir, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      if (exists) {
        Git.checkout(repoDir, 'master', opts, (err) => {
          if (err) return cb(err)
          Git.pull(repoDir, 'origin', 'master', opts, cb)
        })
      } else {
        Git.clone(userDir, repo, opts, cb)
      }
    },
    // Checkout the commit
    (cb) => Git.checkout(repoDir, commit, opts, cb),
    // npm install
    (cb) => Npm.install(repoDir, opts, cb),
    // npm run build
    (cb) => Npm.run(repoDir, 'build', opts, cb)
  ], (err) => {
    if (err) return rimraf(repoDir, () => cb(err))
    cb(err, {dir: repoDir})
  })
}
