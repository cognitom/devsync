const
  path = require('path'),
  fsp = require('fs-promise'),
  glob = require('./lib/glob'),
  spawn = require('./lib/spawn'),
  which = require('./lib/which')

module.exports = (options, meta) => {
  var installed = []
  return glob(`node_modules/${ meta.name }`, { cwd: options.to })
    .then(paths => {
      installed = paths
      return which('rsync')
    })
    .then(rsyncPath => Promise.all(installed.map(to => {
      var args = [
        '--recursive', // recurse into directories
        '--delete', // delete extraneous files from dest dirs
        '--delete-excluded', // also delete excluded files from dest dirs
        '--cvs-exclude', // auto-ignore files in the same way CVS does
        '--exclude=node_modules',
        `"${ options.from }/"`,
        `"${ to }/"`
      ]
      return spawn(rsyncPath, args)
    })))
    .then(() => {
      console.log('Sync completed.')
    })
}
