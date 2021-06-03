'use strict';

const { Cluster, OccupancyCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTOccupancySensingCluster extends OccupancySensingCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: OccupancyDfltOperationMode (manufacturer specific, read/write)
             * Description: Default operational mode after reboot of device
             * Default:       0x00
             * Range:
             * 0x00 | Manual Mode
             * 0x01 | Automatic Mode
             * 0x02 | Auto On Manual Off Mode
             * 0x03 | Manual On Auto Off Mode
             */
      OccupancyDfltOperationMode: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8({
          Manual: 0,
          Automatic: 1,
          Automatic_ON: 2,
          Automatic_OFF: 3,
        }),
      },

      /* 0xe001: OccupancyOperationMode (manufacturer specific, read/write)
             * Description: Operational mode of sensor during runtime (If reboot it goes back to mode set in OccupancyDfltOperationMode)
             * Default:       0x00
             * Range:
             * 0x00 | Manual Mode
             * 0x01 | Automatic Mode
             * 0x02 | Auto On Manual Off Mode
             * 0x03 | Manual On Auto Off Mode
             * 0x04 | Reserved
             * 0x05 | Testmode for Occupancy sensor, no commands are sent, just LED on device
             */
      OccupancyOperationMode: {
        id: 57345,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.enum8({
          Manual: 0,
          Automatic: 1,
          Automatic_ON: 2,
          Automatic_OFF: 3,
          Test_mode: 5,
        }),
      },

      /* 0xe002: ForedOffTimeout (manufacturer specific, read/write)
             * Description: How long sensor stays in forced off state before is able to change its state to occupied in seconds.
             */
      ForedOffTimeout: {
        id: 57346,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint16,
      },

      /* 0xe003: OccupancySensitivity (manufacturer specific, read/write)
             * Description: How long sensor stays in forced off state before is able to change its state to occupied in seconds.
             *Range:
             *100 = most sensitive
             *50 = low
             *75 = medium
             */
      OccupancySensitivity: {
        id: 57347,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint8,
      },
    };
  }

}

Cluster.addCluster(ELKOSMARTOccupancySensingCluster);

module.exports = ELKOSMARTOccupancySensingCluster;
