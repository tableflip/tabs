const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const parse = require('github-url')
const build = require('../build')
const deploy = require('../deploy')

test('Should successfully deploy', (t) => {
  t.plan(4)

  const repo = 'git@github.com:alanshaw/tableflip-www.git'
  const commit = 'master'
  const opts = {stdout: process.stdout, stderr: process.stderr}

  build(repo, commit, opts, (err, info) => {
    t.ifError(err, 'No error building')

    // Add a new file to ensure changes and deploy happens
    const buildDir = Path.join(process.cwd(), 'build')
    const urlInfo = parse(repo)
    const distDir = Path.join(buildDir, urlInfo.user, urlInfo.project, 'dist')

    Fs.writeFile(Path.join(distDir, 'TEST'), `${Date.now()}`, (err) => {
      t.ifError(err, 'No error writing file to ensure changes')

      deploy(info.dir, repo, 'gh-pages', opts, (err, deployed) => {
        t.ifError(err, 'No error deploying')
        t.ok(deployed, 'Deployment happened')
        t.end()
      })
    })
  })
})
