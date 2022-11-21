'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { ZCLNode, CLUSTER } = require('zigbee-clusters');
const ELKOSpecificThermostatCluster = require('../../lib/elkosmart_SpecificThermostatCluster');


class ESHSUPERREG extends ZigBeeDevice {


// this method is called when the Device is inited
    async	onNodeInit({ zclNode }) {
        this.setAvailable();
        let settings =   this.getSettings();

        this.addCapability('sensorMode');

//----------------------------------------------------------------------------------------------------------------------------------------------
// Action Flowcard

// Set Regulator%
        this.StartSetRegulatorAction = this.homey.flow.getActionCard('set_regulator');
        this.StartSetRegulatorAction.registerRunListener(async( args, state) => {
          try{
            var SetPoint = args.set_regulator;
            this.log ('Regulator % set to:', SetPoint)

            await args.device.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ occupiedHeatingSetpoint: Math.round ((SetPoint * 100)) });

            await this.setCapabilityValue('dim.regulator', SetPoint);

            this.log ('Regulator % set to:', SetPoint);
          } catch (err) {
            this.error('Error in run listener for set regulator: ', err)
          }
        });

// Set power_status
        this.startSetnightmodeAction = this.homey.flow.getActionCard('Power_reg');
        this.startSetnightmodeAction.registerRunListener(async( args, state) => {
          try {
            this.log ('Power argument:', args.Power);
            let SetPower = 0;
              switch (args.Power) {
                case 'Yes':
                  SetPower = 1;
                  break;
                case 'No':
                  SetPower = 0;
                  break;
                };
          this.log ('SetPower value:', SetPower);
          await args.device.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ power_status: SetPower });
          let SetPower_Capability = false;
            switch (args.Power) {
              case 'Yes':
                SetPower_Capability = true;
                break;
              case 'No':
                SetPower_Capability = false;
                break;
            };
          await this.setCapabilityValue('power_status', SetPower_Capability);
        } catch (err) {
          this.error('Error in run listener for set Power: ', err)
        }
          });

//----------------------------------------------------------------------------------------------------------------------------------------------
// Sensor mode

        if(this.hasCapability('sensorMode')) {
            const currentSensorMode =  await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('sensorMode');
            this.log('sensorMode in attribute is:', currentSensorMode.sensorMode);
            this.setCapabilityValue('sensorMode', currentSensorMode.sensorMode);
            this.log('sensorMode set to:', currentSensorMode.sensorMode);
            this.setSettings({
                sensorMode: currentSensorMode,
              });
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Max floor temp
// Set Thermostat Maxs floor temp
      if(this.hasCapability('maxFloorTemp')) {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('maxFloorTemp')
            .catch(err => this.error('Error reading max floor temp: ', err));
          this.setCapabilityValue('maxFloorTemp', value.maxFloorTemp)
          this.log('maxFloorTemp:', value.maxFloorTemp);
          this.setSettings({
            maxfloortemp: value.maxFloorTemp,
          });

          this.registerCapabilityListener('maxFloorTemp', async (value) => {
            const max_temp = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ maxFloorTemp: value });
            await this.log ('maxFloorTemp set to:', max_temp);
            await this.setSettings({
                maxfloortemp: max_temp,
              });
        });

        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Regulator Time
// Set Thermostat Regulator Time
      if(this.hasCapability('regulatorTime')) {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('regulatorTime')
            .catch(err => this.error('Error regulator time: ', err));
          this.setCapabilityValue('regulatorTime', value.regulatorTime)
          this.log('regulatorTime:', value.regulatorTime);
          this.setSettings({
            regulator_time: value.regulatorTime,
          });

          this.registerCapabilityListener('regulatorTime', async (value) => {
            const time = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ regulatorTime: value });
            await this.log ('regulatorTime set to:', time);
            await this.setSettings({
                regulator_time: time,
              });
        });

        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat temperature Calibration
