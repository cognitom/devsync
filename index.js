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
  ]

module.exports = co.wrap(function* (options) {
  const
    cwd = path.resolve(process.cwd(), options.cwd),
    target = path.resolve(process.cwd(), options.target),
    rsyncPath = yield which('rsync'),
    ignoreFile = path.join(cwd, '.npmignore'),
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

  if (meta.files){
    // see https://docs.npmjs.com/files/package.json#files
    const includes = meta.files.concat(defaultIncludes)
    args = args
      .concat(includes.map(file => `--include=${ file }`))
      .concat(includes.map(file => `--include=${ file }/**`))
      .concat('--exclude=*')
  } else {
    // see https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package
    try {
      yield fsp.access(ignoreFile, fsp.F_OK)
      // only if the file exists...
      const
        ignoreText = yield fsp.readFile(ignoreFile, 'utf8'),
        ignore = ignoreText.split('\n').filter(file => file && file[0] != '#')
      args = args.concat(ignore.map(file => `--exclude=${ file }`))
    } catch (err) { /* do nothing */ }
    args = args.concat(
      '--exclude=node_modules',
      '--exclude=npm-debug.log'
    )
  }

  for (var dir of installed) {
    try {
      yield spawn(rsyncPath, args.concat(`${ cwd }/`, `${ dir }/`))
      console.log(dir)
    } catch (err) {
      console.log(err.toString())
    }
  }
})
