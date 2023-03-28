const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'event',
  resourcePluralName: 'events',
  aliases: ['evt'],
  columns: ['uuid', 'type', 'source', 'eventTime']
})
