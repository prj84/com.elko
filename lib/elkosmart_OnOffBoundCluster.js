'use strict';

const { BoundCluster } = require('zigbee-clusters');

class ELKOSMARTOnOffBoundCluster extends BoundCluster {

  constructor({
    endpoint, onSetOn, onSetOff, onToggle,
  }) {
    super();
    this._endpoint = endpoint;
    this._onSetOn = onSetOn;
    this._onSetOff = onSetOff;
    this._onToggle = onToggle;
  }

  setOn(payload) {
    this._onSetOn(payload);
  }

  setOff(payload) {
    this._onSetOff(payload);
  }

  toggle(payload) {
    this._onToggle(payload);
  }

}

module.exports = ELKOSMARTOnOffBoundCluster;
