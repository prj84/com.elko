'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER, Cluster } = require('zigbee-clusters');
const ELKOSMARTSpecificThermostatCluster = require('../../lib/elkosmart_SpecificThermostatCluster');
const ELKOSMARTDevice = require('../../lib/elkosmart_Device');

class ESHSUPERTR extends ZigBeeDevice {


    	// this method is called when the Device is inited
    async	onNodeInit({ zclNode }) {
        //this.enableDebug();
        //this.printNode();
        this.setAvailable();
        const settings = this.getSettings();


        // This is for the raw logging of zigbee trafic. Otherwise not used.
         //const { Util } = require('homey-zigbeedriver');
         //Util.debugZigbeeClusters(true);

//----------------------------------------------------------------------------------------------------------------------------------------------

        //Adds new capabilities to existing users
        this.addCapability('sensorMode');
        this.addCapability('childLock');
        this.addCapability('power_status');
        this.addCapability('thermostatLoad');
        this.addCapability('regulatorMode');
        this.addCapability('night_switching');
        this.addCapability('frost_guard');
        this.addCapability('measure_temperature');
        this.addCapability('tempCalibration');
        this.addCapability('regulatorTime');
        this.addCapability('maxFloorTemp');
        this.addCapability('button.reset_kwhMeter');
        if (this.hasCapability('operatingMode')) {
          this.removeCapability('operatingMode');
        };
        if (this.hasCapability('dateTime')) {
          this.removeCapability('dateTime');
        };
        if (this.hasCapability('displayText')) {
          this.removeCapability('displayText');
        };


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
// sensorMode

          if(this.hasCapability('sensorMode')) {
            try {
            const currentSensorMode = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('sensor');
            this.log('sensorMode in attribute is:', currentSensorMode.sensor);
            this.setCapabilityValue('sensorMode', currentSensorMode.sensor);
            this.log('sensorMode set to:', currentSensorMode.sensor);
            let setSensorMode = ""
            switch (currentSensorMode) {
              case 0x00:
                setSensorMode = "air";
                break;
              case 0x01:
                setSensorMode = "floor";
                break;
              case 0x03:
                setSensorMode = "supervisor_floor";
                break;
            };
            this.setSettings({
            sensorMode: setSensorMode,
            });
            this.log('Sensor Setting set to:', setSensorMode);
            } catch (err) {
            this.error('Error in setting Sensor Mode: ', err);
            }
            } else {
            this.error('Sensor Mode capability not found.');
            };

//---------------------------------------------------------------------------------------------------------------------------------------------
        // Read if Thermostat is in Regulator mode (Thermostat/Regulator) (FALSE/TRUE)
        //I used poll used since there is no way to set up att listemer to att 1029 without geting error
          if(this.hasCapability('regulatorMode')) {
            try {
              const currentregulatorMode = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('regulatorMode');
              await this.log('regulatorMode in attribute is:', currentregulatorMode.regulatorMode);
              await this.setCapabilityValue('regulatorMode', currentregulatorMode.regulatorMode);
              let setRegulatorMode = false
              switch (currentregulatorMode.regulatorMode) {
                case 0x00:
                  setRegulatorMode = true;
                  break;
                case 0x01:
                  setRegulatorMode = false;
                  break;
              };
              this.setSettings({
                regulatorMode: setRegulatorMode,
                });
              await this.onUpdateMode(currentregulatorMode.regulatorMode);
            } catch (err) {
               this.error('Error setting regulator mode', err);
            }
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Load

// Set Thermostat Load
        try{ 
          if(this.hasCapability('thermostatLoad')) {
            const value = zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('load');
            
            /*let thermostatLoad = await this.getClusterCapabilityValue(
              'load',
              CLUSTER.THERMOSTAT,
            );*/

            this.log('thermostatLoad:', value);
            this.setCapabilityValue('thermostatLoad', value.load);
            if (value.load == null){
              value.load = settings.floor_watt;
            }
            this.setSettings({
              floor_watt: value.load,
            }).catch(err => this.error('Error setting thermostatLoad setting: ', err));

            this.registerCapabilityListener('thermostatLoad', async (value) => {
              const thermostatLoad = zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ load: value });
              this.log ('thermostatLoad set to:', thermostatLoad);
              this.setSettings({
                floor_watt: thermostatLoad,
              });
            });
            }
          } catch (error) {
            console.error('Error: Can not set the thermostatLoad', error);
            };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Max floor temp

