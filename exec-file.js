const ChildProcess = require('child_process')
const xtend = require('xtend')

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
    var command = '> ' + [file].concat(args).join(' ') + '\n'
    opts.stdout.write(command)
  }

  var execOpts = {cwd: cwd}

  if (opts.env) {
    execOpts = xtend(execOpts, {env: opts.env})
  }

  var proc = ChildProcess.execFile(file, args, execOpts, cb)

  if (opts.stdout) proc.stdout.pipe(opts.stdout)
  if (opts.stderr) proc.stderr.pipe(opts.stderr)
}
