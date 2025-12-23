import { includes, __, ifElse, path, prop, reject, is, isNil, isEmpty } from 'ramda'
import sanitizeHTML from '../utils/sanitize-html.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'

export class DomElementTemplate {
  constructor(template, data = {}, opts = {}) {
    this.template = this.formatTemplate(template)
    this.isProxyData = data.__cms__isProxy === true
    this.testMode = opts?.testMode

    // SpyneJS Enterprise Code Start
    if (this.isProxyData === true) {
      this.template = DomElementTemplate.formatTemplateForProxyData(this.template)
    }
    // SpyneJS Enterprise Code End

    const checkForArrayData = () => {
      if (is(Array, data) === true) {
        data = { spyneData:data }
        this.template = this.template.replace('{{/}}', '{{/spyneData}}')
        this.template = this.template.replace('{{#}}', '{{#spyneData}}')
      }
    }

    checkForArrayData()

    this.templateData = data

    const strArr = DomElementTemplate.getStringArray(this.template)

    let strMatches = this.template.match(DomElementTemplate.findTmplLoopsRE())
    strMatches = strMatches === null ? [] : strMatches

    const parseTmplLoopsRE = DomElementTemplate.parseTmplLoopsRE()

    const parseTmplLoopFn =  this.parseTheTmplLoop.bind(this)

    const mapTmplLoop = (str, data) => {
      return str.replace(parseTmplLoopsRE, parseTmplLoopFn)
    }

    const findTmplLoopsPred = includes(__, strMatches)
    const checkForMatches = ifElse(
      findTmplLoopsPred,
      mapTmplLoop,
      this.addParams.bind(this))

    this.finalArr = strArr.map(checkForMatches)
  }

  static isPrimitiveTag(str) {
    return /({{\.\*?}})/.test(str)
  }


  // SpyneJS Enterprise Code Start
  static formatTemplateForProxyData(tmpl) {
    if (typeof tmpl !== 'string' || tmpl.indexOf('{{') === -1) {
      return tmpl
    }

    // -----------------------------
    // LOCAL HELPERS (ENCAPSULATED)
    // -----------------------------
    const isPrimitiveTag = str => /({{\.\*?}})/.test(str)

    // -----------------------------
    // 1. MASK ATTRIBUTE PLACEHOLDERS
    // -----------------------------
    const ATTR_TOKEN = '__CMS_ATTR_TOKEN__'
    const attrStore = []

    const maskAttributeBindings = str =>
      str.replace(
        /(<[^>]+?)(\s[\w-]+=["']?)({{[^}]+}})(["'][^>]*>)/g,
        (m, p1, p2, p3, p4) => {
          const key = `${ATTR_TOKEN}_${attrStore.length}`
          attrStore.push(p3)
          return `${p1}${p2}${key}${p4}`
        }
      )

    const unmaskAttributeBindings = str =>
      attrStore.reduce(
        (acc, val, i) => acc.replace(`${ATTR_TOKEN}_${i}`, val),
        str
      )

    const maskedTemplate = maskAttributeBindings(tmpl)

    // -----------------------------
    // 2. ORIGINAL REGEX LOGIC
    // -----------------------------
    const reLines2 = /(({{(?!loopNum|loopIndex))(.*?)(}}))/gm
    const reStr = '(?<=>)(.*?)(({{)(.*?)(}}))'
    const reLines1 = new RegExp(reStr, 'gm')

    const formatCmsParam = str => {
      const isArrPrimitive = isPrimitiveTag(str)

      const getKeyAndDataId = s => {
        const re = /({{)([\w_]+(\.))*?(\w+)(}})/gm
        const reNestedData = /^\{\{([^}]+?)\.[^.}]+}}$/gm

        let dataId = '__cms__dataId'
        const key = isArrPrimitive ? '{{loopIndex}}' : String(s).replace(re, '$4')

        if (/(\w\.)/.test(s)) {
          dataId = String(s).replace(reNestedData, '$1.') + dataId
        }

        return { key, dataId }
      }

      const { key, dataId } = getKeyAndDataId(str)

      let prefix = `<spyne-cms-item data-cms-id="{{${dataId}}}" data-cms-key="${key}"`

      if (isArrPrimitive) {
        prefix += ' data-cms-orig-key="{{origKey}}"'
      }

      const suffix = '</spyne-cms-item>'
      const param = isArrPrimitive ? '{{spyneLoopKey}}' : str

      return `${prefix}>
      <spyne-cms-item-hitbox></spyne-cms-item-hitbox>
      <spyne-cms-item-text>${param}</spyne-cms-item-text>
    ${suffix}`
    }

    const processed = String(maskedTemplate).replace(
      reLines1,
      (str, m1, m2) => `${m1}${String(m2).replace(reLines2, formatCmsParam)}`
    )

    // -----------------------------
    // 3. UNMASK ATTRIBUTE PLACEHOLDERS
    // -----------------------------
    return unmaskAttributeBindings(processed)
  }
  // SpyneJS Enterprise Code End

