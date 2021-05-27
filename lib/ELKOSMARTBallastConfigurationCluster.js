'use strict';

const { Cluster, BallastConfigurationCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTBallastConfigurationCluster extends BallastConfigurationCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: ControlMode (manufacturer specific, read/write)
             * Description:
             * Default:       0x00
             * Range:
             * 0x00 | Automatic
             * 0x01 | RC Mode
             * 0x02 | RL Mode
             * 0x03 | RL LED Mode
             */
      ControlMode: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8({
          Automatic: 0,
          RC_Mode: 1,
          RL_Mode: 2,
          RL_LED_Mode: 3,
        }),
      },
    };
  }

}

Cluster.addCluster(ELKOSMARTBallastConfigurationCluster);

module.exports = ELKOSMARTBallastConfigurationCluster;
