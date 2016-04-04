const
  test = require('ava'),
  path = require('path'),
  fsp = require('fs-promise'),
  del = require('del'),
  devsync = require('../')

const
  parentDir = path.resolve(__dirname, 'fixtures'),
  libDir = path.join(parentDir, 'your-library'),
  appDir = path.join(parentDir, 'your-app'),
  exists = file => new Promise(resolve =>{
    fsp.access(file, fsp.F_OK)
      .then(() => resolve(true))
      .catch(() => resolve(false))
  }),
  cleanUp = () => {
    const pattern = [
      'node_modules/your-library/**',
      '!node_modules/your-library'
    ]
    return del(pattern, { cwd: appDir })
  }

test.afterEach(t => cleanUp())

test.serial('copies to an empty dir (depth=1)', async t => {
  await devsync({ cwd: libDir, target: appDir, silent: true })

  for (var file of ['index.js', 'package.json', 'README.md', 'lib/add.js']) {
    const
      src = path.join(libDir, file),
      dest = path.join(appDir, 'node_modules/your-library', file)
    t.is(await fsp.readFile(src, 'utf8'), await fsp.readFile(dest, 'utf8'))
  }
})

test.serial('copies to an empty dir (depth=2)', async t => {
  await devsync({ cwd: libDir, target: parentDir, silent: true })

  for (var file of ['index.js', 'package.json', 'README.md', 'lib/add.js']) {
    const
      src = path.join(libDir, file),
      dest = path.join(appDir, 'node_modules/your-library', file)
    t.is(await fsp.readFile(src, 'utf8'), await fsp.readFile(dest, 'utf8'))
  }
})

test.serial('excludes defaults', async t => {
  await devsync({ cwd: libDir, target: appDir, silent: true })

  for (var file of ['node_modules', 'npm-debug.log']) {
    const dest = path.join(appDir, 'node_modules/your-library', file)
    t.false(await exists(dest))
  }
})

test.serial('skips files not included', async t => {
  await devsync({ cwd: libDir, target: appDir, silent: true })

  for (var file of ['test']) {
    const dest = path.join(appDir, 'node_modules/your-library', file)
    t.false(await exists(dest))
  }
})
