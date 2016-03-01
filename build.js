var Path = require('path')
var Fs = require('fs')
var mkdirp = require('mkdirp')
var Async = require('async')
var Git = require('./git')
var Npm = require('./npm')

module.exports = () => {
  var buildQueues = {}

  return (url, commit, opts, cb) => {
    if (!cb) {
      cb = opts
      opts = {}
    }

    opts = opts || {}
    opts.path = opts.path || Path.join(process.cwd(), 'build')

    var queue = buildQueues[url] = buildQueues[url] || Async.queue(build)
    return queue.push({url: url, commit: commit, options: opts}, cb)
  }
}

function build (task, cb) {
  var buildPath = task.options.path
  var repoPath = Path.join(buildPath, getRepoName(task.url))

  Async.waterfall([
    // Ensure build dir exists
    (cb) => mkdirp(buildPath, cb),
    // Determine if newly created or existing
    (made, cb) => Fs.access(repoPath, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      if (exists) {
        Git.checkout(repoPath, 'master', task.options, (err) => {
          if (err) return cb(err)
          Git.pull(repoPath, task.options, cb)
        })
      } else {
        Git.clone(buildPath, task.url, task.options, cb)
      }
    },
    // Checkout the commit
    (cb) => Git.checkout(repoPath, task.commit, task.options, cb),
    // npm install
    (cb) => Npm.install(repoPath, task.options, cb),
    // npm run build
    (cb) => Npm.run(repoPath, 'build', task.options, cb)
  ], cb)
}

function getRepoName (url) {
  return url.split('/').pop().replace('.git', '')
}
