const prettyjson = require('prettyjson')
const chalk = require('chalk')
const { Column } = require('./column')
const Table = require('cli-table')

function access (s, obj) { return s.split('.').reduce((p, c) => (p && p[c]) || null, obj) }
/**
 *
 * @param {Array} items Rows to render
 * @param {Array} columns Name of fields to render
 */
function renderList (items, columns = ['uuid', 'name']) {
  columns = columns.map(c => new Column(c))
  if (!items || items.length === 0) {
    return console.log(' No results')
  }
  if (!Array.isArray(items)) {
    items = [items]
  }
  const tableData = items.map(item => {
    return columns.map(col => {
      return col.renderValue(access(col.name, item) || '-')
    })
  })

  const t = new Table({
    style: { head: ['cyan'] },
    head: columns.map(c => c.alias)
  })
  tableData.forEach(i => t.push(i))
  console.log(t.toString())
}

function renderObject (obj) {
  console.log('')
  console.log(prettyjson.render(obj))
  console.log('')
}

function renderError (err) {
  const PrettyError = require('pretty-error')
  const pe = new PrettyError()
  console.log('')
  console.log(pe.render(err))
}

function renderMessage (level, msg) {
  const levels = {
    ok: chalk.green,
    info: chalk.blueBright,
    warn: chalk.yellow,
    error: chalk.red
  }
  console.log('')
  console.log(`${levels[level](level)}  ${msg}`)
}

module.exports = { renderList, renderObject, renderError, renderMessage }
