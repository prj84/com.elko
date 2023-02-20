'use strict';

const { Cluster, ThermostatCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTSpecificThermostatCluster extends ThermostatCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      load: { id: 1025, type: ZCLDataTypes.uint16,},
      display_text: { id: 1026, type: ZCLDataTypes.string,},
      sensor: { id: 1027, type: ZCLDataTypes.enum8({
          air: 0,
          floor: 1,
          supervisor_floor: 3,
        }),
      },
      regulatorTime: { id: 1028, type: ZCLDataTypes.uint8,},
      regulatorMode: { id: 1029, type: ZCLDataTypes.bool,},
      powerStatus: { id: 1030, type: ZCLDataTypes.bool,},
      dateTime: { id: 1031, type: ZCLDataTypes.string,},
      meanPower: { id: 1032, type: ZCLDataTypes.int16,},
      externalTemperature: { id: 1033, type: ZCLDataTypes.int16,},
      nightSwitching: { id: 1041, type: ZCLDataTypes.bool,},
      frostGuard: { id: 1042, type: ZCLDataTypes.bool,},
      childLock: { id: 1043, type: ZCLDataTypes.bool,},
      maxFloorTemperature: { id: 1044, type: ZCLDataTypes.uint8,},
      relayState: { id: 1045, type: ZCLDataTypes.bool,},
      calibration: { id: 1047, type: ZCLDataTypes.int8,},

    };
  }

}

Cluster.addCluster(ELKOSMARTSpecificThermostatCluster);

module.exports = ELKOSMARTSpecificThermostatCluster;
