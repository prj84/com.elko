'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, CLUSTER } = require('zigbee-clusters');
const IASZoneBoundCluster = require('../../lib/IASZoneBoundCluster');

class SmartSensorPIR extends ZigBeeDevice {

	async onNodeInit({ zclNode }) {

		this.printNode();
		debug(true);

		if (this.isFirstInit()){

      //Trigger IASZONE Inclusion
			await zclNode.endpoints[1].clusters.iasZone.writeAttributes({iasCIEAddress: '00:00:00:00:00:00:00:00'});
			//Send IASZONE CIA address
			await zclNode.endpoints[1].clusters.iasZone.writeAttributes({iasCIEAddress: '00:12:4b:00:18:dd:63:58'});
      //Read IASZONE zoneState to confirm enrollment
      await zclNode.endpoints[1].clusters.iasZone.readAttributes('zoneState');

		};

		//alarm_motion
		// add alarm_motion capabilities if needed
		if (!this.hasCapability('alarm_motion')) {
			this.addCapability('alarm_motion');
		}
		zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].onZoneStatusChangeNotification = payload => {
				this.onIASZoneStatusChangeNoficiation(payload);
			};

    // Register measure_battery capability and configure attribute reporting
    this.batteryThreshold = 20;
    if (this.hasCapability('alarm_battery')) {
    await this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
          reportOpts: {
            configureAttributeReporting: {
              minInterval: 6000, // No minimum reporting interval
              maxInterval: 60000, // Maximally every ~16 hours
              minChange: 5, // Report when value changed by 5
            },
          },
        });
      };

    // measure_battery
    if (this.hasCapability('measure_battery')) {
    await this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
            reportOpts: {
              configureAttributeReporting: {
                minInterval: 6000,
                maxInterval: 60000,
                minChange: 1,
              },
            },
          });
        };

    // measure_luminance
    if (this.hasCapability('measure_luminance')) {
    await this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT, {
      reportOpts: {
        configureAttributeReporting: {
          minInterval: 0,
          maxInterval: 300,//testvalue
          minChange: 1,
          },
        }
    });
  };

	}

	onIASZoneStatusChangeNoficiation({
    zoneStatus, extendedStatus, zoneId, delay,
  }) {
    this.log('IASZoneStatusChangeNotification received:', zoneStatus, extendedStatus, zoneId, delay);
    // deConz indikerer at alarm2 brukes this.setCapabilityValue('alarm_motion', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_motion', zoneStatus.alarm2);
  }

	onDeleted(){
		this.log("SmartSensorPIR removed")
	}

}

module.exports = SmartSensorPIR;

/*'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const IASZoneBoundCluster = require('../../lib/IASZoneBoundCluster');

class SmartSensorPIR extends ZigBeeDevice {



  	// this method is called when the Device is inited
  async	onNodeInit({ zclNode }) {


      const node = await this.homey.zigbee.getNode(this);
          node.handleFrame = (endpointId, clusterId, frame, meta) => {
            this.log("frame data! endpointId:", endpointId,", clusterId:", clusterId,", frame:", frame, ", meta:", meta);
      };

      //enroll device
      await zclNode.endpoints[1].clusters.iasZone.writeAttributes({iasCIEAddress: 0x0000000000000000});
      await zclNode.endpoints[1].clusters.iasZone.writeAttributes({zoneState: "enrolled"});

      this.enableDebug();
      //this.printNode();
      this.setAvailable();
/*
      //This is for the raw logging of zigbee trafic. Otherwise not used.
      //const { Util } = require('homey-zigbeedriver');
      //Util.debugZigbeeClusters(true);

      // Register measure_battery capability and configure attribute reporting
      this.batteryThreshold = 20;
      if (this.hasCapability('alarm_battery')) {
      await this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
            reportOpts: {
              configureAttributeReporting: {
                minInterval: 0, // No minimum reporting interval
                maxInterval: 60000, // Maximally every ~16 hours
                minChange: 5, // Report when value changed by 5
              },
            },
          });
        };

      // measure_battery
      if (this.hasCapability('measure_battery')) {
      await this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
              reportOpts: {
                configureAttributeReporting: {
                  minInterval: 6000,
                  maxInterval: 60000,
                  minChange: 1,
                },
              },
            });
          };

        // measure_luminance
        if (this.hasCapability('measure_luminance')) {
        await this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT, {
          reportOpts: {
            configureAttributeReporting: {
              minInterval: 0,
              maxInterval: 300,
              minChange: 1,
              },
            }
        });
      };

      //alarm_motion
      // add alarm_motion capabilities if needed
      if (!this.hasCapability('alarm_motion')) {
        this.addCapability('alarm_motion');
      }
      zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].onZoneStatusChangeNotification = payload => {
          this.onIASZoneStatusChangeNoficiation(payload);
        };
  }

  onIASZoneStatusChangeNoficiation({
    zoneStatus, extendedStatus, zoneId, delay,
  }) {
    this.log('IASZoneStatusChangeNotification received:', zoneStatus, extendedStatus, zoneId, delay);
    this.setCapabilityValue('alarm_motion', zoneStatus.alarm1);
  }
}
module.exports = SmartSensorPIR;
*/
/*2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] ZigBeeDevice has been initialized (first init: true)
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] ------------------------------------------
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] Node: a1bf7a0b-9da3-430d-b1d7-621a2449ac1b
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] - Receive when idle: false
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] - Endpoints: 1
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] -- Clusters:
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- basic
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- powerConfiguration
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- identify
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- ota
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- pollControl
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- illuminanceMeasurement
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- iasZone
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] --- diagnostics
2020-12-10 10:20:02 [log] [ManagerDrivers] [SmartSensorPIR] [0] ------------------------------------------
*/
