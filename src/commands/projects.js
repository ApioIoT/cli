const { getCRUDCommand } = require('../command')
const { renderMessage } = require('../render')
const config = require('../configuration')

/**
 * Additional action to set the default project
 * @param {Array} params
 */
async function setDefaultProject (params) {
  const projectId = params[0]
  const projects = config.get('projects')
  const match = projects.find(p => p.uuid === projectId)
  if (!match) {
    return renderMessage('error', `Cannot find project with uuid ${projectId}. Check available projects with "apio projects get"`)
  }
  config.set('defaultProjectId', projectId)
  return renderMessage('ok', `Project "${match.name}" correctly set as default`)
}

module.exports = getCRUDCommand({
  resourceSingularName: 'project',
  resourcePluralName: 'projects',
  additionalActions: {
    'set-default': setDefaultProject
  }
})
