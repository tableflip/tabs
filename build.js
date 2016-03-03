var Path = require('path')
var Fs = require('fs')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var Async = require('async')
var parse = require('github-url')
var Git = require('./git')
var Npm = require('./npm')

module.exports = () => {
  var buildQueues = {}

  return (repo, commit, opts, cb) => {
    if (!cb) {
      cb = opts
      opts = {}
    }

    opts = opts || {}
    opts.dir = opts.dir || Path.join(process.cwd(), 'build')

    var queue = buildQueues[repo] = buildQueues[repo] || Async.queue(build)
    return queue.push({repo, commit, options: opts}, cb)
  }
}

function build (task, cb) {
  var urlInfo = parse(task.repo)
  var userDir = Path.join(task.options.dir, urlInfo.user)
  var repoDir = Path.join(userDir, urlInfo.project)

  Async.waterfall([
    // Ensure user build dir exists
    (cb) => mkdirp(userDir, cb),
    // Determine if newly created or existing
    (made, cb) => Fs.access(repoDir, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      if (exists) {
        Git.checkout(repoDir, 'master', task.options, (err) => {
          if (err) return cb(err)
          Git.pull(repoDir, 'origin', 'master', task.options, cb)
        })
      } else {
        Git.clone(userDir, task.repo, task.options, cb)
      }
    },
    // Checkout the commit
    (cb) => Git.checkout(repoDir, task.commit, task.options, cb),
    // npm install
    (cb) => Npm.install(repoDir, task.options, cb),
    // npm run build
    (cb) => Npm.run(repoDir, 'build', task.options, cb)
  ], (err) => {
    if (err) return rimraf(repoDir, () => cb(err))
    cb(err, {dir: repoDir})
  })
}