      // Set Thermostat Maxs floor temp
      try {
        if(this.hasCapability('maxFloorTemp')) {

          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('maxFloorTemperature')
            .catch(err => this.error('Error reading max floor temp: ', err));
          this.setCapabilityValue('maxFloorTemp', value.maxFloorTemperature)
          this.log('maxFloorTemp:', value.maxFloorTemperature);
          await this.setSettings({
            maxfloortemp: value.maxFloorTemperature,
          }).catch(err => this.error('Error setting maxfloortemp setting: ', err));
      
          this.registerCapabilityListener('maxFloorTemp', async (value) => {
            try {
              const max_temp = await zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ maxFloorTemperature: value });
              await this.log ('maxFloorTemp set to:', max_temp);
              await this.setSettings({
                  maxfloortemp: max_temp,
                }).catch(err => this.error('Error setting maxfloortemp setting: ', err));
            } catch (err) {
              this.error('Error setting max floor temp; ', err);
            }
          });
        } else {
          let defaultMaxFloorTemp = 28;
          this.setCapabilityValue('maxFloorTemp', defaultMaxFloorTemp);
          await this.setSettings({
            maxfloortemp: defaultMaxFloorTemp,
          }).catch((err) =>
          this.error('Error setting maxfloortemp setting: ', err)
          );
          }
        } catch (err) {
        this.error('Error in catch all block: ', err);
        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Thermostat Regulator Time

      // Set Thermostat Regulator Time
        try {
          if(this.hasCapability('regulatorTime')) {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('regulatorTime')
          .catch(err => this.error('Error regulator time: ', err));
          this.setCapabilityValue('regulatorTime', value.regulatorTime)
          this.log('regulatorTime:', value.regulatorTime);
          this.setSettings({
          regulator_time: value.regulatorTime,
          }).catch(err => this.error('Error setting regulator_time setting: ', err));

          this.registerCapabilityListener('regulatorTime', async (value) => {
            try {
              const time = await zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ regulatorTime: value });
              await this.log ('regulatorTime set to:', time);
              await this.setSettings({
                  regulator_time: time,
                }).catch(err => this.error('Error setting regulator_time setting: ', err));
            } catch (err) {
              this.error('Error in setting regulator_time: ', err);
            }
          });
        }
        } catch (err) {
        this.error('Error: ', err);
        };


  //---------------------------------------------------------------------------------------------------------------------------------------------
  // Thermostat temperature Calibration

        // Set thermostat temperature Calibration
        if(this.hasCapability('tempCalibration')) {
          try {
          const value = await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].readAttributes('calibration');
          this.setCapabilityValue('tempCalibration', value.calibration);
          this.log('tempCalibration:', value.calibration);
          await this.setSettings({
          temp_calibration: value.calibration,
          });
          this.registerCapabilityListener('tempCalibration', async (value) => {
          try {
          const temp = await zclNode.endpoints[1].clusters.thermostat
          .writeAttributes({ calibration: value });
          this.log('tempCalibration set to:', temp);
          await this.setSettings({
          temp_calibration: temp,
          });
          } catch (err) {
          this.error('Error in setting temp calibration: ', err);
          }
          });
          } catch (err) {
          this.error('Error reading temp calibration: ', err);
          }
          };

//----------------------------------------------------------------------------------------------------------------------------------------------
// Air Temperature
// measure_temperature
        try {
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
              //let sensorMode = this.getCapabilityValue('sensorMode');
              let sensorMode = settings.sensorMode
              this.log('sensor_mode: ', sensorMode);
              this.setCapabilityValue('measure_temperature.air', temp_air);
              if (sensorMode === 'air' || sensorMode === 'supervisor_Floor'){
                this.setCapabilityValue('measure_temperature', temp_air);
                this.log('Measure temperature updated based on temp_mode: air', temp_air)
              }
            } catch (err) {
              this.error('Error in reading and setting local temperature: ', err);
            }
          });

        }
      } catch (err) {
        this.error('Error in setting up temperature measurement: ', err);
      };

//----------------------------------------------------------------------------------------------------------------------------------------------
// Floor Temperature
// measure_temperature
            try{
              if (this.hasCapability('measure_temperature.floor')) {

                await zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                  externalTemperature: {
                  minInterval: 60,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.externalTemperature', (currentTempValue) => {
                try {
                  const temp_floor = currentTempValue > -5000 ? Math.round((currentTempValue / 100) * 10) / 10 : null;
                  this.log('temperature floor: ', temp_floor);
                  //let sensorMode = this.getCapabilityValue('sensorMode');
                  let sensorMode = settings.sensorMode
                  this.log('sensor_mode: ', sensorMode);
                  this.setCapabilityValue('measure_temperature.floor', temp_floor);
                  if (sensorMode === 'floor'){
                    this.setCapabilityValue('measure_temperature', temp_floor);
                    this.log('Measure temperature updated based on temp_mode: floor', temp_floor)
                  }
                } catch (err) {
                  this.error('Error in reading and setting floor temperature: ', err);
                }
              });
              }
             } catch (err) {
                this.error('Error in setting up temperature measurement: ', err);
              };


