var test = require('tape')
var build = require('../build')

var url = 'https://github.com/tableflip/marmalade-productions.git'
var commit = 'master'
var opts = {stdout: process.stdout, stderr: process.stderr}

test('Should successfully build', (t) => {
  t.plan(1)

  build(url, commit, opts, (err) => {
    t.ifError(err, 'No error building')
    t.end()
  })
})
