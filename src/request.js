const req = require('@fatmatto/ptth')
const debug = require('debug')('@apio/cli')
const { renderMessage, renderError, renderObject } = require('./render')

/**
 * HTTP request with wrapped error logic
 * @param {Object} conf Request config
 */
async function request (conf) {
  try {
    debug('Making HTTP Request:', conf)
    conf.headers = conf.headers || {}
    conf.headers['x-client-name'] = 'apio-iot-cli'
    const res = await req(conf)
    debug(`Got this response: (${res.statusCode})`, { headers: res.headers, body: res.body })
    if (res.statusCode >= 500) {
      renderMessage('error', `Something went wrong on our side. Please try again. If the problem persists and you want to report this as a bug please attach the following request id: ${res.headers['x-request-id']}`)
      process.exit(1)
    }
    if (res.statusCode === 400) {
      renderMessage('warn', 'It looks like something was wrong with the request input.')
      if (res?.body?.error) {
        renderObject(res.body.error)
      }
      process.exit(1)
    } else if (res.statusCode === 401 && !conf.url.includes('authenticate')) {
      renderMessage('warn', 'It looks like you need to authenticate, maybe your token expired. Run "apio account login" again.')
      process.exit(1)
    } else if (res.statusCode === 403) {
      renderMessage('warn', 'It looks like your account is missing the permission to perform this action.')
      process.exit(1)
    } else if (res.statusCode >= 400) {
      renderMessage('error', 'It looks like something was wrong with the request')
      if (res?.body?.error) {
        renderObject(res.body.error)
      }
      process.exit(1)
    }
    return res
  } catch (err) {
    renderError(err)
    process.exit(1)
  }
}

module.exports = { request }
