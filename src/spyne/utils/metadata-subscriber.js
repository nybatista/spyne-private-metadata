import { ViewStream } from '../views/view-stream.js'

export class MetadataSubscriber extends ViewStream {
  constructor(props = {}) {
    props.id = 'codemap-runtime'
    props.tagName = 'script'
    props.type = 'application/json'
    props.channels = ['CHANNEL_METADATA']

    // props.template = `<script id="codemap-runtime">Metadata Subscriber</script>`;

    super(props)
  }

  addActionListeners() {
    // return nexted array(s)
    return [
      ['CHANNEL_METADATA_INIT_EVENT', 'onInitMetadata']
    ]
  }

  onInitMetadata(e) {
    const { payload } = e
    console.log('payload', payload)

    this.props.el$.el.innerHTML = JSON.stringify(payload)
  }

  broadcastEvents() {
    // return nexted array(s)
    return []
  }

  onRendered() {

  }
}
