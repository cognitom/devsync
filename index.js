const
  co = require('co'),
  path = require('path'),
  fsp = require('fs-promise'),
  globby = require('globby'),
  spawn = require('./lib/spawn'),
  which = require('./lib/which')

module.exports = co.wrap(function* (options) {
  const
    cwd = path.resolve(process.cwd(), options.cwd),
    target = path.resolve(process.cwd(), options.target),
    rsyncPath = yield which('rsync'),
    metafile = path.join(cwd, 'package.json'),
    metatext = yield fsp.readFile(metafile, 'utf8'),
    meta = JSON.parse(metatext),
    patterns = [
      `node_modules/${ meta.name }`, // checks children
      `*/node_modules/${ meta.name }`, // checks grandchildren
    ],
    paths = yield globby(patterns, { cwd: target }),
    installed = paths.map(dir => path.resolve(target, dir)),
    args = [
      '--recursive', // recurse into directories
      '--delete', // delete extraneous files from dest dirs
      '--delete-excluded', // also delete excluded files from dest dirs
      '--cvs-exclude', // auto-ignore files in the same way CVS does
      '--exclude=node_modules',
      `${ cwd }/`
    ]

  for (var dir of installed) {
    try {
      yield spawn(rsyncPath, args.concat(`${ dir }/`))
      console.log(dir)
    } catch (err) {
      console.log(err.toString())
    }
  }
})
