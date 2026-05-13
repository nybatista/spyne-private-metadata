import { Channel } from './channel.js'

export class SpyneChannelMetadata extends Channel {
  /**
   * @module SpyneChannelMetadata
   * @type core
   *
   * @desc
   * Internal Channel that publishes rendering and disposing events of all ViewStreams whose property, proper.sendMetadataEvents is set to true.
   *
   * <h3>The two actions that are regsitered for this channel are:</h3>
   * <ul>
   * <li>CHANNEL_METADATA_RENDERED_EVENT</li>
   * <li>CHANNEL_METADATA_DISPOSED_EVENT</li>
   *  </ul>
   * @constructor
   * @property {String} CHANNEL_NAME - = 'CHANNEL_METADATA';
   */

  constructor(props = {}) {
    props.replay = true
    super('CHANNEL_METADATA', props)
  }

  onRegistered() {
    console.log('metadata channel registered')

    const initData = {
      $codemapVersion: '0.1.0',
      $emittedBy: 'SpyneChannelMetadata',
      $emittedAt: '2026-05-13T14:30:00.000Z',
      $source: 'runtime',
      _stub: true,
      componentInstances: [],
      syncMoments: [],
      channelSubscribers: []
    }

    const delayer = () => this.sendChannelPayload('CHANNEL_METADATA_INIT_EVENT', initData)

    requestAnimationFrame(delayer)
  }

  addRegisteredActions() {
    return [
      'CHANNEL_METADATA_INIT_EVENT',
      'CHANNEL_METADATA_RENDERED_EVENT',
      'CHANNEL_METADATA_DISPOSED_EVENT'
    ]
  }

  onViewStreamInfo(obj) {
    const { action, srcElement } = obj
    const payload = srcElement
    payload.action = action
    this.onSendEvent(action, payload)
  }

  onSendEvent(actionStr, payload = {}) {
    const action = this.channelActions[actionStr]
    const srcElement = {}
    const event = undefined
    const delayStream = () => this.sendChannelPayload(action, payload, srcElement, event)
    window.setTimeout(delayStream, 0)
  }
}
