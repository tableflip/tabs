var test = require('tape')
var createWebhook = require('../webhook')

test('Should build initiate build and deploy when webhook received', (t) => {
  t.plan(4)

  var config = {
    webhook: {
      path: '/webhook',
      secret: '(╯°□°）╯︵TABLEFLIP',
      port: 7777
    }
  }

  var build = (url, commit, opts, cb) => process.nextTick(() => {
    t.ok(true, 'Build triggered')
    cb()
  })

  var deploy = (dir, opts, cb) => process.nextTick(() => {
    t.ok(true, 'Deploy triggered')
    cb()
  })

  var webhook = createWebhook(build, deploy, config, () => {
    t.ok(true, 'Webhook server started')

    var event = {
      payload: {
        repository: {
          clone_url: 'https://github.com/TEST/FAKE.git',
          head_commmit: {
            id: 'a0342ede2ea56r799d8ad40937267ba2875e9d88'
          }
        }
      }
    }

    // Fake a push event
    webhook.handler.emit('push', event)

    setTimeout(() => { // This should take less than a second!
      webhook.server.close((err) => {
        t.ifError(err, 'No error closing webhook server')
        t.end()
      })
    }, 1000)
  })
})
