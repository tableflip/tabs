const Http = require('http')
const createHandler = require('github-webhook-handler')

module.exports = (Builder, opts, cb) => {
  var handler = createHandler(opts)

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
    console.log('Received a push event for %s to %s',
      event.payload.repository.name,
      event.payload.ref)

    console.log(event)

    var repo = event.payload.repository
    var name = `${repo.clone_url} @ ${repo.head_commmit.id}`

    console.log(`Commencing build ${name}`)

    Builder.build(repo.clone_url, repo.head_commmit.id, (err) => {
      if (err) return console.error(`Failed to build ${name}`, err)

      console.log(`Successfully built ${name}`)

      Builder.deploy(repo.clone_url, repo.head_commmit.id, (err) => {
        if (err) return console.error(`Failed to deploy ${name}`, err)
        console.log(`Successfully deployed ${name}`)
      })
    })
  })

  return server
}
