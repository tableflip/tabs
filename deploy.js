var Path = require('path')
var Fs = require('fs')
var Async = require('async')
var rimraf = require('rimraf')
var cpr = require('cpr')
var xtend = require('xtend')
var Git = require('./git')

module.exports = () => {
  var deployQueues = {}

  // Deploy built `dir` to `repo` on `branch`
  return (dir, repo, branch, opts, cb) => {
    if (!cb) {
      cb = opts
      opts = {}
    }

    opts = opts || {}

    var queue = deployQueues[repo] = deployQueues[repo] || Async.queue(deploy)
    return queue.push({dir, repo, branch, options: opts}, cb)
  }
}

function deploy (task, cb) {
  var buildDir = Path.resolve(task.dir, '..')
  var repoDir = Path.join(buildDir, getRepoName(task.repo, task.branch))

  Async.waterfall([
    // Determine if newly created or existing
    (cb) => Fs.access(repoDir, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      var tasks = []

      // Add the clone task if not exists
      if (!exists) {
        tasks = [
          (cb) => {
            var cloneOpts = xtend(task.options, {cloneDir: repoDir})
            Git.clone(buildDir, task.repo, cloneOpts, cb)
          }
        ]
      }

      tasks = tasks.concat([
        (cb) => Git.branch.list.all(repoDir, task.options, cb),
        (branches, cb) => {
          if (branches.indexOf(task.branch) > -1) {
            return Git.checkout(repoDir, task.branch, task.options, cb)
          }

          // Is existing remote branch?
          if (branches.indexOf(`remotes/origin/${task.branch}`) > -1) {
            var branchOpts = xtend(task.options, {startPoint: `origin/${task.branch}`})

            return Git.branch(repoDir, task.branch, branchOpts, (err) => {
              if (err) return cb(err)

              Git.checkout(repoDir, task.branch, task.options, (err) => {
                if (err) return cb(err)
                if (!exists) return cb() // No need to pull if it was just cloned
                Git.pull(repoDir, 'origin', task.branch, task.options, cb)
              })
            })
          }

          // Create if not exists
          var checkoutOpts = xtend(task.options, {orphan: true})
          Git.checkout(repoDir, task.branch, checkoutOpts, cb)
        }
      ])

      Async.waterfall(tasks, cb)
    },
    // Remove old files
    (cb) => rimraf(Path.join(repoDir, '{**/*,!.git}'), {dot: true}, cb),
    // Copy new files
    (cb) => cpr(Path.join(task.dir, 'dist'), repoDir, cb),
    // Detect if something changed
    (files, cb) => Git.isClean(repoDir, task.options, cb),
    // Commit & push
    (isClean, cb) => {
      if (isClean) return cb()

      Async.waterfall([
        (cb) => Git.add.all(repoDir, task.options, cb),
        (cb) => Git.commit(repoDir, 'Built by builder', task.options, cb),
        (cb) => Git.push(repoDir, 'origin', task.branch, task.options, cb)
      ], cb)
    }
  ], (err) => {
    if (err) return rimraf(repoDir, () => cb(err))
    cb()
  })
}

function getRepoName (url, branch) {
  return url.split('/').pop().replace('.git', '') + '#' + branch
}
