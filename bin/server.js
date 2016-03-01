#!/usr/bin/env node
var Path = require('path')

var config = require('rc')('builder', {
  webhook: {
    path: '/webhook',
    secret: '(╯°□°）╯︵TABLEFLIP',
    port: 7777
  },
  build: {
    path: Path.join(process.cwd(), 'build'),
    stdout: process.stdout,
    stderr: process.stderr
  },
  deploy: {
    /* Some deploy config here? */
  }
})

var createWebhook = require('../webhook')

var build = require('../build')()
var deploy = require('../deploy')()

var webhook = createWebhook(build, deploy, config, () => {
  console.log('Webhook server running on %j', webhook.server.address())
})
