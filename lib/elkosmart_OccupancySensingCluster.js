'use strict';

const { Cluster, OccupancySensingCluster, ZCLDataTypes } = require('zigbee-clusters');

const PIR_SENSITIVITIES = {
  low: 50,
  medium: 75,
  high: 100,
};

const ATTRIBUTES = {
  /* PIR Sensitivity (manufacturer specific, read/write)
   * ---------------------------------------------------
   * Default:       0x64 (100)
   * Range:         0x01 (1) - 0x64 (100)
   * Notes:         Failure when trying to write above 0x64
   *
   * Wiser default levels:
   * 0x32 (50)  | Low
   * 0x4b (75)  | Medium
   * 0x64 (100) | High
   */
  pirSensitivity: {
    id: 0xe003,
    manufacturerId: 0x105e,
    type: ZCLDataTypes.uint8,
  },
};

class ELKOSMARTOccupancySensingCluster extends OccupancySensingCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      ...ATTRIBUTES,
    };
  }

  static get PIR_SENSITIVITIES() {
    return PIR_SENSITIVITIES;
  }

}

Cluster.addCluster(ELKOSMARTOccupancySensingCluster);

module.exports = ELKOSMARTOccupancySensingCluster;
