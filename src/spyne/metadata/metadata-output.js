import { ViewStream } from '../views/view-stream.js'
import { MetadataOutputTraits } from './metadata-output-traits.js'

export class MetadataOutput extends ViewStream {
  constructor(props = {}) {
    props.id = 'codemap-runtime'
    props.tagName = 'script'
    props.type = 'application/json'
    props.channels = ['CHANNEL_METADATA']
    props.traits = [MetadataOutputTraits]

    // props.template = `<script id="codemap-runtime">Metadata Subscriber</script>`;

    super(props)
  }

  addActionListeners() {
    // return nexted array(s)
    return [
      ['CHANNEL_METADATA_INIT_EVENT', 'metadataOutput$OnEmit']
    ]
  }

  broadcastEvents() {
    // return nexted array(s)
    return []
  }

  onRendered() {

  }
}
