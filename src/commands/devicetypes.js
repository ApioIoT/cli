const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'devicetype',
  resourcePluralName: 'devicetypes',
  aliases: ['dvt'],
  columns: ['uuid', 'name', 'manufacturer', 'description']
})