  // FIND CORRECT NESTED DATA
  static getNestedDataReducer(data = {}, param = '') {
    const dataReducer = (nestedData, str) => {
      if (nestedData[str]) {
        return nestedData[str]
      }
      return typeof nestedData === 'string' ? nestedData : ''
    }

    return /(\.)/gm.test(String(param)) ? String(param).split('.').reduce(dataReducer, data) : data[param] ?? ''
  }



  // --------------------------------------------------
  // SpyneJS Enterprise Code Start
  // TWO-PASS TOKENIZED CMS INSTRUMENTATION
  // --------------------------------------------------
  static formatTemplateForProxyDataOld(tmpl) {
    if (typeof tmpl !== 'string' || tmpl.indexOf('{{') === -1) {
      return tmpl
    }

    // -----------------------------
    // PASS 1: TOKENIZE
    // -----------------------------
    const tokens = []
    let buffer = ''
    let insideTag = false

    const flush = () => {
      if (buffer) {
        tokens.push({
          type: insideTag ? 'tag' : 'text',
          value: buffer
        })
        buffer = ''
      }
    }

    for (let i = 0; i < tmpl.length; i++) {
      const ch = tmpl[i]

      if (ch === '<') {
        flush()
        insideTag = true
        buffer += ch
        continue
      }

      if (ch === '>') {
        buffer += ch
        flush()
        insideTag = false
        continue
      }

      buffer += ch
    }

    flush()

    // -----------------------------
    // PASS 2: CMS INSTRUMENTATION
    // -----------------------------
    const isPrimitiveTag = str => /({{\.\*?}})/.test(str)

    const formatCmsParam = str => {
      const isArrPrimitive = isPrimitiveTag(str)

      const re = /({{)([\w_]+(\.))*?(\w+)(}})/gm
      const reNestedData = /^\{\{([^}]+?)\.[^.}]+}}$/gm

      let dataId = '__cms__dataId'
      const key = isArrPrimitive
        ? '{{loopIndex}}'
        : String(str).replace(re, '$4')

      if (/(\w\.)/.test(str)) {
        dataId = String(str).replace(reNestedData, '$1.') + dataId
      }

      let prefix = `<spyne-cms-item data-cms-id="{{${dataId}}}" data-cms-key="${key}"`

      if (isArrPrimitive) {
        prefix += ' data-cms-orig-key="{{origKey}}"'
      }

      const param = isArrPrimitive ? '{{spyneLoopKey}}' : str

