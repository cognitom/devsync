const
  which = require('npm-which')(process.cwd())

var cache = {}

/**
 * Promised Which
 */
module.exports = cmnd => cache[cmnd]
  ? Promise.resolve(cache[cmnd])
  : new Promise((resolve, reject) => {
    which(cmnd, (err, pathTo) => {
      if (err) reject(err)
      else resolve(cache[cmnd] = pathTo)
    })
  })
