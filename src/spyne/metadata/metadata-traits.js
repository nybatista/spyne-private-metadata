import { SpyneTrait } from '../utils/spyne-trait.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'

export class MetadataTraits extends SpyneTrait {
  constructor(context) {
    const traitPrefix = 'metadata$'
    super(context, traitPrefix)
  }

  static metadata$OnRoute() {
    const codeMapObj = {
      $codemapVersion: '0.1.1',
      $emittedBy: 'SpyneChannelMetadata',
      $emittedAt: '2026-05-13T14:30:00.000Z',
      $source: 'runtime',
      _stub: false,
      componentInstances: [
      ]

    }

    codeMapObj.$emittedAt = new Date()
    codeMapObj.channels = this.props._metadata.channels
    codeMapObj.componentInstances = this.props._metadata.componentInstances

    this.sendChannelPayload('CHANNEL_METADATA_INIT_EVENT', codeMapObj)
  }

  static metadata$AddChannelData() {
    const omitChannels = [
      'DISPATCHER',
      'CHANNEL_LIFECYCLE',
      'CHANNEL_AI',
      'CHANNEL_METADATA'
    ]

    const omigConfigProps = ['ephemeralProps', ' tmpProps']

    const allChannels = SpyneAppProperties.listRegisteredChannels()

    const channelList = allChannels.filter(s => !omitChannels.includes(s))

    const channelsMapFN = (channelName) => {
      const actions = SpyneAppProperties.getChannelActions(channelName)
      return { channelName, actions }
    }
    const config = SpyneAppProperties.config

    omigConfigProps.forEach(s => delete config[s])

    const channels = channelList.map(channelsMapFN)

    this.props._metadata.channels = channels

    // console.log("CHANNEL LIST ", {config, channels, channelList, allChannels, omitChannels})
  }

  static metadata$AddViewstreamMetadata(e) {
    const { payload } = e.clone()
    const metadata = this.props._metadata
    const componentInstances = Array.isArray(metadata.componentInstances)
      ? metadata.componentInstances
      : []
    metadata.componentInstances = [
      ...componentInstances,
      payload
    ]
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
