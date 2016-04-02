const
  glob = require('glob')

/**
 * Promised Glob
 */
module.exports = (pattern, options) =>
  new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
