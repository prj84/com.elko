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
        let settings =   this.getSettings();


        // This is for the raw logging of zigbee trafic. Otherwise not used.
        // const { Util } = require('homey-zigbeedriver');
        // Util.debugZigbeeClusters(true);

//----------------------------------------------------------------------------------------------------------------------------------------------

        //Adds new capabilities to existing users
        this.addCapability('sensorMode')
        this.addCapability('childLock');
        this.addCapability('power_status')
        this.addCapability('thermostatLoad');
        this.addCapability('regulatorMode');
        this.addCapability('night_switching');
        this.addCapability('frost_guard');
        this.addCapability("measure_temperature");
        this.addCapability('tempCalibration');
        this.addCapability('regulatorTime');
        //this.addCapability('dateTime');
        this.addCapability('maxFloorTemp');
        this.addCapability('button.reset_kwhMeter');
        this.removeCapability('operatingMode');


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
/* Commented out this, unshure if this is needed atm
// Set nightMode
        this.startSetnightmodeAction = this.homey.flow.getActionCard('set_nightmode');
        this.startSetnightmodeAction.registerRunListener(async( args, state) => {
          this.log ('night_mode argument:', args.night_mode);
          let Setnightmode = 0;
            switch (args.night_mode) {
              case 'Yes':
                Setnightmode = 1;
                break;
              case 'No':
                Setnightmode = 0;
                break;
            };
          this.log ('Setnightmode value:', Setnightmode);
          await args.device.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ night_switching: Setnightmode });
          let Setnightmode_Capability = false;
            switch (args.Child_Lock) {
              case 'Yes':
                Setnightmode_Capability = true;
                break;
              case 'No':
                Setnightmode_Capability = false;
                break;
            };
          this.setCapabilityValue('nightMode', Setnightmode_Capability)
          });
// Set FrostGuard
        this.startSetnightmodeAction = this.homey.flow.getActionCard('set_frostguard');
        this.startSetnightmodeAction.registerRunListener(async( args, state) => {
          this.log ('night_mode argument:', args.frost_guard);
          let Setfrostguard = 0;
            switch (args.frost_guard) {
              case 'Yes':
                Setfrostguard = 1;
                break;
              case 'No':
                Setfrostguard = 0;
                break;
            };
          this.log ('Setnightmode value:', Setfrostguard);
          await args.device.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ frost_guard: Setfrostguard });
          let Setfrostguard_Capability = false;
            switch (args.Child_Lock) {
              case 'Yes':
                Setfrostguard_Capability = true;
                break;
              case 'No':
                Setfrostguard_Capability = false;
                break;
            };
          this.setCapabilityValue('frost_guard', Setfrostguard_Capability)
          });
*/
// Set power_status
        this.startSetnightmodeAction = this.homey.flow.getActionCard('Power');
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
            .writeAttributes({ frost_guard: SetPower });
          let SetPower_Capability = false;
            switch (args.Child_Lock) {
              case 'Yes':
                SetPower_Capability = true;
                break;
              case 'No':
                SetPower_Capability = false;
                break;
            };
          await this.setCapabilityValue('power_status', SetPower_Capability);
        } catch (err) {
          this.error('Error in run listener for set night mode: ', err)
        }
          });

//----------------------------------------------------------------------------------------------------------------------------------------------
// Sensor mode

        if(this.hasCapability('sensorMode')) {
          try {
            const currentSensorMode =  await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('sensorMode');
            this.log('sensorMode in attribute is:', currentSensorMode.sensorMode);
            this.setCapabilityValue('sensorMode', currentSensorMode.sensorMode);
            this.log('sensorMode set to:', currentSensorMode.sensorMode);
            this.setSettings({
                sensorMode: currentSensorMode,
              });
            } catch (err) {
              this.error('Error in setting Sensor Mode: ', err);
            }
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
          if(this.hasCapability('regulatorMode')) {
            try {
              const currentregulatorMode = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('regulatorMode');
              await this.log('regulatorMode in attribute is:', currentregulatorMode.regulatorMode);
              await this.setCapabilityValue('regulatorMode', currentregulatorMode.regulatorMode);
              await this.log('regulatorMode set to:', currentregulatorMode.regulatorMode);
              await this.onUpdateMode(currentregulatorMode.regulatorMode);
            } catch (err) {
               this.error('Error setting regulator mode', err);
            }
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
            try {
            const max_temp = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ maxFloorTemp: value });
            await this.log ('maxFloorTemp set to:', max_temp);
            await this.setSettings({
                maxfloortemp: max_temp,
              });
            } catch (err) {
              this.error('Error setting max floor temp; ', err);
            }
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
            try {
            const time = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ regulatorTime: value });
            await this.log ('regulatorTime set to:', time);
            await this.setSettings({
                regulator_time: time,
              });
            } catch (err) {
              this.error('Error in setting regulator time: ', err);
            }
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
              try {
                const temp = await zclNode.endpoints[1].clusters.thermostat
                  .writeAttributes({ tempCalibration: value });
                await this.log ('tempCalibration set to:', temp);
                await this.setSettings({
                  temp_calibration: temp,
                });
              } catch (err) {
                this.error('Error in setting temp calibration; ', err);
              }
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
// Set point with temperature wheel

    // Setpoint of thermostat
        if(this.hasCapability('target_temperature')) {
          this.registerCapabilityListener('target_temperature', async (value) => {
            try {
              const setTemp =  await zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ occupiedHeatingSetpoint: Math.round (value*100) });
              this.log ('target_temperature set to:', value)
            } catch (err) {
              this.error('Error in setting occupiedHeatingSetpoint: ', err)
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
                  const setTemp = (((occupiedHeatingSetpoint / 100) * 10) /10)
                  this.setCapabilityValue('target_temperature', setTemp);
                  this.log('target_temperature', setTemp)
                } catch (err) {
                  this.error('Error in reading or setting target_temperature: ', err)
                }
              });
            };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Set point with dim

    // Setpoint of regulator
        if(this.hasCapability('dim.regulator')) {
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
                  setTemp = (((occupiedHeatingSetpoint / 10000) * 10) /10)
                  this.setCapabilityValue('dim.regulator', setTemp);
                  this.log('Regulator %', setTemp)
                } catch (err) {
                  this.error('Error in setting target dim value: ', err)
                }
              });
            };

