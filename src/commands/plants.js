const { getCRUDCommand } = require('../command')

module.exports = getCRUDCommand({ resourceSingularName: 'plant', resourcePluralName: 'plants' })
