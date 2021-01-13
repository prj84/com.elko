
'use strict';

const { BoundCluster } = require('zigbee-clusters');

class LevelControlBoundCluster extends BoundCluster {

  constructor({
    onStep


  }) {
    super();
    this._onStep = onStep;
  }

  step(payload) {
    console.log('LevelControlBoundCluster', payload);
    if (typeof this._onStep === 'function') {
      this._onStep(payload);
    }
  }



}

module.exports = LevelControlBoundCluster;
