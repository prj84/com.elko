'use strict';

const { Cluster, OnOffCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTOnOffCluster extends OnOffCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: PreWarning (manufacturer specific, read/write)
             * Description:   Indicates end of the OffTimer by dimming down for x seconds.
             * Default:       0x0000
             * Range:         0x0000 -  0xffff
             */
      preWarning: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint16,
      },

      /* 0xe001: OffTimer (manufacturer specific, read/write)
             * Description:   Turns off after x seconds.
             * Default:       0x00000000
             * Range:         0x00000000 -  0xffffffff
             */
      offTimer: {
        id: 57345,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint32,
      },
    };
  }

}

Cluster.addCluster(ELKOSMARTOnOffCluster);

module.exports = ELKOSMARTOnOffCluster;
