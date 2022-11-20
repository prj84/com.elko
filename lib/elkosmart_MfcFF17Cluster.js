'use strict';

const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

const BACKLIGHT_MODE = {
  consistentWithLoad: 0x00,
  alwaysOn: 0x01,
  reverseWithLoad: 0x02,
  alwaysOff: 0x03,
};

const ATTRIBUTES = {
  backlightMode: {
    id: 0,
    type: ZCLDataTypes.enum8(BACKLIGHT_MODE),
    manufacturerId: 0x105e,
  },
};

const COMMANDS = {};

class ELKOSMARTMfcFF17Cluster extends Cluster {

  static get ID() {
    return 0xff17;
  }

  static get NAME() {
    return 'elkosmart_MfcFF17';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

  static get BACKLIGHT_MODE() {
    return BACKLIGHT_MODE;
  }

}

Cluster.addCluster(ELKOSMARTMfcFF17Cluster);

module.exports = ELKOSMARTMfcFF17Cluster;
