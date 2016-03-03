const test = require('tape')
const Async = require('async')
const createWebhook = require('../webhook')

test('Should build initiate build and deploy when webhook received', (t) => {
  t.plan(4)

  var config = {
    webhook: {
      path: '/webhook',
      secret: '(╯°□°）╯︵TABLEFLIP',
      port: 7777
    }
  }

  var mockBuild = (url, commit, opts, cb) => process.nextTick(() => {
    t.ok(true, 'Build triggered')
    cb(null, {dir: '/FAKE/BUILD/DIR'})
  })

  var mockDeploy = (dir, repo, branch, opts, cb) => process.nextTick(() => {
    t.ok(true, 'Deploy triggered')
    cb()
  })

  var mockBuildAndDeploy = (task, cb) => {
    mockBuild(task.url, task.commit, task.options.build, (err, info) => {
      if (err) return cb(err)
      mockDeploy(info.dir, task.url, 'gh-pages', task.options.deploy, cb)
    })
  }

  var webhook = createWebhook(config, () => {
    t.ok(true, 'Webhook server started')

    var repo = 'git@github.com:TEST/FAKE.git'

    // Use a queue that uses our mock task processor
    webhook.queues[repo] = Async.queue(mockBuildAndDeploy)

    // Fake a push event
    var event = {
      payload: {
        ref: 'refs/heads/master',
        repository: {
          ssh_url: repo
        },
        head_commit: {
          id: 'a0342ede2ea56r799d8ad40937267ba2875e9d88'
        }
      }
    }

    webhook.handler.emit('push', event)

    setTimeout(() => { // This should take less than a second!
      webhook.server.close((err) => {
        t.ifError(err, 'No error closing webhook server')
        t.end()
      })
    }, 1000)
  })
})