//---------------------------------------------------------------------------------------------------------------------------------------------

// Heating status
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
              });
            } catch (err) {
              this.error('Error in setting relaystate: ', err)
            }
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// night_switching
          if(this.hasCapability('night_switching')) {
            try {
              this.registerCapabilityListener('night_switching', async (value) => {
                this.log ('night_switching trying to set to:', value);
                  zclNode.endpoints[1].clusters.thermostat
                    .writeAttributes({ night_switching : value });
                    this.setSettings({
                      night_switching: value,
                    });
                    this.log ('night_switching set to:', value)
                });
              } catch (err) {
                this.error('Error in reading and setting night switching setting: ', err)
              }
          };

          if (this.hasCapability('night_switching')) {
            try {
                zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                night_switching: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.night_switching', (currentState) => {
                try {
                  this.log('night_switching?: ', currentState);
                  this.setCapabilityValue('night_switching', currentState);
                  this.setSettings({
                    night_switching: currentState,
                  });
                } catch (err) {
                  this.error('Error in setting Night switching: ', err)
                }
              });
            } catch (err) {
              this.error('Error on night switching code: ', err)
            }
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// frost_guard
          if(this.hasCapability('frost_guard')) {
            try {
                this.registerCapabilityListener('frost_guard', async (value) => {
                  this.log ('frost_guard trying to set to:', value);
                    zclNode.endpoints[1].clusters.thermostat
                      .writeAttributes({ frost_guard : value });
                      this.setSettings({
                        frost_guard: value,
                      });
                      this.log ('frost_guard set to:', value)
                  });
              } catch (err) {
                this.error('Error in reading and setting frost guard setting: ', err)
              }
          };

          if (this.hasCapability('frost_guard')) {
            try {
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
            } catch (err) {
              this.error('Error in frost guard code: ', err)
            }
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Childlock

// Set Childlock
        if(this.hasCapability('childLock')) {
          try {
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
                } catch (err) {
                  this.error('Error in childlock code:', err)
                }
              };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Load

// Set Thermostat Load
        if(this.hasCapability('thermostatLoad')) {
          try {
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
          } catch (err) {
            this.error('Error in thermosat load code: ', err)
          }
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
        if(this.hasCapability('measure_power')) {
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
        };

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
        this.registerCapabilityListener('button.reset_kwhMeter', async () => {
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
//Defines mode and set the needed capability
  async onUpdateMode(value) {
    try {
        if (value === 0) {
        await this.addCapability('target_temperature');
        await this.addCapability('measure_temperature');
        await this.removeCapability('dim.regulator');
        await this.setSettings({
            regulatorMode: 0,
          });
        await this.log('Added target_temperature, removed dim.regulator')
      } else if (value === 1) {
        await this.removeCapability('target_temperature');
        await this.removeCapability('measure_temperature');
        await this.addCapability('dim.regulator');
        await this.setSettings({
            regulatorMode: 1,
          });
        await this.log('Added dim.regulator, removed target_temperature')
      }
    } catch (err) {
      this.error('Error when trying to change operating mode: ', err)
    }
  }

  //Thermostat Load value setting
  //when settings is changed it writes new value to attribute

    async onSettings(event) {
      try {
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
        if (event.changedKeys.includes('regulatorMode')) {
          this.log('Regulator mode changed: ', event.newSettings.regulatorMode);
          let SetRegulatorMode = 0;
            switch (event.newSettings.regulatorMode) {
              case 'Thermostat':
                SetRegulatorMode = 0;
                break;
              case 'Regulator':
                SetRegulatorMode = 1;
                break;
            };
          this.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ regulatorMode: SetRegulatorMode});
            switch (SetRegulatorMode) {
              case 0:
                this.removeCapability('dim.regulator');
                this.addCapability('target_temperature')
                break;
              case 1:
                this.addCapability('dim.regulator');
                this.removeCapability('target_temperature')
                break;
            };
            this.setCapabilityValue('regulatorMode', event.newSettings.regulatorMode);
            this.log('RegulatorMode attribute set to:', event.newSettings.regulatorMode)
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
          } catch (err) {
            this.error('Error in listening or setting a new setting: ', err)
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
