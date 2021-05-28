'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { ZCLNode, CLUSTER } = require('zigbee-clusters');
const ELKOSpecificThermostatCluster = require('../../lib/ELKOSpecificThermostatCluster');


class ESHSUPERTR extends ZigBeeDevice {


    	// this method is called when the Device is inited
    async	onNodeInit({ zclNode }) {
        //this.enableDebug();
        //this.printNode();
        this.setAvailable();

        //this.enableDebug();
        //this.printNode();
        //this.setAvailable();
        let settings =   this.getSettings();
        await this.registerFlowCards();

        // This is for the raw logging of zigbee trafic. Otherwise not used.
        // const { Util } = require('homey-zigbeedriver');
        // Util.debugZigbeeClusters(true);

//----------------------------------------------------------------------------------------------------------------------------------------------

        //Adds new capabilities to existing users
        this.addCapability('sensorMode');
        this.addCapability('childLock');
        //this.addCapability('childLockSensor');
        this.addCapability('thermostatLoad');
        this.addCapability('operatingMode');
        this.addCapability("target_temperature");
        this.addCapability("measure_temperature");
        this.addCapability("dim.regulator");
        this.addCapability('tempCalibration');
        this.addCapability('regulatorTime');
        //this.addCapability('dateTime');
        this.addCapability('maxFloorTemp');
        this.addCapability('button.reset_kwhMeter');

        this.removeCapability('button.reset_kwh_meter')
        this.removeCapability('childLockSensor');
        this.removeCapability('dateTime');
        //this.removeCapability('button.reset_operatingMode');
        this.removeCapability('displayText');
        //this.removeCapability('nightMode');
        //this.removeCapability('nightModeSensor');
        //this.removeCapability('frostGuard');
        //this.removeCapability('frostGuardSensor');


        //Capability listner
  /*      this.registerCapabilityListener('dim.regulator', (value, opts) => {
          return this.onUpdateRegulator(value, opts);
        });*/


//----------------------------------------------------------------------------------------------------------------------------------------------
// Sensor mode

        if(this.hasCapability('sensorMode')) {
            const currentSensorMode =  await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('sensorMode');
            this.log('sensorMode in attribute is:', currentSensorMode.sensorMode);
            this.setCapabilityValue('sensorMode', currentSensorMode.sensorMode);
            this.log('sensorMode set to:', currentSensorMode.sensorMode);

          };

//----------------------------------------------------------------------------------------------------------------------------------------------
      /*
        if(this.hasCapability('dateTime')) {
          const formatDate = (date) => {
            return [20, date.getYear() - 100, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
          };
          this.log(formatDate);
          zclNode.endpoints[1].clusters.thermostat.writeAttributes({ dateTime: formatDate});
        };
      */
//---------------------------------------------------------------------------------------------------------------------------------------------
        // Read if Thermostat is in Regulator mode (Thermostat/Regulator) (FALSE/TRUE)
        //Poll i used since there is no way to set up att listemer to att 1029 without geting error
          if(this.hasCapability('operatingMode')) {
            const currentOperatingMode = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('operatingMode');
            this.log('operatingMode in attribute is:', currentOperatingMode.operatingMode);
            this.setCapabilityValue('operatingMode', currentOperatingMode.operatingMode);
            this.log('operatingMode set to:', currentOperatingMode.operatingMode);
            this.onUpdateMode(currentOperatingMode.operatingMode);
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Max floor temp

      // Set Thermostat Maxs floor temp
      if(this.hasCapability('maxFloorTemp')) {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('maxFloorTemp');
          this.setCapabilityValue('maxFloorTemp', value.maxFloorTemp)
          this.log('maxFloorTemp:', value.maxFloorTemp);
          this.setSettings({
            maxfloortemp: value.maxFloorTemp,
          });

          this.registerCapabilityListener('maxFloorTemp', async (value) => {
            const max_temp = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ maxFloorTemp: value });
            this.log ('maxFloorTemp set to:', max_temp);
            this.setSettings({
                maxfloortemp: max_temp,
              });
        });

        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Regulator Time

      // Set Thermostat Regulator Time
      if(this.hasCapability('regulatorTime')) {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('regulatorTime');
          this.setCapabilityValue('regulatorTime', value.regulatorTime)
          this.log('regulatorTime:', value.regulatorTime);
          this.setSettings({
            regulator_time: value.regulatorTime,
          });

          this.registerCapabilityListener('regulatorTime', async (value) => {
            const time = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ regulatorTime: value });
            this.log ('regulatorTime set to:', time);
            this.setSettings({
                regulator_time: time,
              });
        });

        };

  //---------------------------------------------------------------------------------------------------------------------------------------------
  // Thermostat temperature Calibration

        // Set thermostat temperature Calibration
        if(this.hasCapability('tempCalibration')) {
            const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('tempCalibration');
            this.setCapabilityValue('tempCalibration', value.tempCalibration)
            this.log('tempCalibration:', value.tempCalibration);
            this.setSettings({
              temp_calibration: value.tempCalibration,
            });

            this.registerCapabilityListener('tempCalibration', async (value) => {
              const temp = await zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ tempCalibration: value });
              this.log ('tempCalibration set to:', temp);
              this.setSettings({
                  temp_calibration: temp,
                });
          });

          };

