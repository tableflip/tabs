const Http = require('http')
const createHandler = require('github-webhook-handler')
const Async = require('async')
const build = require('./build')
const deploy = require('./deploy')

module.exports = (opts, cb) => {
  const handler = createHandler(opts.webhook)

  const server = Http.createServer((req, res) => {
    handler(req, res, (err) => {
      if (err) console.error(err)
      res.statusCode = 404
      res.end('no such location')
    })
  }).listen(opts.webhook.port, cb)

  const queues = {}

  handler.on('error', (err) => console.error('Webhook handler error', err))

  // https://developer.github.com/v3/activity/events/types/#pushevent
  handler.on('push', (event) => {
    const repo = event.payload.repository
    const headCommit = event.payload.head_commit

    if (!repo || !headCommit) {
      return console.warn('Ignoring unexpected push payload', event.payload)
    }

    const name = `${repo.ssh_url} @ ${headCommit.id}`
    const ref = event.payload.ref

    if (ref !== 'refs/heads/master') {
      return console.log(`Ignoring push event to ${ref} on ${name}`)
    }

    queues[repo.ssh_url] = queues[repo.ssh_url] || Async.queue(buildAndDeploy)

    console.log(`Queuing build ${name}`)

    queues[repo.ssh_url].push({
      url: repo.ssh_url,
      commit: headCommit.id,
      options: opts
    }, (err) => {
      if (err) console.error(`Failed to build/deploy ${name}`, err)
    })
  })

  return {server, handler, queues}
}

function buildAndDeploy (task, cb) {
  const name = `${task.url} @ ${task.commit}`
  console.log(`Commencing build ${name}`)

  build(task.url, task.commit, task.options.build, (err, info) => {
    if (err) return cb(err)

    console.log(`Successfully built ${name}`)

    deploy(info.dir, task.url, 'gh-pages', task.options.deploy, (err, deployed) => {
      if (err) return cb(err)

      if (!deployed) {
        console.log(`Deployment for ${name} was not needed`)
      } else {
        console.log(`Successfully deployed ${name}`)
      }

      cb()
    })
  })
}
