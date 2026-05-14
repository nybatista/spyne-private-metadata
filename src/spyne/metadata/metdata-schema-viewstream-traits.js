import { SpyneTrait } from '../utils/spyne-trait.js'
import {
  defaultTo,
  isNil,
  isEmpty,
  pick,
  uniq,
  compose,
  map,
  reject
} from 'ramda'
import { MetadataUtilsTraits } from './metadata-utils-traits.js'

export class MetdataSchemaViewstreamTraits extends SpyneTrait {
  constructor(context) {
    const traitPrefix = 'metdataSchemaViewStream$'
    super(context, traitPrefix)
  }

  static metdataSchema$HelloWorld() {
    return 'Hello World'
  }

  static metdataSchemaViewStream$ViewSInitObj() {
    const store = {
      props: {},
      parent: {},
      children: [],
      broadcastEvents: [],
      actionListeners: [],
      lifecycle: []
    }

    return {
      get props() {
        return store.props
      },

      set props(val) {
        store.props =
            MetdataSchemaViewstreamTraits.metdataSchemaViewStream$NormalizeProps(val)
      },

      get parent() {
        return store.parent
      },

      set parent(val) {
        store.parent = {

          ...store.parent,

          ...(val || {})

        }
      },

      get children() {
        return store.children
      },

      set children(val) {
        store.children = defaultTo([], val)
      },

      get broadcastEvents() {
        return store.broadcastEvents
      },

      set broadcastEvents(val) {
        store.broadcastEvents =

            MetdataSchemaViewstreamTraits.metdataSchemaViewStream$NormalizeBroadcastEvents(

              val

            )
      },

      get actionListeners() {
        return store.actionListeners
      },

      set actionListeners(val) {
        store.actionListeners =
            MetdataSchemaViewstreamTraits.metdataSchemaViewStream$NormalizeActionListeners(
              val
            )
      },

      get lifecycle() {
        return store.lifecycle
      },
      addLifecycle(type, appendType, method, callee) {
        const isValid = [type, appendType, method, callee].every(
          (val) => typeof val === 'string'
        )
        if (isValid) {
          store.lifecycle.push({
            type,
            appendType,
            method,
            callee
          })
        }
        return store.lifecycle
      },

      toJSON() {
        return store
      }
    }
  }

  static metdataSchemaViewStream$NormalizeActionListeners(listeners = []) {
    if (!Array.isArray(listeners)) {
      throw new TypeError('addActionListeners metadata must be an array.')
    }

    return listeners.map((listener, index) =>
      MetdataSchemaViewstreamTraits.metdataSchemaViewStream$NormalizeActionListener(
        listener,
        index
      )
    )
  }

  static metdataSchemaViewStream$NormalizeActionListener(listener, index) {
    if (!Array.isArray(listener)) {
      throw new TypeError(`addActionListeners[${index}] must be an array.`)
    }

    if (listener.length < 2 || listener.length > 3) {
      throw new TypeError(
          `addActionListeners[${index}] must contain [channelAction, methodName] or [channelAction, methodName, ChannelPayloadFilter].`
      )
    }

    const [channelAction, methodName, payloadFilter] = listener

    if (typeof channelAction !== 'string') {
      throw new TypeError(`addActionListeners[${index}][0] must be a string.`)
    }

    if (typeof methodName !== 'string') {
      throw new TypeError(`addActionListeners[${index}][1] must be a string.`)
    }

    const payloadFilterMetadata =
        MetdataSchemaViewstreamTraits.metdataSchemaViewStream$GetPayloadFilterMetadata(
          payloadFilter
        )

    return reject(isNil, {
      channelAction,
      methodName,
      payloadFilter: isEmpty(payloadFilterMetadata)
        ? undefined
        : payloadFilterMetadata
    })
  }

