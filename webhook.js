const Http = require('http')
const createHandler = require('github-webhook-handler')

module.exports = (build, deploy, opts, cb) => {
  var handler = createHandler(opts.webhook)

  var server = Http.createServer((req, res) => {
    handler(req, res, (err) => {
      if (err) console.error(err)
      res.statusCode = 404
      res.end('no such location')
    })
  }).listen(opts.port, cb)

  handler.on('error', (err) => console.error('Webhook handler error', err))

  // https://developer.github.com/v3/activity/events/types/#pushevent
  handler.on('push', (event) => {
    var repo = event.payload.repository
    var name = `${repo.clone_url} @ ${repo.head_commmit.id}`

    console.log(`Commencing build ${name}`)

    var dir = build(repo.clone_url, repo.head_commmit.id, opts.build, (err) => {
      if (err) return console.error(`Failed to build ${name}`, err)

      console.log(`Successfully built ${name}`)

      deploy(dir, opts.deploy, (err) => {
        if (err) return console.error(`Failed to deploy ${name}`, err)
        console.log(`Successfully deployed ${name}`)
      })
    })
  })

  return {server, handler}
}
