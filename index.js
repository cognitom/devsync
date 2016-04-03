const
  co = require('co'),
  path = require('path'),
  fsp = require('fs-promise'),
  globby = require('globby'),
  spawn = require('./lib/spawn'),
  which = require('./lib/which')

const
  defaultIncludes = [
    'package.json',
    'README', 'README.*',
    'CHANGELOG', 'CHANGELOG.*',
    'LICENSE', 'LICENCE'
  ],
  defaultExcludes = [
    'node_modules',
    'npm-debug.log'
  ]

module.exports = co.wrap(function* (options) {
  const
    cwd = path.resolve(process.cwd(), options.cwd),
    target = path.resolve(process.cwd(), options.target),
    rsyncPath = yield which('rsync'),
    metaFile = path.join(cwd, 'package.json'),
    metaText = yield fsp.readFile(metaFile, 'utf8'),
    meta = JSON.parse(metaText),
    patterns = [
      `node_modules/${ meta.name }`, // check children
      `*/node_modules/${ meta.name }` // check grandchildren
    ],
    paths = yield globby(patterns, { cwd: target }),
    installed = paths.map(dir => path.resolve(target, dir))

  var args = [
    '--recursive', // recurse into directories
    '--delete', // delete extraneous files from dest dirs
    '--delete-excluded', // also delete excluded files from dest dirs
    '--cvs-exclude' // auto-ignore files in the same way CVS does
  ]

  /**
   * Includes and excludes
   * see https://docs.npmjs.com/files/package.json#files
   * see https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package
   */
  if (meta.files){
    args = args
      .concat(defaultIncludes.map(file => `--include=${ file }`))
      .concat(meta.files.map(file => `--include=${ file }`))
      .concat(meta.files.map(file => `--include=${ file }/**`))
      .concat('--exclude=*')
  } else {
    args = args.concat(defaultExcludes.map(file => `--exclude=${ file }`))
    try {
      const
        ignoreFile = path.join(cwd, '.npmignore'),
        ignoreText = yield fsp.readFile(ignoreFile, 'utf8'),
        ignore = ignoreText.split('\n').filter(file => file && file[0] != '#')
      args = args.concat(ignore.map(file => `--exclude=${ file }`))
    } catch (err) { /* .npmignore not found */ }
  }

  /**
   * Rsync to each installed directory
   */
  for (var dir of installed) {
    try {
      yield spawn(rsyncPath, args.concat(`${ cwd }/`, `${ dir }/`))
      console.log(dir)
    } catch (err) {
      console.log(err.toString())
    }
  }
})
