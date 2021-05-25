
'use strict';

const { BoundCluster } = require('zigbee-clusters');

class OnOffBoundCluster extends BoundCluster {

constructor({
  onToggle, onsetOn, onsetOff, endpoint
}) {
  super();
  this._onToggle = onToggle;
  this._onsetOn = onsetOn;
  this._onsetOff = onsetOff;
  this._endpoint = endpoint;

}

toggle(payload) {
  console.log('OnOffBoundCluster - toggle', payload);
  if (typeof this._onToggle === 'function') {
    this._onToggle(payload);
  }
}

setOn(payload) {
  console.log('OnOffBoundCluster - onsetOn', payload);
  if (typeof this._onsetOn === 'function') {
    this._onsetOn(payload);
  }
}

setOff(payload) {
  console.log('OnOffBoundCluster - onsetOff', payload);
  if (typeof this._onsetOn === 'function') {
    this._onsetOff(payload);
  }
}

}

module.exports = OnOffBoundCluster;
