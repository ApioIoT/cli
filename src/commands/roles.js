const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'role',
  resourcePluralName: 'roles',
  columns: ['uuid', 'name', 'description', 'permissions']
})
