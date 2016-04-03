#!/usr/bin/env node

const
  cli = require('cli'),
  chokidar = require('chokidar'),
  devsync = require('../')

const
  options = cli.parse({
    cwd: ['c', 'Path to the library', 'file', './'],
    target: ['t', 'Path to the package(s) which has dependency', 'file', '../'],
    watch: ['w', 'Watch the library']
  })

if (options.watch) {
  chokidar.watch(options.cwd, {
    ignored: [] // TODO: ignore some files
  }).on('all', (e, p) => {
    console.log(`Update detected: ${ p }`)
    devsync(options)
  })
} else {
  devsync(options)
}