      return `${prefix}>
        <spyne-cms-item-hitbox></spyne-cms-item-hitbox>
        <spyne-cms-item-text>${param}</spyne-cms-item-text>
      </spyne-cms-item>`
    }

    const escapeReplaceString = str =>
      str.replace(/\$/g, '$$$$')

    return tokens
      .map(token => {
        // TEXT NODES → wrap placeholders
        if (token.type === 'text') {
          return token.value.replace(
            /({{(?!loopNum|loopIndex).*?}})/gm,
            match => escapeReplaceString(formatCmsParam(match))
          )
        }

        // TAG NODES → annotate attribute placeholders
        return token.value
        /*         return token.value.replace(
                  /(\s)([\w-:]+)\s*=\s*(["']){{\s*([\w.$-]+)\s*}}\3/g,
                  (m, ws, attr, quote, key) =>
                    `${ws}${attr}=${quote}{{${key}}}${quote} data-cms-attr-${attr}="${key}"`
                ) */
      })
      .join('')
  }
  // SpyneJS Enterprise Code End

  // --------------------------------------------------
  // TEMPLATE + DATA RESOLUTION (UNCHANGED)
  // --------------------------------------------------
  static getNestedDataReducer(data = {}, param = '') {
    const dataReducer = (nestedData, str) => {
      if (nestedData[str]) {
        return nestedData[str]
      }
      return typeof nestedData === 'string' ? nestedData : ''
    }

    return /(\.)/gm.test(String(param)) ? String(param).split('.').reduce(dataReducer, data) : data[param] ?? ''
  }

  static getStringArray(template) {
    const strArr = template.split(DomElementTemplate.findTmplLoopsRE())
    const emptyRE = /^([\\n\s\W]+)$/
    const filterOutEmptyStrings = s => s.match(emptyRE)
    const finalStr =  reject(filterOutEmptyStrings, strArr)

    return finalStr
  }

  static findTmplLoopsRE() {
    return /({{#[\w.]+}}[\w\n\s\W]+?{{\/[\w.]+}})/gm
  }

  static parseTmplLoopsRE() {
    return /({{#([\w.]+)}})([\w\n\s\W]+?)({{\/\2}})/gm
  }

  static swapParamsForTagsRE() {
    return /({{)(.*?)(}})/gm
  }

  removeThis() {
    if (this !== undefined) {
      this.finalArr = undefined
      this.templateData = undefined
      this.template = undefined
    }
  }

  /**
   *
   * @desc Returns a document fragment generated from the template and any added data.
   */

  renderDocFrag() {
    let html = DomElementTemplate.replaceImgPath(this.finalArr.join(''))
    if (this.testMode !== true) {
      html = sanitizeHTML(html)
    }
    const isTableSubTag =   /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/.test(html)
    const el = isTableSubTag ? html : document.createRange().createContextualFragment(html)

    window.setTimeout(this.removeThis, 2)
    return el
  }

  renderToString() {
    let html = this.finalArr.join('')
    html = DomElementTemplate.replaceImgPath(html)
    window.setTimeout(this.removeThis, 2)
    return html
  }

  getTemplateString() {
    return this.finalArr.join('')
  }

  formatTemplate(template) {
    return ['SCRIPT', 'TEMPLATE'].includes(prop('nodeName', template)) === true ? template.innerHTML : template
  }

  getDataValFromPathStr(pathStr, dataFile) {
    const pathArr = String(pathStr).split('.')
    const pathData = path(pathArr, dataFile)
    return pathData || ''
  }

  addParams(str) {
    const replaceTags = (str, p1, p2, p3) => {
      return DomElementTemplate.getNestedDataReducer(this.templateData, p2)
    }
    return str.replace(DomElementTemplate.swapParamsForTagsRE(), replaceTags)
  }

  static replaceImgPath(templateStr) {
    const { IMG_PATH } = SpyneAppProperties
    if (IMG_PATH !== undefined) {
      templateStr = templateStr.replaceAll(/src\s*=\s*(['"])imgs\//g, `src=$1${IMG_PATH}`)
      return templateStr.replaceAll(/url\(\s*(['"]?)imgs\//g, `url($1${IMG_PATH}`)
    }
    return templateStr
  }

  parseTheTmplLoop(str, p1, p2, p3) {
    const reDot = /(\.)/gm
    const subStr = p3
    let elData = DomElementTemplate.getNestedDataReducer(this.templateData, p2)

    const arrayStringToObjAdapter = (d, str, i) => {
      if (DomElementTemplate.isPrimitiveTag(str)) {
        return parseString(d, str, i)
      }

      const createDataObj = () => {
        const spyneLoopKey = d
        const loopIndex = i
        const loopNum = i + 1

        if (this.isProxyData) {
          const __cms__dataId = elData.__cms__dataId
          const keyIdStr = `__cms__keyFor_${d}`
          const origKey = elData[keyIdStr]
          return { spyneLoopKey, __cms__dataId, origKey, loopIndex, loopNum, d }
        }
        return { spyneLoopKey, loopIndex, loopNum }
      }

      return parseObject(createDataObj(), str, i)
    }

    const parseString = (item, str, index, origIndex) => {
      item = item.replace(/\$/g, '$$$$') // $ → $$
      return str.replace(DomElementTemplate.swapParamsForTagsRE(), item)
    }

    // PARSING ARRAYS AND OBJECTS
    const parseObject = (obj, str, i) => {
      /// LOOP NUMBER VALUES AUTO ADDED

      // const loopIndex = i;
      // const loopNum = i+1;

      const loopObj = (str, p1, p2) => {
        // DOT SYNTAX CHECK
        const hash = {
          loopIndex: i,
          loopNum: i + 1
        }

        // IF {{.}}
        if (reDot.test(p2) === false && obj[p2] !== undefined) {
          return hash[p2] !== undefined ? hash[p2] : obj[p2]
        }

        const dataReducedVal  = this.getDataValFromPathStr(p2, obj)
        return hash[p2] !== undefined ? hash[p2] : dataReducedVal
      }
      return str.replace(DomElementTemplate.swapParamsForTagsRE(), loopObj)
    }

    const mapStringData = (d, i) => typeof (d) === 'string' ? arrayStringToObjAdapter(d, subStr, i) : parseObject(d, subStr, i)

    if (isNil(elData) === true || isEmpty(elData)) {
      return ''
    }

    if (elData.length === undefined) {
      elData = [elData]
    }

    // convert to array if is string
    elData = Array.isArray(elData) ? elData : [elData]

    return elData.map(mapStringData).join('')
  }
}
