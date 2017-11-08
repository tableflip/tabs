const ChildProcess = require('child_process')

module.exports = function (file, args, cwd, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  if (!Array.isArray(args)) {
    args = [args]
  }

  if (opts.stdout) {
    const command = '> ' + [file].concat(args).join(' ') + '\n'
    opts.stdout.write(command)
  }

  const execOpts = {cwd: cwd}

  if (opts.env) {
    execOpts.env = opts.env
  }

  const proc = ChildProcess.execFile(file, args, execOpts, cb)

  if (opts.stdout) proc.stdout.pipe(opts.stdout)
  if (opts.stderr) proc.stderr.pipe(opts.stderr)
}
