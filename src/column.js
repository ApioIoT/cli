const chalk = require('chalk')

/**
 * Renders values to terminal
 * @param {*} v The value to display
 * @returns The encoded value to be displayed in a terminal
 */
function defaultRenderValue (v) {
  if (typeof v === 'object') {
    return JSON.stringify(v)
  } else if (typeof v === 'string') {
    if (v.length >= process.stdout.columns) {
      return v.substring(0, process.stdout.columns / 2) + '...'
    } else {
      return v
    }
  } else if (typeof v === 'boolean') {
    if (v) {
      return chalk.green(v)
    } else {
      return chalk.red(v)
    }
  } else {
    return v
  }
}

/**
 * Helper class used to render output values
 */
class Column {
  /**
   *
   * @param {String | {name,alias,renderFn}} conf
   */
  constructor (conf) {
    if (typeof conf === 'object') {
      const { name, alias, renderFn } = conf
      this.name = name
      this.alias = alias
      this.renderFn = renderFn || defaultRenderValue
    } else {
      this.name = conf
      this.alias = conf
      this.renderFn = defaultRenderValue
    }
  }

  renderName () {
    return this.alias
  }

  renderValue (v) {
    return this.renderFn(v)
  }
}

module.exports = { Column }
