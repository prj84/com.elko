'use strict';

const { Cluster, ZCLDataTypes, ZCLDataType } = require('zigbee-clusters');

const ATTRIBUTES = {
  SwitchActions: { id: 1, manufacturerId: 0x105e, type: ZCLDataTypes.enum8({
      Light: 0,
      Dimmer: 1,
      Light_opposite: 254,
      Dimmer_opposite: 253,
      Standard_shutter: 2,
      Standard_shutter_opposite: 252,
      Schneider_shutter: 3,
      Schneider_shutter_opposite: 251,
      Scene: 4,
      Toggle_light: 5,
      Toggle_dimmer: 6,
      Alternate_light: 7,
      Alternate_dimmer: 8,
      Not_user: 127
    }),
  },
};

const COMMANDS = {
};

class ELKOSMARTSwitchConfigurationCluster extends Cluster {

  static get ID() {
    return 65303; // The cluster id
  }

  static get NAME() {
    return 'SwitchConfiguration'; // The cluster name
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES; // Returns the defined attributes
  }

  static get COMMANDS() {
    return COMMANDS; // Returns the defined commands
  }

}

Cluster.addCluster(ELKOSMARTSwitchConfigurationCluster);

module.exports = ELKOSMARTSwitchConfigurationCluster;
