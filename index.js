import fs from 'node:fs'
import { dirname } from 'node:path'

import {
  createTemplateString,
  parseVariables,
  replaceTemplateVariables,
  serialize,
} from './lib/template.js'

/**
 *
 * @typedef TemplateItem
 *
 * @param {Record<string,TemplateItem>} template
 * @param {string} outfile
 */
export function generateSDK(template = {}, outfile = './.generated/sdk.js') {
  const { get: getCode, update: updateCode, complete } = createTemplateString()

  const functionNames = Object.keys(template)

  for (const funcName of functionNames) {
    const templateObject = template[funcName]

    const { variables, unique: _uniqueVariables } = getAllVariables(
      template[funcName]
    )

    const url = replaceTemplateVariables(templateObject.url, variables)
    const body = replaceTemplateVariables(templateObject.body, variables)
    const midCode = getRequestorString(templateObject.method, url, body)

    updateCode(wrapCode(funcName, _uniqueVariables, midCode))
  }

  updateCode(`export {${functionNames.join(',')}}`)

  complete()

  fs.mkdirSync(dirname(outfile), { recursive: true })
  fs.writeFileSync(outfile, getCode(), 'utf8')
}

function wrapCode(funcName, vars, code) {
  return `function ${funcName}(requestor,{${vars.join(',')}}){` + code + '}'
}

function getAllVariables(templateObject) {
  let variables = []

  const matches = parseVariables(templateObject.url)

  if (matches && matches.length > 0) {
    variables = [...variables, ...matches]
  }

  if (templateObject.body && Object.keys(templateObject.body).length > 0) {
    for (const x of Object.keys(templateObject.body)) {
      variables = [...variables, ...parseVariables(templateObject.body[x])]
    }
  }

  const _uniqueVariables = [...new Set(variables)]

  return {
    variables,
    unique: _uniqueVariables,
  }
}

function getRequestorString(method, url, body) {
  let midCode = ''
  midCode =
    body && Object.keys(body).length > 0
      ? `return requestor.${method}(\`${url}\`,${serialize(body)})`
      : `return requestor.${method}(\`${url}\`)`
  return midCode
}
