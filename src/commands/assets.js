const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'asset',
  resourcePluralName: 'assets',
  aliases: ['ast'],
  columns: ['uuid', 'name', { name: 'assetType.name', alias: 'Asset Type' }]
})
