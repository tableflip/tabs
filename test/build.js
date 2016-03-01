var test = require('tape')
var build = require('../build')()

test('Should successfully build', (t) => {
  t.plan(1)

  var url = 'https://github.com/tableflip/tableflip-www.git'
  var commit = 'master'
  var opts = {stdout: process.stdout, stderr: process.stderr}

  build(url, commit, opts, (err) => {
    t.ifError(err, 'No error building')
    t.end()
  })
})
