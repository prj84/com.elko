'use strict';


const { Cluster, BallastConfigurationCluster, ZCLDataTypes } = require('zigbee-clusters');

const controlMode = {
  automatic: 0x00,
  rcMode: 0x01,
  rlMode: 0x02,
  rlLedMode: 0x03,
};

const wiringMode = {
  wiredmode2: 0x00,
  wiredmode3: 0x01,
};

class ELKOSMARTBallastConfigurationCluster extends BallastConfigurationCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: controlMode (manufacturer specific, read/write)
       * Description:
       * Default:       0x00
       * Range:
       * 0x00 | Automatic
       * 0x01 | RC Mode
       * 0x02 | RL Mode
       * 0x03 | RL LED Mode
       */
      controlMode: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8(controlMode),
      },
      wiringMode: {
        id: 57345,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8(wiringMode),
      },
    };
  }

  static get controlMode() {
    return controlMode;
  }

  static get wiringMode() {
    return wiringMode;
  }

}

Cluster.addCluster(ELKOSMARTBallastConfigurationCluster);

module.exports = ELKOSMARTBallastConfigurationCluster;
