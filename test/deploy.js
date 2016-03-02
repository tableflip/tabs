var test = require('tape')
var build = require('../build')()
var deploy = require('../deploy')()

test('Should successfully deploy', (t) => {
  t.plan(2)

  var repo = 'https://github.com/alanshaw/tableflip-www.git'
  var commit = 'master'
  var opts = {stdout: process.stdout, stderr: process.stderr}

  build(repo, commit, opts, (err, info) => {
    t.ifError(err, 'No error building')

    deploy(info.dir, repo, 'gh-pages', opts, (err) => {
      t.ifError(err, 'No error deploying')
      t.end()
    })
  })
})