//----------------------------------------------------------------------------------------------------------------------------------------------
// Air Temperature
// measure_temperature
        if (this.hasCapability('measure_temperature.air')) {

          await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
            localTemperature: {
              minInterval: 60,
              maxInterval: 600,
              minChange: 1
            }
          });


          zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.localTemperature', (currentTempValue) => {
            const temp_air = Math.round((currentTempValue / 100) * 10) / 10;
            this.log('temperature air: ', temp_air);
            const sensorMode = this.getCapabilityValue('sensorMode');
            //this.log('sensor_mode: ', sensor_mode);
            this.setCapabilityValue('measure_temperature.air', temp_air);
            if (sensorMode === 'Air' || sensorMode === 'Supervisor_Floor'){
              this.setCapabilityValue('measure_temperature', temp_air);
              this.log('Measure temperature updated based on temp_mode: Air', temp_air)
            }
          });
        };

//----------------------------------------------------------------------------------------------------------------------------------------------
// Floor Temperature
// measure_temperature
        if (this.hasCapability('measure_temperature.floor')) {

            await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
            localFloorTemperature: {
              minInterval: 60,
              maxInterval: 600,
              minChange: 1
            }
          });

          zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.localFloorTemperature', (currentTempValue) => {
            const temp_floor = currentTempValue > -5000 ? Math.round((currentTempValue / 100) * 10) / 10 : null;
            this.log('temperature floor: ', temp_floor);
            const sensorMode = this.getCapabilityValue('sensorMode');
            //this.log('sensor_mode: ', sensor_mode);
            this.setCapabilityValue('measure_temperature.floor', temp_floor);
            if (sensorMode === 'Floor'){
              this.setCapabilityValue('measure_temperature', temp_floor);
              this.log('Measure temperature updated based on temp_mode: Floor', temp_floor)
            }
          });
        };


//---------------------------------------------------------------------------------------------------------------------------------------------
// Set point with temperature wheel

    // Setpoint of thermostat
        if(this.hasCapability('target_temperature')) {
          this.registerCapabilityListener('target_temperature', async (value) => {
            const setTemp =  await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ occupiedHeatingSetpoint: Math.round (value*100) });
            this.log ('target_temperature set to:', value)
          });

              // Configure reporting
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                occupiedHeatingSetpoint: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              // And listen for incoming attribute reports by binding a listener on the cluster
              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.occupiedHeatingSetpoint', (occupiedHeatingSetpoint) => {
                const setTemp = (((occupiedHeatingSetpoint / 100) * 10) /10)
                this.setCapabilityValue('target_temperature', setTemp);
                this.log('target_temperature', setTemp)
              });
            };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Set point with dim

    // Setpoint of thermostat
        if(this.hasCapability('dim.regulator')) {
          this.registerCapabilityListener('dim.regulator', async (value) => {
            const setTemp = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ occupiedHeatingSetpoint: Math.round ((value * 10000 / 10)*10) });
            this.log ('Regulator % set to:', value)
          });

              // Configure reporting
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                occupiedHeatingSetpoint: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              // And listen for incoming attribute reports by binding a listener on the cluster
              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.occupiedHeatingSetpoint', (occupiedHeatingSetpoint) => {
                const setTemp = (((occupiedHeatingSetpoint / 10000) * 10) /10)
                this.setCapabilityValue('dim.regulator', setTemp);
                this.log('Regulator %', setTemp)
              });
            };

//---------------------------------------------------------------------------------------------------------------------------------------------

// Heating status
          if (this.hasCapability('heat')) {
              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
              relayState: {
                minInterval: 0,
                maxInterval: 600,
                minChange: 1
              }
            });

            zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.relayState', (currentRelayState) => {
              this.log('Relay state?: ', currentRelayState);
              this.setCapabilityValue('heat', currentRelayState);
            });
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Childlock

// Set Childlock
        if(this.hasCapability('childLock')) {
            this.registerCapabilityListener('childLock', async (value) => {
              this.log ('childLock trying to set to:', value);
                zclNode.endpoints[1].clusters.thermostat
                  .writeAttributes({ childLock : value });
                  this.log ('childLock set to:', value)
              });


                // Configure reporting
                  zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                  childLock: {
                    minInterval: 0,
                    maxInterval: 600,
                    minChange: 1
                  }
                });

                // And listen for incoming attribute reports by binding a listener on the cluster
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.childLock', (value) => {
                  this.log('childLock attribute value?', value)
                  this.setCapabilityValue('childLock', value);
                  //this.setCapabilityValue('childLockSensor', value);
                });

              };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Load

