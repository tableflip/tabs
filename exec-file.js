var ChildProcess = require('child_process')

module.exports = function (file, args, cwd, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  if (!Array.isArray(args)) {
    args = [args]
  }

  var proc = ChildProcess.execFile(file, args, {cwd: cwd}, (err) => cb(err))

  if (opts.stdout) proc.stdout.pipe(opts.stdout)
  if (opts.stderr) proc.stderr.pipe(opts.stderr)
}
