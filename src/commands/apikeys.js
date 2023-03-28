const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'apikey',
  resourcePluralName: 'apikeys',
  columns: ['uuid', 'name', 'description', 'permissions']
})
