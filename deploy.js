const Path = require('path')
const Fs = require('fs')
const Async = require('async')
const rimraf = require('rimraf')
const cpr = require('cpr')
const parse = require('github-url')
const Git = require('./git')

// Deploy built `dir` to `repo` on `branch`
module.exports = function deploy (dir, repo, branch, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  const userDir = Path.resolve(dir, '..')
  const repoDir = Path.join(userDir, `${parse(repo).project}#${branch}`)

  Async.waterfall([
    // Determine if newly created or existing
    (cb) => Fs.access(repoDir, Fs.F_OK, (err) => cb(null, !err)),
    // Clone or pull the repo
    (exists, cb) => {
      let tasks = []

      // Add the clone task if not exists
      if (!exists) {
        tasks = [
          (cb) => {
            const cloneOpts = Object.assign({}, opts, {cloneDir: repoDir})
            Git.clone(userDir, repo, cloneOpts, cb)
          }
        ]
      }

      tasks = tasks.concat([
        (cb) => Git.branch.list.all(repoDir, opts, cb),
        (branches, cb) => {
          if (branches.indexOf(branch) > -1) {
            return Git.checkout(repoDir, branch, opts, cb)
          }

          // Is existing remote branch?
          if (branches.indexOf(`remotes/origin/${branch}`) > -1) {
            const branchOpts = Object.assign({}, opts, {startPoint: `origin/${branch}`})

            return Git.branch(repoDir, branch, branchOpts, (err) => {
              if (err) return cb(err)

              Git.checkout(repoDir, branch, opts, (err) => {
                if (err) return cb(err)
                if (!exists) return cb() // No need to pull if it was just cloned
                Git.pull(repoDir, 'origin', branch, opts, cb)
              })
            })
          }

          // Create if not exists
          const checkoutOpts = Object.assign({}, opts, {orphan: true})
          Git.checkout(repoDir, branch, checkoutOpts, cb)
        }
      ])

      Async.waterfall(tasks, cb)
    },
    // Remove old files
    (cb) => {
      const rimrafOpts = {glob: {nosort: true, silent: true, dot: true}}
      rimraf(Path.join(repoDir, '**/!(.git)'), rimrafOpts, cb)
    },
    // Copy new files
    (cb) => cpr(Path.join(dir, 'dist'), repoDir, {overwrite: true}, cb),
    // Detect if something changed
    (files, cb) => Git.isClean(repoDir, opts, cb),
    // Commit & push
    (isClean, cb) => {
      if (isClean) return cb(null, false)

      Async.waterfall([
        (cb) => Git.add.all(repoDir, opts, cb),
        (cb) => Git.commit(repoDir, 'Built by TABS', opts, cb),
        (cb) => Git.push(repoDir, 'origin', branch, opts, cb)
      ], (err) => {
        if (err) return cb(err)
        cb(null, true)
      })
    }
  ], (err, deployed) => {
    if (err) return rimraf(repoDir, () => cb(err))
    cb(null, deployed)
  })
}
