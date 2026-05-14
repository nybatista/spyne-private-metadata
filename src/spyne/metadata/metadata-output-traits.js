import { SpyneTrait } from '../utils/spyne-trait.js'

export class MetadataOutputTraits extends SpyneTrait {
  constructor(context) {
    const traitPrefix = 'metadataOutput$'
    super(context, traitPrefix)
  }

  static metadataOutput$OnRoute() {

  }

  static metadataOutput$OnEmit(e) {
    const { payload } = e

    this.props.el$.el.innerHTML = JSON.stringify(payload)

    // console.log('payload is ', { payload })

    console.log(

        `%c${JSON.stringify(payload, null, 2)}`,

        'color: #d8a289; font-size: 13px; line-height: 1.2; font-family: Menlo, Consolas, monospace;'

    )
  }
}
