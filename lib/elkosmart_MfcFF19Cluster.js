'use strict';

const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

const UNKNOWN_0X0001 = {
  unknownBit1: 0b00000001,
};

const ATTRIBUTES = {

  /* Lux Threshold
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0000
   * Data type:   16-Bit Unsigned Integer (0x21)
   * Access:      Readable, Writeable, Reportable
   * Range:       0x0001 (1 Lux) -  0x7531 (1000 Lux)
   * Calculation:
   *  Lux > uint16: Math.round(10000 * Math.log10(value)) + 1
   *  uint16 > Lux: Math.round(10 ** ((value - 1) / 10000))
   */
  luxThreshold: {
    id: 0x0000,
    type: ZCLDataTypes.uint16,
    manufacturerId: 0x105e,
  },

  /* Unknown0x0001
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0001
   * Data type:   8-Bit Enumeration (0x30)
   * Access:      Readable, Writeable, Reportable
   */
  unknown0x0001: {
    id: 0x0001,
    type: ZCLDataTypes.enum8(UNKNOWN_0X0001),
    manufacturerId: 0x105e,
  },

  /* Unknown0x0002
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0002
   * Data type:   8-Bit Unsigned Integer (0x20)
   * Access:      Readable, Writeable, Reportable
   */
  unknown0x0002: {
    id: 0x0002,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x105e,
  },

  /* Unknown0x0003
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0x0003
   * Data type:   8-Bit Unsigned Integer (0x20)
   * Access:      Readable, Writeable, Reportable
   */
  unknown0x0003: {
    id: 0x0003,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x105e,
  },

  /* Unknown0xffdd
   * ---------------------------------------------------------
   * Mfc Code:    0x105e
   * Identifier:  0xffdd
   * Data type:   16-Bit Unsigned Integer (0x21)
   * Access:      Readable, Reportable
   */
  unknown0xffdd: {
    id: 0xffdd,
    type: ZCLDataTypes.uint16,
    manufacturerId: 0x105e,
  },
};

const COMMANDS = {};

class ELKOSMARTMfcFF19Cluster extends Cluster {

  static get ID() {
    return 0xff19; // 65305
  }

  static get NAME() {
    return 'elkosmart_MfcFF19';
  }

  static get ATTRIBUTES() {
    return { ...super.ATTRIBUTES, ...ATTRIBUTES };
  }

  static get COMMANDS() {
    return COMMANDS;
  }

  static get UNKNOWN_0X0001() {
    return UNKNOWN_0X0001;
  }

}

Cluster.addCluster(ELKOSMARTMfcFF19Cluster);

module.exports = ELKOSMARTMfcFF19Cluster;
