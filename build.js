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
    opts.dir = opts.dir || Path.join(process.cwd(), 'build')

    var queue = buildQueues[url] = buildQueues[url] || Async.queue(build)
    return queue.push({url: url, commit: commit, options: opts}, cb)
  }
}

function build (task, cb) {
  var buildDir = task.options.dir
  var repoDir = Path.join(buildDir, getRepoName(task.url))

  Async.waterfall([
    // Ensure build dir exists
    (cb) => mkdirp(buildDir, cb),
    // Determine if newly created or existing
    (made, cb) => Fs.access(repoDir, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      if (exists) {
        Git.checkout(repoDir, 'master', task.options, (err) => {
          if (err) return cb(err)
          Git.pull(repoDir, task.options, cb)
        })
      } else {
        Git.clone(buildDir, task.url, task.options, cb)
      }
    },
    // Checkout the commit
    (cb) => Git.checkout(repoDir, task.commit, task.options, cb),
    // npm install
    (cb) => Npm.install(repoDir, task.options, cb),
    // npm run build
    (cb) => Npm.run(repoDir, 'build', task.options, cb)
  ], cb)

  return repoDir
}

function getRepoName (url) {
  return url.split('/').pop().replace('.git', '')
}
