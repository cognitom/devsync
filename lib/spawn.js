const
  spawn = require('child_process').spawn

/**
 * Promised Spawn
 */
module.exports = (cmnd, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    const program = spawn(cmnd, args, options)
    program.stdout.on('data', (data) => { console.log(data) })
    program.stderr.on('data', (data) => { reject(data) })
    program.on('close', (code) => { resolve() })
  })
