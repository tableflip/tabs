#!/usr/bin/env node
const Path = require('path')

const config = require('rc')('builder', {
  webhook: {
    path: '/webhook',
    secret: '(╯°□°）╯︵TABLEFLIP',
    port: 7777
  },
  build: {
    dir: Path.join(process.cwd(), 'build'),
    stdout: process.stdout,
    stderr: process.stderr
  },
  deploy: {
    /* Some deploy config here? */
  }
})

const createWebhook = require('../webhook')

const webhook = createWebhook(config, () => {
  console.log('Webhook server running on %j', webhook.server.address())
})