//---------------------------------------------------------------------------------------------------------------------------------------------
// Setpoint with temperature wheel

    // Setpoint of thermostat
      if (this.hasCapability('target_temperature')) {
              this.log('target_temperature capability found');
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
                const setTemp = (((occupiedHeatingSetpoint / 100) * 10) /10);
                this.setCapabilityValue('target_temperature', setTemp);
                this.log('target_temperature', setTemp)
            });
        };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Setpoint with dim

    // Setpoint of regulator
        if (this.hasCapability('dim.regulator')) {
          this.log('dim.regulator capability found'); 
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
                const setTemp = (((occupiedHeatingSetpoint / 10000) * 10) /10);
                this.setCapabilityValue('dim.regulator', setTemp);
                this.log('Regulator %', setTemp)
            });
          };


//---------------------------------------------------------------------------------------------------------------------------------------------

// Heating status - Relay On/Off - Setting Power Load - Metering power calculation
          try {
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
              let Load = settings.floor_watt;
              switch (currentRelayState) {
                case true:
                  this.setCapabilityValue('measure_power', Load);
                  this.log('Power load: ', Load);
                  break;
                case false:
                  this.setCapabilityValue('measure_power', 0);
                  this.log('Power load: ', 0);
                  break;
              };
            });

            };
          } catch (error) {
          this.error('Error occurred: ', err);
          };

//---------------------------------------------------------------------------------------------------------------------------------------------
// night_switching
          if (this.hasCapability('night_switching')) {
            try {
              this.registerCapabilityListener('night_switching', async (value) => {
                  this.log('night_switching trying to set to:', value);
                  await zclNode.endpoints[1].clusters.thermostat.writeAttributes({ nightSwitching: value });
                  this.log('night_switching set to:', value);
              });
            } catch (err) {
            this.error('Error in registering night_switching listener: ', err);
            }
          };
            
          if (this.hasCapability('night_switching')) {
              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                nightSwitching: {
                minInterval: 0,
                maxInterval: 600,
                minChange: 1
                }
              });
            
            zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.nightSwitching', (currentState) => {
                this.log('night_switching?: ', currentState);
                this.setCapabilityValue('night_switching', currentState);
            });
          };
//---------------------------------------------------------------------------------------------------------------------------------------------
// frost_guard
        if (this.hasCapability('frost_guard')) {
          try {
            this.registerCapabilityListener('frost_guard', async (value) => {
                this.log('frost_guard trying to set to:', value);
                zclNode.endpoints[1].clusters.thermostat
                .writeAttributes({ frostGuard: value });
                this.log('frost_guard set to:', value);
          });
          } catch (err) {
            this.error('Error in registering frost guard capability listener:', err);
          }
          };
          
          if (this.hasCapability('frost_guard')) {
              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                frostGuard: {
                minInterval: 0,
                maxInterval: 600,
                minChange: 1
              }
          });

          zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.frostGuard', (currentState) => {
              this.log('frost_guard?: ', currentState);
              this.setCapabilityValue('frost_guard', currentState);
          });
            };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Childlock

// Set Childlock
          if (this.hasCapability('childLock')) {
            try {
              this.registerCapabilityListener('childLock', async (value) => {
                this.log('childLock trying to set to:', value);
                zclNode.endpoints[1].clusters.thermostat.writeAttributes({ childLock: value });
                this.log('childLock set to:', value)
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                childLock: {
                  minInterval: 0,
                  maxInterval: 600,
                  minChange: 1
                }
              });

              zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.childLock', (value) => {
                this.log('childLock attribute value?', value)
                this.setCapabilityValue('childLock', value);
              });
            } catch (error) {
              this.error('Error in childLock code:', error)
            }
          };


//---------------------------------------------------------------------------------------------------------------------------------------------
// Set power_status
                if(this.hasCapability('power_status')) {
                  try {
                      this.registerCapabilityListener('power_status', async (value) => {
                        this.log ('power_status trying to set to:', value);
                          zclNode.endpoints[1].clusters.thermostat
                            .writeAttributes({ powerStatus : value });
                            this.log ('power_status set to:', value)
                        });


                          // Configure reporting
                            zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].configureReporting({
                              powerStatus: {
                              minInterval: 0,
                              maxInterval: 600,
                              minChange: 1
                            }
                          });

                          // And listen for incoming attribute reports by binding a listener on the cluster
                          zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME].on('attr.powerStatus', (value) => {
                            this.log('power_status attribute value?', value)
                            this.setCapabilityValue('power_status', value);
                          });
                        } catch (err) {
                          this.error('Error in power status code', err)
                        }
                      };

