#!/usr/bin/env node
var Path = require('path')

var Config = require('rc')('builder', {
  webhook: {
    path: '/webhook',
    secret: '(╯°□°）╯︵TABLEFLIP',
    port: 7777
  },
  build: {
    path: Path.join(process.cwd(), 'build'),
    stdout: process.stdout,
    stderr: process.stderr
  }
})

var createWebhookServer = require('../webhook')
var createBuilder = require('../')

var builder = createBuilder(Config.build)

var server = createWebhookServer(builder, Config.webhook, () => {
  console.log('Webhook server running on %j', server.address())
})
