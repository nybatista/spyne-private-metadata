import { SpyneTrait } from '../utils/spyne-trait.js'

export class MetadataUtilsTraits extends SpyneTrait {
  constructor(context) {
    const traitPrefix = 'metadataUtils$'
    super(context, traitPrefix)
  }

  static metadataUtils$HelloWorld() {
    return 'Hello World'
  }

  static metadataUtils$GetElSelector(el) {
    if (!el || el.nodeType !== 1) return undefined
    const tag = el.tagName?.toLowerCase()
    const id = el.id ? `#${el.id}` : ''
    const classes = el.classList?.length
      ? `.${Array.from(el.classList).join('.')}`
      : ''
    return `${tag}${id}${classes}`
  }

  static metadataUtils$getFrameworkCallerName(methodName = 'test') {
    const stack = new Error().stack || ''
    const lines = stack.split('\n').map(line => line.trim())
    const methodIndex = lines.findIndex(line =>
      line.includes(`.${methodName}`) || line.includes(` ${methodName}`)
    )
    if (methodIndex === -1) {
      return 'unknown'
    }
    const callerLine = lines[methodIndex + 1] || ''
    const chromeMatch = callerLine.match(/^at\s+([^\s(]+)/)
    if (chromeMatch) {
      return chromeMatch[1]
    }
    const firefoxMatch = callerLine.match(/^([^@]+)@/)
    if (firefoxMatch) {
      return firefoxMatch[1]
    }
    return 'unknown'
  }
}
