export function createTemplateString() {
  let base = '#{{template}}'
  return {
    get() {
      return base
    },
    update(code) {
      base = base.replace(/#{{template}}/, code + '\n#{{template}}')
    },
    complete() {
      base = base.replace(/#{{template}}/, '')
    },
  }
}

export function serialize(object) {
  let string_ = '{'
  for (const k of Object.keys(object)) {
    string_ += `${k}:\`${object[k]}\``
  }

  string_ += '}'
  return string_
}

export function parseVariables(toParse) {
  const rgx = /#{{(\w+)}}/g
  if (rgx.test(toParse)) {
    return String(toParse)
      .match(rgx)
      .map(x => (x ? stripTemplate(x) : null))
      .filter(Boolean)
  }

  return null
}

function stripTemplate(varString) {
  return varString.replace(/^#{{/, '').replace(/}}$/, '')
}

export function interopWithTemplateVariable(string_, toReplace) {
  const variableRegex = variableName => new RegExp(`#{{(${variableName})}}`)

  const interopRgx = variableRegex(toReplace)
  if (!variableRegex(toReplace).test(string_)) {
    return [false, string_]
  }

  return [true, string_.replace(interopRgx, `$\{${toReplace}}`)]
}

export function replaceTemplateVariables(toReplaceIn, variables) {
  switch (typeof toReplaceIn) {
    case 'string':
      return replaceInString(toReplaceIn, variables)
    case 'object':
      return replaceInObject(toReplaceIn, variables)
    default:
      return toReplaceIn
  }
}

function replaceInString(toReplaceIn, variables) {
  let og = toReplaceIn
  for (const varb of variables) {
    const replacements = interopWithTemplateVariable(og, varb)
    og = replacements[1]
  }

  return og
}

export function replaceInObject(toReplaceIn, variables) {
  if (!(toReplaceIn && Object.keys(toReplaceIn).length > 0)) {
    return toReplaceIn
  }

  const parsedBody = {}

  for (const varb of variables) {
    for (const x of Object.keys(toReplaceIn)) {
      const replacements = interopWithTemplateVariable(toReplaceIn[x], varb)
      parsedBody[x] = replacements[1]
    }
  }

  return parsedBody
}
