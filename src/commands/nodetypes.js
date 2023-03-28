const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'nodetype',
  resourcePluralName: 'nodetypes',
  aliases: ['ndt'],
  columns: ['uuid', 'name', 'manufacturer', 'description']
})
