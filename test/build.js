var test = require('tape')
var build = require('../build')()

test('Should successfully build', (t) => {
  t.plan(1)

  var repo = 'https://github.com/alanshaw/tableflip-www.git'
  var commit = 'master'
  var opts = {stdout: process.stdout, stderr: process.stderr}

  build(repo, commit, opts, (err) => {
    t.ifError(err, 'No error building')
    t.end()
  })
})
