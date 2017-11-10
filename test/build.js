const test = require('tape')
const build = require('../build')

test('Should successfully build', (t) => {
  t.plan(1)

  const repo = 'git@github.com:alanshaw/tableflip-www.git'
  const commit = 'master'
  const opts = {stdout: process.stdout, stderr: process.stderr}

  build(repo, commit, opts, (err) => {
    t.ifError(err, 'No error building')
    t.end()
  })
})
