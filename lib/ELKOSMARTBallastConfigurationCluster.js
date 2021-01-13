'use strict';

const { Cluster, BallastConfigurationCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTBallastConfigurationCluster extends BallastConfigurationCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: RlMode (manufacturer specific, read/write)
             * Description:
             * Default:       0x00
             * Range:
             * 0x00 | RL Mode OFF
             * 0x03 | RL Mode ON
             */
      rlMode: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8({
          Off: 0,
          On: 3,
        }),
      },
    };
  }

}

Cluster.addCluster(ELKOSMARTBallastConfigurationCluster);

module.exports = ELKOSMARTBallastConfigurationCluster;
