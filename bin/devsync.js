#!/usr/bin/env node

const
  cli = require('cli'),
  fsp = require('fs-promise'),
  chokidar = require('chokidar'),
  path = require('path'),
  devsync = require('../')

const
  raw = cli.parse({
    from: ['f', 'Path to the library', 'file', './'],
    to: ['t', 'Path to the package(s) which has dependency', 'file', '../'],
    watch: ['w', 'Watch the library']
  }),
  options = Object.assign(raw, {
    from: path.resolve(process.cwd(), raw.from),
    to: path.resolve(process.cwd(), raw.to)
  }),
  packageJsonPath = path.join(options.from, 'package.json')

fsp.readFile(packageJsonPath, 'utf8').then(meta => {
  if (options.watch) {
    chokidar.watch(options.from, {
      ignored: []
    }).on('all', (e, p) => {
      console.log(`Update detected: ${ p }`)
      devsync(options, meta)
    })
  } else {
    devsync(options, meta)
  }
})
