const
  path = require('path'),
  fsp = require('fs-promise'),
  globby = require('globby'),
  spawn = require('./lib/spawn'),
  which = require('./lib/which')

module.exports = (options) => {
  const
    cwd = path.resolve(process.cwd(), options.cwd),
    target = path.resolve(process.cwd(), options.target)

  var installed = []
  return fsp.readFile(path.join(cwd, 'package.json'), 'utf8')
    .then(metatext => {
      const
        meta = JSON.parse(metatext)
        patterns = [
          `node_modules/${ meta.name }`, // checks children
          `*/node_modules/${ meta.name }`, // checks grandchildren
        ]
      return globby(patterns, { cwd: target })
    })
    .then(paths => {
      installed = paths.map(dir => path.resolve(target, dir))
      return which('rsync')
    })
    .then(rsyncPath => Promise.all(installed.map(dir => {
      var args = [
        '--recursive', // recurse into directories
        '--delete', // delete extraneous files from dest dirs
        '--delete-excluded', // also delete excluded files from dest dirs
        '--cvs-exclude', // auto-ignore files in the same way CVS does
        '--exclude=node_modules',
        `${ cwd }/`,
        `${ dir }/`
      ]
      console.log(dir)
      return spawn(rsyncPath, args)
    })))
    .catch(err => {
      console.log(err.toString())
    })
}
