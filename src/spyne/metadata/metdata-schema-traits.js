import { SpyneTrait } from '../utils/spyne-trait.js';

export class MetdataSchemaTraits extends SpyneTrait {
  constructor(context) {
    let traitPrefix = 'metdataSchema$';
    super(context, traitPrefix);
  }

  static metdataSchema$HelloWorld() {
    return 'Hello World';
  }


}
