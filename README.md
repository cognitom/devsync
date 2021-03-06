# Devsync

Sync your own npm library directly into the package which depends on it. This is like `npm link` but no symlink and temporally.

![concept](concept.png)

## Use case

Devsync might be useful in such a case:

- You have a main application `your-app`
- `your-app` has a dependency to `your-library`
- Adds features, or fixes bug on `your-library`
- Needs to update `your-library` in `your-app` locally, without `git push` or `npm publish`

## Installation

via GitHub

```bash
$ npm install -g cognitom/devsync
```

## Usage

Go to `your-library` directory and run `devsync`:

```bash
$ cd ~/Git/your-library
$ devsync
```

The example above assumes that you have a directory structure like this:

- `~/Git/your-app`: Your main application
- `~/Git/your-library`: Your library internally used in `your-app`

If you're working on the project at `Desktop`,  you could `devsync` like this:

```bash
$ cd ~/Git/your-library
$ devsync -t ~/Desktop/your-temporary-project
```

To watch and automatically `devsync`, `-w` flag would be useful:

```bash
$ cd ~/Git/your-library
$ devsync -w
```

## CLI options

### --target / -t

### --cwd / -c

### --watch / -w

### --silent / -s

## JavaScript API

```javascript
const
  devsync = require('devsync')

devsync({
  cwd: 'path/to/your-library',
  target: 'path/to/your-app'
})
```