// Set Thermostat Load
        if(this.hasCapability('thermostatLoad')) {
            const value =   zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('thermostatLoad');
            this.log('thermostatLoad:', value.thermostatLoad);
            this.setCapabilityValue('thermosatLoad', value.thermostatLoad);
            this.setSettings({
                floor_watt: value.thermostatLoad,
              });

            this.registerCapabilityListener('thermostatLoad', async (value) => {
              const load =   zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ thermostatLoad: value });
              this.log ('thermostatLoad set to:', load);
              this.setSettings({
                  floor_watt: value,
                });
          });
        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Power
        if(this.hasCapability('measure_power')) {
          this.registerCapability('measure_power', CLUSTER.THERMOSTAT, {
            get: 'measure_power',
            reportParser: value => Math.round(Int16Array.from([value])[0]),
            report: 'measure_power',
            getOpts: {
              getOnLine: true,
              getOnStart: true,
              pollInterval: 600000
            },
          });
        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Meter Power
        if(this.hasCapability('meter_power')) {
          this.registerCapability('meter_power', CLUSTER.THERMOSTAT, {
            get: 'measure_power',
            reportParser: value => (((Math.round(Int16Array.from([value])[0])/60)/1000)+ this.getCapabilityValue('meter_power')),
            report: 'measure_power',
            getOpts: {
              getOnLine: true,
              getOnStart: true,
              pollInterval: 600000
            },
          });
        };




//----------------------------------------------------------------------------------------------------------------------------------------------
        //Reset of kwh counter
        this.registerCapabilityListener('button.reset_kwhMeter', async () => {
                this.setCapabilityValue('meter_power', 0);
                this.log('meter_power reset to 0')
                return;
        });

//---------------------------------------------------------------------------------------------------------------------------------------------
} //ZCL Node end
//---------------------------------------------------------------------------------------------------------------------------------------------
//Defines mode and set the needed capability
  onUpdateMode(value) {
      if (value === 'Thermostat') {
      this.addCapability("target_temperature");
      this.addCapability("measure_temperature");
      this.removeCapability("dim.regulator");
      this.log('Added target_temperature, removed dim.regulator')
    } else if (value === 'Regulator') {
      this.removeCapability("target_temperature");
      this.removeCapability("measure_temperature");
      this.addCapability("dim.regulator");
      this.log('Added dim.regulator, removed target_temperature')
    }
  }

  //Thermostat Load value setting
  //when settings is changed it writes new value to attribute

    async onSettings(event) {
      this.log('onSettings', event);
      // Thermostat load effect changed
      if (event.changedKeys.includes('floor_watt')) {
        this.log('Thermostat load changed: ', event.newSettings.floor_watt);
        this.zclNode.endpoints[1].clusters.thermostat
          .writeAttributes({ thermostatLoad: event.newSettings.floor_watt});
          this.setCapabilityValue('thermostatLoad', event.newSettings.floor_watt);
          this.log('thermosatLoad attribute set to:', event.newSettings.floor_watt)
        };
      if (event.changedKeys.includes('maxfloortemp')) {
        this.log('Thermostat max floor temp changed: ', event.newSettings.maxfloortemp);
        this.zclNode.endpoints[1].clusters.thermostat
          .writeAttributes({ maxFloorTemp: event.newSettings.maxfloortemp});
          this.setCapabilityValue('maxFloorTemp', event.newSettings.maxfloortemp);
          this.log('Thermostat max temp attribute set to:', event.newSettings.maxfloortemp)
        };
    if (event.changedKeys.includes('regulator_time')) {
      this.log('Regulator time changed: ', event.newSettings.regulator_time);
      this.zclNode.endpoints[1].clusters.thermostat
        .writeAttributes({ regulatorTime: event.newSettings.regulator_time});
        this.setCapabilityValue('regulatorTime', event.newSettings.regulator_time);
        this.log('Regulator time attribute set to:', event.newSettings.regulator_time)
      };
    if (event.changedKeys.includes('temp_calibration')) {
      this.log('Temp calibration changed: ', event.newSettings.temp_calibration);
      this.zclNode.endpoints[1].clusters.thermostat
        .writeAttributes({ tempCalibration: event.newSettings.temp_calibration});
        this.setCapabilityValue('tempCalibration', event.newSettings.temp_calibration);
        this.log('Temp calibration attribute set to:', event.newSettings.temp_calibration)
      };

     }


    //Flowcard Action
    async onUpdateFanMode(value, opts) {
      try {
        await this.setCapabilityValue('dim.regulator', value);
        this.log(`set fan mode OK: ${value}`);
      }
    }

//---------------------------------------------------------------------------------------------------------------------------------------------
}

module.exports = ESHSUPERTR;

/*
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] ZigBeeDevice has been initialized (first init: true)
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] Node: ac277673-dbcd-4cb2-9ddb-8041c8824530
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Receive when idle: true
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Endpoints: 1
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] -- Clusters:
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- basic
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- identify
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- thermostat
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] Node: ac277673-dbcd-4cb2-9ddb-8041c8824530
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Receive when idle: true
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Endpoints: 1
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] -- Clusters:
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- basic
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- identify
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- thermostat
2020-08-20 10:21:41 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
*/
