const test = require('tape')
const build = require('../build')

test('Should successfully build', (t) => {
  t.plan(1)

  var repo = 'git@github.com:alanshaw/tableflip-www.git'
  var commit = 'master'
  var opts = {stdout: process.stdout, stderr: process.stderr}

  build(repo, commit, opts, (err) => {
    t.ifError(err, 'No error building')
    t.end()
  })
})