// Set thermostat temperature Calibration
        if(this.hasCapability('tempCalibration')) {
            const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('tempCalibration')
              .catch(err => this.error('Error reading temp calibration: ', err));;
            this.setCapabilityValue('tempCalibration', value.tempCalibration)
            this.log('tempCalibration:', value.tempCalibration);
            this.setSettings({
              temp_calibration: value.tempCalibration,
            });

            this.registerCapabilityListener('tempCalibration', async (value) => {
                const temp = await zclNode.endpoints[1].clusters.thermostat
                  .writeAttributes({ tempCalibration: value });
                await this.log ('tempCalibration set to:', temp);
                await this.setSettings({
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
            try {
              const temp_air = Math.round((currentTempValue / 100) * 10) / 10;
              this.log('temperature air: ', temp_air);
              const sensorMode = this.getCapabilityValue('sensorMode');
              //this.log('sensor_mode: ', sensor_mode);
              this.setCapabilityValue('measure_temperature.air', temp_air);
              if (sensorMode === 'Air' || sensorMode === 'Supervisor_Floor'){
                this.setCapabilityValue('measure_temperature', temp_air);
                this.log('Measure temperature updated based on temp_mode: Air', temp_air)
              }
          } catch (err) {
            this.error('Error in reading and setting local temperature: ', err);
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
            try {
              const temp_floor = currentTempValue > -5000 ? Math.round((currentTempValue / 100) * 10) / 10 : null;
              this.log('temperature floor: ', temp_floor);
              const sensorMode = this.getCapabilityValue('sensorMode');
              //this.log('sensor_mode: ', sensor_mode);
              this.setCapabilityValue('measure_temperature.floor', temp_floor);
              if (sensorMode === 'Floor'){
                this.setCapabilityValue('measure_temperature', temp_floor);
                this.log('Measure temperature updated based on temp_mode: Floor', temp_floor)
              }
            } catch (err) {
              this.error('Error in reading and setting floor temperature: ', err)
            }
          });
        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Set point with dim
// Setpoint of regulator
          this.registerCapabilityListener('dim.regulator', async (value) => {
            try {
              const setTemp = await zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ occupiedHeatingSetpoint: Math.round ((value * 10000 / 10)*10) });
              this.log ('Regulator % set to:', value)
              } catch (err) {
              this.error('Error in writing occupiedHeatingSetpoint from dim.value: ', err)
            }
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
                try {
                  const setTemp = (((occupiedHeatingSetpoint / 10000) * 10) /10);
                  this.setCapabilityValue('dim.regulator', setTemp);
                  this.log('Regulator %', setTemp)
                } catch (err) {
                  this.error('Error in setting target dim value: ', err)
                }
              });

//---------------------------------------------------------------------------------------------------------------------------------------------
// Heating status - Relay On/Off - Setting Power Load - Metering power calculation
          if (this.hasCapability('heat')) {
            try {
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
                const Load = this.getCapabilityValue('thermostatLoad');
                const thisUpdate = Date.now();
                const lastUpdate = this.getStoreValue('lastUpdate');
                switch (currentRelayState) {
                  case true:
                    this.setCapabilityValue('measure_power', Load);
                    this.log('Power load: ', Load);
                    //this.setStoreValue('lastUpdate', thisUpdate);
                    //this.log('lastUpdate set to: ', thisUpdate)
                    break;
                  case false:
                    this.setCapabilityValue('measure_power', 0);
                    this.log('Power load: ', 0);
                    /*if (lastUpdate) {
                      const curMeterPowerkWh = this.getCapabilityValue('meter_power') || 0;
                      this.log('Current meter_power value: ', curMeterPowerkWh);
                      const newMeterPowerkWh = ((Load * ((thisUpdate - lastUpdate) / (1000 * 3600000))) + curMeterPowerkWh);
                      this.log('New meter_power value: ', newMeterPowerkWh);
                      this.setCapabilityValue('meter_power', newMeterPowerkWh);
                      this.log('meter_power set to: ', newMeterPowerkWh)
                    }*/
                    break;
                  };
              });
            } catch (err) {
              this.error('Error in setting relaystate: ', err)
            }
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// night_switching
          if(this.hasCapability('night_switching')) {
              this.registerCapabilityListener('night_switching', async (value) => {
                this.log ('night_switching trying to set to:', value);
                  zclNode.endpoints[1].clusters.thermostat
                    .writeAttributes({ night_switching : value });
                    this.setSettings({
                      night_switching: value,
                    });
                    this.log ('night_switching set to:', value)
                });
          };

          if (this.hasCapability('night_switching')) {
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                night_switching: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.night_switching', (currentState) => {
                  this.log('night_switching?: ', currentState);
                  this.setCapabilityValue('night_switching', currentState);
                  this.setSettings({
                    night_switching: currentState,
                  });
              });
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// frost_guard
          if(this.hasCapability('frost_guard')) {
                this.registerCapabilityListener('frost_guard', async (value) => {
                  this.log ('frost_guard trying to set to:', value);
                    zclNode.endpoints[1].clusters.thermostat
                      .writeAttributes({ frost_guard : value });
                      this.setSettings({
                        frost_guard: value,
                      });
                      this.log ('frost_guard set to:', value)
                  });
          };

          if (this.hasCapability('frost_guard')) {
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                frost_guard: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.frost_guard', (currentState) => {
                this.log('frost_guard?: ', currentState);
                this.setCapabilityValue('frost_guard', currentState);
                this.setSettings({
                  frost_guard: currentState,
                });
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
                    this.setSettings({
                      childLock: value,
                    });
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
                    this.setSettings({
                      childLock: value,
                    });
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
// Set power_status
                if(this.hasCapability('power_status')) {
                  try {
                      this.registerCapabilityListener('power_status', async (value) => {
                        this.log ('power_status trying to set to:', value);
                          zclNode.endpoints[1].clusters.thermostat
                            .writeAttributes({ power_status : value });
                            this.log ('power_status set to:', value)
                        });


                          // Configure reporting
                            zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                            power_status: {
                              minInterval: 0,
                              maxInterval: 600,
                              minChange: 1
                            }
                          });

                          // And listen for incoming attribute reports by binding a listener on the cluster
                          zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.power_status', (value) => {
                            this.log('power_status attribute value?', value)
                            this.setCapabilityValue('power_status', value);
                          });
                        } catch (err) {
                          this.error('Error in power status code', err)
                        }
                      };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Power
