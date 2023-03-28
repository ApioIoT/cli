const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'assettype',
  resourcePluralName: 'assettypes',
  aliases: ['att'],
  columns: ['uuid', 'name', 'manufacturer', 'description']
})
