const { getCRUDCommand } = require('../command')
const { Column } = require('../column')
const chalk = require('chalk')

module.exports = getCRUDCommand({
  resourceSingularName: 'node',
  resourcePluralName: 'nodes',
  columns: [
    new Column('uuid'),
    new Column('name'),
    new Column({
      name: 'connectivityStatus',
      alias: 'connectivity',
      renderFn: (v) => {
        if (v === 'connected') {
          return chalk.green(v)
        } else {
          return chalk.red(v)
        }
      }
    })
  ]
})
