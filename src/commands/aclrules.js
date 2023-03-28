const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({
  resourceSingularName: 'aclrule',
  resourcePluralName: 'aclrules',
  columns: ['uuid', 'roleId', 'accountId']
})
