const execFile = require('./exec-file')

const Git = {
  checkout (cwd, commit, opts, cb) {
    const args = ['checkout']
    if (opts && opts.orphan) args.push('--orphan')
    args.push(commit)
    execFile('git', args, cwd, opts, (err) => cb(err))
  },

  pull (cwd, remote, branch, opts, cb) {
    execFile('git', ['pull', remote, branch], cwd, opts, (err) => cb(err))
  },

  clone (cwd, repo, opts, cb) {
    const args = ['clone', repo]
    if (opts.cloneDir) args.push(opts.cloneDir)
    execFile('git', args, cwd, opts, (err) => cb(err))
  },

  branch (cwd, name, opts, cb) {
    const args = ['branch', name]
    if (opts && opts.startPoint) args.push(opts.startPoint)
    execFile('git', args, cwd, opts, (err) => cb(err))
  },

  push (cwd, remote, branch, opts, cb) {
    execFile('git', ['push', remote, branch], cwd, opts, (err) => cb(err))
  },

  add () {
    throw new Error('Not implemented')
  },

  commit (cwd, msg, opts, cb) {
    execFile('git', ['commit', '-m', msg], cwd, opts, (err) => cb(err))
  },

  isClean (cwd, opts, cb) {
    execFile('git', 'status', cwd, opts, (err, stdout) => {
      if (err) return cb(err)

      const clean = /working directory|tree clean/.test(stdout.toString())

      cb(null, clean)
    })
  }
}

Git.branch.list = () => {
  throw new Error('Not implemented')
}

Git.branch.list.all = (cwd, opts, cb) => {
  execFile('git', ['branch', '--list', '--all'], cwd, opts, (err, stdout) => {
    if (err) return cb(err)

    const branches = stdout.toString().trim().split('\n').map((branch) => {
      return branch.trim().replace(/[\s*]/g, '')
    })

    cb(null, branches)
  })
}

Git.add.all = (cwd, opts, cb) => {
  execFile('git', ['add', '-A'], cwd, opts, (err) => cb(err))
}

module.exports = Git