// Average Power latest 10 minuttes - We now use floor_watt and relay to deside the active power
        /*if(this.hasCapability('measure_power')) {
          try {
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
        } catch(err) {
          this.error('Error in getting measure_power: ', err);
        }
      };*/

//---------------------------------------------------------------------------------------------------------------------------------------------
// Meter Power
        if(this.hasCapability('meter_power')) {
          try {
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
          } catch (err) {
            this.error('Error in meter power code: ', err)
          }
        };

//----------------------------------------------------------------------------------------------------------------------------------------------
        //Reset of kwh counter
        this.registerCapabilityListener('button.reset_kwh_meter', async () => {
          try {
                this.setCapabilityValue('meter_power', 0);
                this.log('meter_power reset to 0')
                return;
              } catch (err) {
                this.error('Error when reset kwhmeter: ', err)
              }
        });

//---------------------------------------------------------------------------------------------------------------------------------------------
} //ZCL Node end
//---------------------------------------------------------------------------------------------------------------------------------------------

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
          if (event.changedKeys.includes('SensorMode')) {
            this.log('SensorMode changed: ', event.newSettings.SensorMode);
            let SetSensorMode = 0;
              switch (event.newSettings.SensorMode) {
                case 'Air':
                  SetSensorMode = 0;
                  break;
                case 'Floor':
                  SetSensorMode = 1;
                  break;
                case 'Supervisor_Floor':
                  SetSensorMode = 3;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ sensorMode: SetSensorMode});
              this.setCapabilityValue('sensorMode', SetSensorMode);
              this.log('sensorMode attribute set to:', SetSensorMode)
            };
          if (event.changedKeys.includes('frost_guard')) {
            this.log('frost_guard changed: ', event.newSettings.frost_guard);
            let Setfrost_guard = 0;
              switch (event.newSettings.frost_guard) {
                case 'Yes':
                  Setfrost_guard = 1;
                  break;
                case 'No':
                  Setfrost_guard = 0;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ frost_guard: Setfrost_guard});
              this.setCapabilityValue('frost_guard', Setfrost_guard);
              this.log('frost_guard attribute set to:', Setfrost_guard)
            };
          if (event.changedKeys.includes('night_switching')) {
            this.log('night_switching changed: ', event.newSettings.night_switching);
            let Setnight_switching = 0;
              switch (event.newSettings.night_switching) {
                case 'Yes':
                  Setnight_switching = 1;
                  break;
                case 'No':
                  Setnight_switching = 0;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ night_switching: Setnight_switching});
              this.setCapabilityValue('night_switching', Setnight_switching);
              this.log('night_switching attribute set to:', Setnight_switching)
            };
          if (event.changedKeys.includes('childLock')) {
            this.log('childLock changed: ', event.newSettings.childLock);
            let SetchildLock = 0;
              switch (event.newSettings.childLock) {
                case 'Yes':
                  SetchildLock = 1;
                  break;
                case 'No':
                  SetchildLock = 0;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ childLock: SetchildLock});
              this.setCapabilityValue('childLock', SetchildLock);
              this.log('childLock attribute set to:', SetchildLock)
            };
     }

//---------------------------------------------------------------------------------------------------------------------------------------------
}

module.exports = ESHSUPERREG;

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
