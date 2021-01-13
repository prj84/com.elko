'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class SmartSensorClimate extends ZigBeeDevice {


  	// this method is called when the Device is inited
  	onNodeInit({ zclNode }) {
      //this.enableDebug();
      //this.printNode();
      this.setAvailable();

      // This is for the raw logging of zigbee trafic. Otherwise not used.
      // const { Util } = require('homey-zigbeedriver');
      // Util.debugZigbeeClusters(true);

      // Register measure_battery capability and configure attribute reporting
      this.batteryThreshold = 20;
      if (this.hasCapability('alarm_battery')) {
      this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
            reportOpts: {
              configureAttributeReporting: {
                minInterval: 6000, // No minimum reporting interval
                maxInterval: 60000, // Maximally every ~24 hours
                minChange: 2, // Report when value changed by 2%
              },
            },
          });
        };

      // measure_battery
      if (this.hasCapability('measure_battery')) {
      this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
    					reportOpts: {
    						configureAttributeReporting: {
    							minInterval: 6000,
    							maxInterval: 60000,
    							minChange: 1,
    						},
    					},
    				});
        };


      //Register measure_temperature capaility
      if (this.hasCapability('measure_temperature')) {
      this.registerCapability('measure_temperature', CLUSTER.TEMPERATURE_MEASUREMENT, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 3600, // Maximally every ~1 hours
            minChange: 100, // Report when value changed by 1c
          },
        },
      });
      };

      if (this.hasCapability('measure_humidity')) {
      this.registerCapability('measure_humidity', CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 3600, // Maximally every ~1 hours
            minChange: 100, // Report when value changed by 1%
          },
        },
      });
      };
    }
}
module.exports = SmartSensorClimate;

//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] ZigBeeDevice has been initialized (first init: true)
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] ------------------------------------------
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] Node: 1e6778d0-7632-419e-bf69-7874bc80a7ad
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] - Receive when idle: false
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] - Endpoints: 1
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] -- Clusters:
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- basic
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- powerConfiguration
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- identify
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- ota
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- pollControl
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- temperatureMeasurement
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- relativeHumidity
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] --- diagnostics
//2020-08-14 08:59:52 [log] [ManagerDrivers] [SmartSensor] [0] ------------------------------------------