  static metdataSchemaViewStream$NormalizeBroadcastEvents(broadcastEvents = []) {
    const normalizeSrcElement = (srcElement = {}) => {
      const selector = MetadataUtilsTraits.metadataUtils$GetElSelector(srcElement.el)
      return reject(isNil, {
        ...srcElement,
        el: undefined,
        selector
      })
    }

    const normalizeBroadcastEvent = (broadcastEvent = {}) =>
      reject(isNil, {
        ...broadcastEvent,
        srcElement: broadcastEvent.srcElement
          ? normalizeSrcElement(broadcastEvent.srcElement)
          : undefined
      })

    return Array.isArray(broadcastEvents)
      ? map(normalizeBroadcastEvent, broadcastEvents)
      : []
  }

  static metdataSchemaViewStream$GetPayloadFilterMetadata(payloadFilter) {
    return compose(
      reject(isNil),
      pick(['selector', 'filters']),
      defaultTo({})
    )(payloadFilter)
  }

  static metdataSchemaViewStream$GetAllowedPropsList() {
    const spyneProps = [
      'name',
      'vsid',
      'id',
      'tagName',
      'data',
      'template',
      'traits',
      'channels'
    ]

    const htmlAttrs = [
      'accesskey', 'class', 'contenteditable', 'dir', 'draggable', 'hidden',
      'id', 'lang', 'spellcheck', 'style', 'tabindex', 'title', 'translate',
      'aria-autocomplete', 'aria-checked', 'aria-disabled', 'aria-expanded',
      'aria-haspopup', 'aria-hidden', 'aria-invalid', 'aria-label',
      'aria-level', 'aria-multiline', 'aria-multiselectable',
      'aria-orientation', 'aria-pressed', 'aria-readonly', 'aria-required',
      'aria-selected', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
      'aria-valuenow', 'aria-valuetext', 'aria-atomic', 'aria-busy',
      'aria-live', 'aria-relevant', 'aria-dropeffect', 'aria-grabbed',
      'aria-activedescendant', 'aria-controls', 'aria-describedby',
      'aria-flowto', 'aria-labelledby', 'aria-owns', 'aria-posinset',
      'aria-setsize', 'accept', 'autocomplete', 'autofocus', 'checked',
      'dirname', 'disabled', 'form', 'formaction', 'formenctype',
      'formmethod', 'formnovalidate', 'formtarget', 'list', 'max',
      'maxlength', 'min', 'minlength', 'multiple', 'name', 'pattern',
      'placeholder', 'readonly', 'required', 'size', 'step', 'value',
      'alt', 'srcset', 'sizes', 'usemap', 'ismap', 'href', 'target',
      'download', 'ping', 'rel', 'hreflang', 'as', 'media',
      'accept-charset', 'enctype', 'novalidate', 'content',
      'charset', 'http-equiv', 'async', 'defer', 'integrity', 'nomodule',
      'nonce', 'referrerpolicy', 'autocapitalize', 'autoplay', 'buffered',
      'challenge', 'cite', 'code', 'codebase', 'color', 'cols', 'colspan',
      'contextmenu', 'controls', 'coords', 'crossorigin', 'csp', 'dataset',
      'datetime', 'decoding', 'default', 'for', 'headers', 'high', 'icon',
      'importance', 'itemprop', 'keytype', 'kind', 'label', 'language',
      'lazyload', 'loop', 'low', 'manifest', 'method', 'muted', 'open',
      'optimum', 'poster', 'preload', 'radiogroup', 'reversed', 'role',
      'rows', 'rowspan', 'sandbox', 'scope', 'scoped', 'selected', 'shape',
      'slot', 'span', 'srcdoc', 'src', 'type', 'srclang', 'start',
      'summary', 'wrap', 'width', 'height'
    ]

    return uniq([...spyneProps, ...htmlAttrs])
  }

  static metdataSchemaViewStream$NormalizeProps(props = {}) {
    const normalizeTraits = compose(
      reject(isNil),
      map((trait) => trait?.name),
      defaultTo([])
    )

    const pickedProps = compose(
      reject(isNil),
      pick(MetdataSchemaViewstreamTraits.metdataSchemaViewStream$GetAllowedPropsList()),
      defaultTo({})
    )(props)

    if (pickedProps.traits === undefined) {
      return pickedProps
    }

    return {
      ...pickedProps,
      traits: normalizeTraits(pickedProps.traits)
    }
  }
}