//---------------------------------------------------------------------------------------------------------------------------------------------
// Meter Power
        if(this.hasCapability('meter_power')) {
          try {
            this.registerCapability('meter_power', CLUSTER.THERMOSTAT, {
              get: 'meanPower',
              reportParser: value => (((Math.round(Int16Array.from([value])[0])/600)/1000)+ this.getCapabilityValue('meter_power')),
              report: 'meanPower',
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
        if (value === false) {
        await this.addCapability('target_temperature');
        await this.addCapability('measure_temperature');
        await this.removeCapability('dim.regulator');
        await this.setSettings({
            regulatorMode: false
          });
        await this.log('Added target_temperature, removed dim.regulator')
      } else if (value === true) {
        await this.removeCapability('target_temperature');
        await this.removeCapability('measure_temperature');
        await this.addCapability('dim.regulator');
        await this.setSettings({
            regulatorMode: true
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
            .writeAttributes({ Load: event.newSettings.floor_watt});
            this.setCapabilityValue('thermostatLoad', event.newSettings.floor_watt);
            this.log('thermosatLoad attribute set to:', event.newSettings.floor_watt)
          };
        if (event.changedKeys.includes('maxfloortemp')) {
          this.log('Thermostat max floor temp changed: ', event.newSettings.maxfloortemp);
          this.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ maxFloorTemperature: event.newSettings.maxfloortemp});
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
          .writeAttributes({ Calibration: event.newSettings.temp_calibration});
          this.setCapabilityValue('tempCalibration', event.newSettings.temp_calibration);
          this.log('Temp calibration attribute set to:', event.newSettings.temp_calibration)
        };
        if (event.changedKeys.includes('regulatorMode')) {
          this.log('Regulator mode changed: ', event.newSettings.regulatorMode);
          let SetRegulatorMode = false;
            switch (event.newSettings.regulatorMode) {
              case false:
                SetRegulatorMode = false;
                break;
              case true:
                SetRegulatorMode = true;
                break;
            };
          this.zclNode.endpoints[1].clusters.thermostat
            .writeAttributes({ regulatorMode: SetRegulatorMode});
            switch (SetRegulatorMode) {
              case false:
                this.removeCapability('dim.regulator');
                this.addCapability('target_temperature');
                break;
              case true:
                this.addCapability('dim.regulator');
                this.removeCapability('target_temperature');
                break;
            };
            this.setCapabilityValue('regulatorMode', event.newSettings.regulatorMode);
            this.log('RegulatorMode attribute set to:', event.newSettings.regulatorMode)
          };
          if (event.changedKeys.includes('sensorMode')) {
            this.log('sensorMode changed: ', event.newSettings.sensorMode);
            let SetSensorMode = '';
            let SetSensorModeAtt = '';
              switch (event.newSettings.sensorMode) {
                case 'air':
                  SetSensorMode = 'air';
                  SetSensorModeAtt = 0;
                  break;
                case 'floor':
                  SetSensorMode = 'floor';
                  SetSensorModeAtt = 1;
                  break;
                case 'supervisor_floor':
                  SetSensorMode = 'supervisor_floor';
                  SetSensorModeAtt = 3;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ sensor: SetSensorModeAtt});
              this.setCapabilityValue('sensorMode', SetSensorMode);
              this.log('sensorMode attribute set to:', SetSensorMode)
            };
          if (event.changedKeys.includes('frost_guard')) {
            this.log('frost_guard changed: ', event.newSettings.frost_guard);
            let Setfrost_guard = false;
              switch (event.newSettings.frost_guard) {
                case true:
                  Setfrost_guard = true;
                  break;
                case false:
                  Setfrost_guard = false;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ frostGuard: Setfrost_guard});
              this.setCapabilityValue('frost_guard', Setfrost_guard);
              this.log('frost_guard attribute set to:', Setfrost_guard)
            };
          if (event.changedKeys.includes('night_switching')) {
            this.log('night_switching changed: ', event.newSettings.night_switching);
            let Setnight_switching = false;
              switch (event.newSettings.night_switching) {
                case true:
                  Setnight_switching = true;
                  break;
                case false:
                  Setnight_switching = false;
                  break;
              };
            this.zclNode.endpoints[1].clusters.thermostat
              .writeAttributes({ nightSwitching: Setnight_switching});
              this.setCapabilityValue('night_switching', Setnight_switching);
              this.log('night_switching attribute set to:', Setnight_switching)
            };
          if (event.changedKeys.includes('childLock')) {
            this.log('childLock changed: ', event.newSettings.childLock);
            let SetchildLock = 0;
              switch (event.newSettings.childLock) {
                case true:
                  SetchildLock = true;
                  break;
                case false:
                  SetchildLock = false;
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
