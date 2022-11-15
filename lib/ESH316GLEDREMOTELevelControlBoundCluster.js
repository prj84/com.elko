
'use strict';

const { BoundCluster } = require('zigbee-clusters');

class LevelControlBoundCluster extends BoundCluster {

  constructor({
    onStep, onMove, onStop, onMoveWithOnOff, endpoint
}) {
    super();
    this._onStep = onStep;
    this._onMove = onMove;
    this._onStop = onStop;
    this._onMoveWithOnOff = onMoveWithOnOff;
    this._endpoint = endpoint;
  }

  step(payload) {
    console.log('LevelControlBoundCluster - onstep', payload);
    if (typeof this._onStep === 'function') {
      this._onStep(payload);
    }
  }

  move(payload) {
    console.log('LevelControlBoundCluster - onMove', payload);
    if (typeof this._onMove === 'function') {
      this._onMove(payload);
    }
  }

  stop(payload) {
    console.log('LevelControlBoundCluster - onStop', payload);
    if (typeof this._onStop === 'function') {
      this._onStop(payload);
    }
  }

  moveWithOnOff(payload) {
    console.log('LevelControlBoundCluster - onMoveWithOnOff', payload);
    if (typeof this._onMoveWithOnOff === 'function') {
      this._onMoveWithOnOff(payload);
    }
  }

}

module.exports = LevelControlBoundCluster;
