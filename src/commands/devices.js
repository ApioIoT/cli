const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'device',
  resourcePluralName: 'devices',
  aliases: ['dvc'],
  columns: ['uuid', 'name', { name: 'deviceType.name', alias: 'Device Type' }]
})
