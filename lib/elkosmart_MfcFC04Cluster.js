'use strict';

// ALL ATTRIBUTES ARE FAKE! Or are they??

const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

const BACKLIGHT_MODE = {
  consistentWithLoad: 0x01,
  alwaysOn: 0x03,
  reverseWithLoad: 0x00,
  alwaysOff: 0x02,
};

const ATTRIBUTES = {

  /* Unknown0x0000
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0000
   * Data type:   8-Bit Unsigned Integer (0x20)
   * Access:      Readable, Writeable, Reportable  ???????????
   */
  unknown0x0000: {
    id: 0x0000,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x105e,
  },

  /* Unknown0x0002
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0002
   * Data type:   8-Bit Unsigned Integer (0x20)
   * Access:      Readable, Writeable, Reportable
   */
  backlightMode: {
    id: 0x0002,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x105e,
  },

  /* Unknown0xfffd
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0xfffd
   * Data type:   16-Bit Unsigned Integer (0x21)
   * Access:      Readable, Reportable          ??????????
   */
  unknown0xfffd: {
    id: 0xfffd,
    type: ZCLDataTypes.uint16,
    manufacturerId: 0x105e,
  },
};

const COMMANDS = {};

class ELKOSMARTMfcFC04Cluster extends Cluster {

  static get ID() {
    return 0xfc04; // 64516
  }

  static get NAME() {
    return 'elkosmart_MfcFC04';
  }

  static get ATTRIBUTES() {
    return { ...super.ATTRIBUTES, ...ATTRIBUTES };
  }

  static get COMMANDS() {
    return COMMANDS;
  }

  static get BACKLIGHT_MODE() {
    return BACKLIGHT_MODE;
  }

}

Cluster.addCluster(ELKOSMARTMfcFC04Cluster);

module.exports = ELKOSMARTMfcFC04Cluster;
