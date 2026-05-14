import { SpyneTrait } from '../utils/spyne-trait.js'

export class MetadataTraits extends SpyneTrait {
  constructor(context) {
    const traitPrefix = 'metadata$'
    super(context, traitPrefix)
  }

  static metadata$OnRoute() {

  }

  static metadata$AddViewstreamMetadata(e) {
    const { payload }  = e
    this.props._metadata.componentInstances.push(payload)
  }

  static metadata$OnEmit(e) {
    const { payload } = e
    console.log('payload', payload)

    this.props.el$.el.innerHTML = JSON.stringify(payload)

    console.log('payload is ', { payload })

    console.log(

        `%c${JSON.stringify(payload, null, 2)}`,

        'color: #d8a289; font-size: 13px; line-height: 1.2; font-family: Menlo, Consolas, monospace;'

    )
  }
}
