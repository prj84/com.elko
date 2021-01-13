'use strict';

const { Cluster, ThermostatCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSpecificThermostatCluster extends ThermostatCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      thermostatLoad: {
        id: 1025,
        type: ZCLDataTypes.uint16,
      },
      sensorMode: {
        id: 1027,
        type: ZCLDataTypes.enum8({
          Air: 0,
          Floor: 1,
          Supervisor_Floor: 3,
        }),
      },
      regulatorTime: {
        id: 1028,
        type: ZCLDataTypes.uint8,
      },
      operatingMode: {
        id: 1029,
        type: ZCLDataTypes.enum8({
          Thermostat: 0,
          Regulator: 1,
        }),
      },
      dateTime: {
        id: 1031,
        type: ZCLDataTypes.int16,
      },
      measure_power: {
        id: 1032,
        type: ZCLDataTypes.int16,
      },
      localFloorTemperature: {
        id: 1033,
        type: ZCLDataTypes.int16,
      },
      childLock: {
        id: 1043,
        type: ZCLDataTypes.bool,
      },
      maxFloorTemp: {
        id: 1044,
        type: ZCLDataTypes.uint8,
      },
      relayState: {
        id: 1045,
        type: ZCLDataTypes.bool,
      },
      tempCalibration: {
        id: 1047,
        type: ZCLDataTypes.int8,
      },

    };
  }

}

Cluster.addCluster(ELKOSpecificThermostatCluster);

module.exports = ELKOSpecificThermostatCluster;
