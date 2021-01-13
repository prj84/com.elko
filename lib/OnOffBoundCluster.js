
'use strict';

const { BoundCluster } = require('zigbee-clusters');

class OnOffBoundCluster extends BoundCluster {

constructor({
  onToggle,
}) {
  super();
  this._onToggle = onToggle;
}

toggle(payload) {
  if (typeof this._onToggle === 'function') {
    this._onToggle(payload);
  }
}

}

module.exports = OnOffBoundCluster;
