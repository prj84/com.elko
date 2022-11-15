'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class SmartSensorClimate extends ZigBeeDevice {


// this method is called when the Device is inited
  	onNodeInit({ zclNode }) {

      this.setAvailable();


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
            minInterval: 1800, // No minimum reporting interval
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
            minInterval: 1800, // No minimum reporting interval
            maxInterval: 3600, // Maximally every ~1 hours
            minChange: 100, // Report when value changed by 1%
          },
        },
      });
      };
    }
}
module.exports = SmartSensorClimate;
