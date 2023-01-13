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
 * @param {Record<string,import("./index").TemplateItem>} template
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
    const headers = replaceTemplateVariables(templateObject.headers, variables)

    const midCode = getRequestorString(
      templateObject.method,
      url,
      body,
      headers
    )

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

  if (
    templateObject.headers &&
    Object.keys(templateObject.headers).length > 0
  ) {
    for (const x of Object.keys(templateObject.headers)) {
      variables = [...variables, ...parseVariables(templateObject.headers[x])]
    }
  }

  const _uniqueVariables = [...new Set(variables)]

  return {
    variables,
    unique: _uniqueVariables,
  }
}

function getRequestorString(method, url, body, header) {
  let midCode = ''
  midCode =
    body && Object.keys(body).length > 0
      ? `return requestor.${method}(\`${url}\`,${serialize(
          body
        )},{headers:${serialize(header)}})`
      : `return requestor.${method}(\`${url}\`,{headers:${serialize(header)}})`
  return midCode
}
