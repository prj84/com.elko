'use strict';

const { Cluster, ThermostatCluster, ZCLDataTypes } = require('zigbee-clusters');

const sensorMode = {
  air: 0x00,
  floor: 0x01,
  supervisor_Floor: 0x03,
};

const night_switching = {
  false: 0x00,
  true: 0x01,
};

const frost_guard = {
  false: 0x00,
  true: 0x01,
};

const childLock = {
  false: 0x00,
  true: 0x01,
};

const regulatorMode = {
  false: 0x00,
  true: 0x01,
};


class ELKOSpecificThermostatCluster extends ThermostatCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      thermostatLoad: { id: 1025, type: ZCLDataTypes.uint16,},
      display_text: { id: 1026, type: ZCLDataTypes.string,},
      sensorMode: { id: 1027, type: ZCLDataTypes.enum8({
          Air: 0,
          Floor: 1,
          Supervisor_Floor: 3,
        }),
      },
      regulatorTime: { id: 1028, type: ZCLDataTypes.uint8,},
      regulatorMode: { id: 1029, type: ZCLDataTypes.bool,},
      power_status: { id: 1030, type: ZCLDataTypes.bool,},
      dateTime: { id: 1031, type: ZCLDataTypes.string,},
      measure_power: { id: 1032, type: ZCLDataTypes.int16,},
      localFloorTemperature: { id: 1033, type: ZCLDataTypes.int16,},
      night_switching: { id: 1041, type: ZCLDataTypes.bool,},
      frost_guard: { id: 1042, type: ZCLDataTypes.bool,},
      childLock: { id: 1043, type: ZCLDataTypes.bool,},
      maxFloorTemp: { id: 1044, type: ZCLDataTypes.uint8,},
      relayState: { id: 1045, type: ZCLDataTypes.bool,},
      tempCalibration: { id: 1047, type: ZCLDataTypes.int8,},

    };
  }

}

Cluster.addCluster(ELKOSpecificThermostatCluster);

module.exports = ELKOSpecificThermostatCluster;
