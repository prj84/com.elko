'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class ESHSUPERTR extends ZigBeeDevice {

  onMeshInit() {
    this.enableDebug();
    //this.printNode();
    this.setAvailable();
    const settings = this.getSettings();
    const floor_watt = settings.floor_watt;

//----------------------------------------------------------------------------------------------------------------------------------------------

    //Adds new capabilities to existing users
    this.addCapability('temp_mode');
    this.addCapability('thermostat_load');
    this.addCapability('night_mode');
    this.addCapability('frost_guard');
    this.addCapability('operating_mode');
    this.addCapability("target_temperature");
    this.addCapability("measure_temperature");
    this.addCapability("dim.regulator");
    this.addCapability('temp_calibration');
    this.addCapability('regulator_time');
    this.addCapability('date_time');
    this.addCapability('max_floor_temp');
    this.addCapability('button.reset_operating_mode');
    this.addCapability('button.reset_kwh_meter');

    this.removeCapability('display_text');

//----------------------------------------------------------------------------------------------------------------------------------------------
    //Set Thermostat Heating Cable effect
    //Write/Read heating cable effect setting
    //Code ready to write cable effect when zigbee core is fixed
    this.registerCapability('thermostat_load', 'hvacThermostat', {
    /*  set: '1025',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write('1025',
          value => value)
          .then(result => {
            this.log('Write thermostat_load: ', result);
          })
          .catch(err => {
            this.error('Error write thermostat_load: ', err);
          });
        return null;
      },*/
      get: '1025',
      reportParser: value => value,
      report: '1025',
      getOpts: {
        getOnLine: true,
        getOnStart: true
      },
    });

    /* activate this when write is ok
    this.setSettings({
        floor_watt: (this.getCapabilityValue('thermostat_load')),
    })
    .catch( this.error );
    */


  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //Set Thermostat temperature calibration
  //write/Read Thermostat temperature calibration
  // Code ready to write temperature calibration when zigbee core is fixed
    this.registerCapability('temp_calibration', 'hvacThermostat', {
  /*    set: '1047',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write('1047',
          Int8Array.from([value])[0])  //test (value)
          .then(result => {
            this.log('Write temp calibration: ', result);
          })
          .catch(err => {
            this.error('Error write temp calibration: ', err);
          });
          return null;
        },*/
        get: '1047',
        reportParser: value => value,
        report: '1047',
        getOpts: {
          getOnLine: true,
          getOnStart: true
        },
      });

      /*
      this.setSettings({
        thermostat_calibration: (this.getCapabilityValue('temp_calibration')),
      })
      .catch( this.error );
      */


//------------------------------------------------------------------------------------------------------------------------------------------------------

  //Set Regulator time
  //write/Read regulator time
  //Code ready to write regulator time when zigbee core is fixed
    this.registerCapability('regulator_time', 'hvacThermostat', {
      /*set: '1028',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write('1028',
        value)
        .then(result => {
          this.log('Write Regulator time: ', result);
        })
        .catch(err => {
          this.error('Error write Regulator time: ', err);
        });
        return null;
      },*/
      get: '1028',
      reportParser: value => value,
      report: '1028',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
      },
    });

    /*
    this.setSettings({
      regulator_time: (this.getCapabilityValue('regulator_time')),
    })
    .catch( this.error );
    */

//------------------------------------------------------------------------------------------------------------------------------------------------------
  //display_text
  //Read display_text
      this.registerCapability('display_text', 'hvacThermostat', {
      get: '1026',
      reportParser: value => Buffer.from(value, 'hex').toString('utf/8'),
      report: '1026',
      getOpts: {
        getOnLine: true,
        getOnStart: true
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------
    // Reads if Thermostat is heating or not
    //Poll i used since there is no way to set up att listemer to att 1045 without geting error
    this.registerCapability('heat', 'hvacThermostat', {
      get: '1045',
      reportParser: value => value === 1,
      report: '1045',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 10000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Read childlock status
    //Poll i used since there is no way to set up att listemer to att 1043 without geting error
    //Code ready to write regulator time when zigbee core is fixed
    this.registerCapability('childlock', 'hvacThermostat', {
     /*set: '1043',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write(0x0413,
        value => value ? 1 : 0)
        .then(res => {
          this.log('write Childlock: ', res);
        })
        .catch(err => {
          this.error('Error write Childlock: ', err);
        });
      return null;
    },*/
      get: '1043',
      reportParser: value => value === 1,
      report: '1043',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Read if Thermostat is in Regulator mode (Thermostat/Regulator) (FALSE/TRUE)
    //Poll i used since there is no way to set up att listemer to att 1029 without geting error
    this.registerCapability('operating_mode', 'hvacThermostat', {
      get: '1029',
      reportParser: value => this.onUpdateMode(value),
      report: '1029',
        getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    //Set/Read Thermostat night mode
    //Poll i used since there is no way to set up att listemer to att 1034 without geting error
    //Code ready to write night mode when zigbee core is fixed
    this.registerCapability('night_mode', 'hvacThermostat', {
      /*set: '1034',
        setParser(value) {
          this.node.endpoints[0].clusters.hvacThermostat.write('1034',
          value => value ? 1 : 0)
          .then(res => {
            this.log('Nightmode: ', res);
          })
          .catch(err => {
            this.error('Error write Nightmode: ', err);
          });
        return null;
      },*/
      get: '1034',
      reportParser: value => value === 1,
      report: '1034',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

//Set/Read Thermostat frost guard
//Poll i used since there is no way to set up att listemer to att 1035 without geting error
//Code ready to write regulator time when zigbee core is fixed
    this.registerCapability('frost_guard', 'hvacThermostat', {
    /*set: '1035',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write('1035',
        value => value ? 1 : 0)
        .then(res => {
          this.log('Nightmode: ', res);
        })
        .catch(err => {
          this.error('Error write Nightmode: ', err);
        });
        return null;
      },*/
      get: '1035',
      reportParser: value => value === 1,
      report: '1035',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    //Set/Read Max floor temp with floor guard
    //Poll i used since there is no way to set up att listemer to att 1034 without geting error
    //Code ready to write regulator time when zigbee core is fixed
    this.registerCapability('max_floor_temp', 'hvacThermostat', {
      /*set: '1044',
        setParser(value) {
          this.node.endpoints[0].clusters.hvacThermostat.write('1044',
          value => value ? 1 : 0)
          .then(res => {
            this.log('Nightmode: ', res);
          })
          .catch(err => {
            this.error('Error write Nightmode: ', err);
          });
        return null;
      },*/
      get: '1044',
      reportParser: value => value,
      report: '1044',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Set point with temperature wheel

    // Setpoint of thermostat
    this.registerCapability('target_temperature', 'hvacThermostat', {
      set: 'occupiedHeatingSetpoint',
      setParser(value) {
        this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
          Math.round(value * 100))
          .then(res => {
            this.log('write occupiedHeatingSetpoint: ', res);
          })
          .catch(err => {
            this.error('Error write occupiedHeatingSetpoint: ', err);
          });
        return null;
      },

      get: 'occupiedHeatingSetpoint',
      reportParser(value) {
        return Math.round((value / 100) * 10) / 10;
      },
      report: 'occupiedHeatingSetpoint',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
      },
    });

        // Set point with dim %
        // Setpoint of regulator
    this.registerCapability('dim.regulator', 'hvacThermostat', {
        set: 'occupiedHeatingSetpoint',
        setParser(value) {
            this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
            Math.round(value * 10000 / 10)*10)
            .then(res => {
              this.log('write occupiedHeatingSetpoint: ', res);
            })
            .catch(err => {
              this.error('Error write occupiedHeatingSetpoint: ', err);
            });
            return null;
        },

        get: 'occupiedHeatingSetpoint',
        reportParser(value) {
          return Math.round((value / 100) * 10) / 10;
        },
        report: 'occupiedHeatingSetpoint',
        getOpts: {
          getOnLine: true,
          getOnStart: true,
        },
      });

        // reportlisteners for the occupiedHeatingSetpoint
      this.registerAttrReportListener('hvacThermostat', 'occupiedHeatingSetpoint', 1, 60, 1, data => {

        if(this.getCapabilityValue("operating_mode") === 0) {
          let parsedValue = Math.round((data / 100) * 10) / 10;
          this.log('Att listener occupiedHeatingSetpoint from target_temperature: ', data, parsedValue);
          this.setCapabilityValue('target_temperature', parsedValue).catch(console.error);
        } else if (this.getCapabilityValue("operating_mode") === 1) {
          let parsedValue = (data / 10000);
          this.log('Att listener occupiedHeatingSetpoint from dim.regulator: ', data, parsedValue);
          this.setCapabilityValue('dim.regulator', parsedValue).catch(console.error);
        }
        return data;
       }, 0);

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Air Temperature
    this.registerCapability('measure_temperature.air', 'hvacThermostat', {
      get: 'localTemp',
      reportParser: value => this.updateTemperature(value, 0),
      report: 'localTemp',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Floor Temperature
    this.registerCapability('measure_temperature.floor', 'hvacThermostat', {
      get: '1033',
      reportParser: value => this.updateTemperature(value, 1),
      report: '1033',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Temperature mode
    this.registerCapability("temp_mode", "hvacThermostat", {
      get: "1027",
      reportParser: value => this.updateTempMode(value),
      report: "1027",
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 600000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

    // Power
    this.registerCapability('measure_power', 'hvacThermostat', {
      get: '1032',
      reportParser: value => this.onMeasurePowerReport(value),/*{
        const parsedValue = (Math.round(((Int16Array.from([value])[0])/(this.getCapabilityValue('thermostat_load')))*(settings.floor_watt)));
        this.log(`measure_power reportParser:  ${value} -> ${parsedValue}`);
        return parsedValue;
      },*/
      report: '1032',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 60000,
      },
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------

// Power_meter
    this.registerCapability('meter_power', 'hvacThermostat', {
      get: '1032',
      reportParser: value => this.onMeterPowerReport(value),/*{
        const parsedValue = this.getCapabilityValue('meter_power') + ((Math.round(((Int16Array.from([value])[0])/(this.getCapabilityValue('thermostat_load')))*(floor_watt)))/60/1000);
        this.log(`measure_power reportParser:  ${value} -> ${parsedValue}`);
        return parsedValue;
      },*/
      report: '1032',
      getOpts: {
        getOnLine: true,
        getOnStart: true,
        pollInterval: 60000,
      },
    });

//----------------------------------------------------------------------------------------------------------------------------------------------
    //Reset of kwh counter
    this.registerCapabilityListener('button.reset_kwh_meter', async () => {
            this.setCapabilityValue('meter_power', 0);
            return;
    });
//----------------------------------------------------------------------------------------------------------------------------------------------
    //Reset operating mode to trigger capability changes
    this.registerCapabilityListener('button.reset_operating_mode', async () => {
        this.setCapabilityValue('operating_mode', null);
        return;
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------
  }


  //If value is lower then -5000 then set null
  async updateTemperature(value, temp_mode) {
    const temperature = value > -5000 ? Math.round((value / 100) * 10) / 10 : null;
    if (this.hasCapability("temp_mode") &&
      this.hasCapability("measure_temperature") &&
      this.getCapabilityValue("temp_mode") === temp_mode) {
      this.log(`updateTemperature: temp_mode: ${temp_mode} -> temp: ${temperature}`);
      await this.setCapabilityValue('measure_temperature', temperature).catch(console.error);
    }
    return temperature;
  }

  //set measure_temperature based on sensor mode on thermostat ()
  async updateTempMode(temp_mode) {
    if (this.hasCapability("temp_mode") &&
      this.hasCapability("measure_temperature")) {
      const airTemp = this.getCapabilityValue("measure_temperature.air");
      const floorTemp = this.getCapabilityValue("measure_temperature.floor");
      if (temp_mode === 0 || temp_mode === 3) {
        this.log(`updateTempMode: temp_mode: ${temp_mode} -> air temp: ${airTemp}`);
        await this.setCapabilityValue('measure_temperature', airTemp).catch(console.error);
      } else if (temp_mode === 1) {
        this.log(`updateTempMode: temp_mode: ${temp_mode} -> floor temp: ${floorTemp}`);
        await this.setCapabilityValue('measure_temperature', floorTemp).catch(console.error);
      }
    }
    return temp_mode;
  }

//------------------------------------------------------------------------------------------------------------------------------------------------------
  //Refresh setting constant when user changes settings
  async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {

    this.log(changedKeysArr);
    this.log('newSettingsObj', newSettingsObj);
    this.log('oldSettingsObj', oldSettingsObj);
    this.log('Load test: ', changedKeysArr.includes('floor_watt'));
    // Thermostat load effect changed
    if (changedKeysArr.includes('floor_watt')) {
      this.log('Thermostat load changed: ', newSettingsObj.floor_watt);
      callback(null, true);
      var floor_watt = newSettingsObj.floor_watt;
      this.log('New floor_watt setting is: ', floor_watt)
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //Calculates reported Watt with cable effect in settings (temp. fix untill att 1025 can be set)
  async onMeasurePowerReport(value) {
    const measure_power =  Math.round((Int16Array.from([value])[0])*((this.getSetting('floor_watt'))/(this.getCapabilityValue("thermostat_load"))));
    		this.log('Measure_power_fix:', measure_power, 'floor_watt', this.getSetting('floor_watt'));
		    await this.setCapabilityValue('measure_power', measure_power).catch(console.error);
        return measure_power
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------
//Calculates reported Watt to kw/h with cable effect in settings (temp. fix untill att 1025 can be set)
  async onMeterPowerReport(value) {
    const meter_power =  ((this.getCapabilityValue("meter_power")) + (Math.round((Int16Array.from([value])[0])*((this.getSetting('floor_watt'))/(this.getCapabilityValue("thermostat_load"))))/60/1000));
    		this.log('Meter_power_fix:', meter_power, 'floor_watt', this.getSetting('floor_watt'));
		    await this.setCapabilityValue('meter_power', meter_power).catch(console.error);
        return meter_power
  }

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Defines mode and set the needed capability
  onUpdateMode(value) {
    this.setCapabilityValue('operating_mode', value);
    if (value === 0) {
      this.addCapability("target_temperature");
      this.addCapability("measure_temperature");
      this.removeCapability("dim.regulator");
      this.log('Added target_temperature, removed dim.regulator')
    } else if (value === 1) {
      this.removeCapability("target_temperature");
      this.removeCapability("measure_temperature");
      this.addCapability("dim.regulator");
      this.log('Added dim.regulator, removed target_temperature')
    }
  }

  //when settings is changed it writes new value to attribute
  //activate this when new zigbee core is released since it needs to write to undefined attributes
      /*onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {

    		this.log(changedKeysArr);
    		this.log('newSettingsObj', newSettingsObj);
    		this.log('oldSettingsObj', oldSettingsObj);
    		this.log('Load test: ', changedKeysArr.includes('floor_watt'));
    		// Thermostat load effect changed
    		if (changedKeysArr.includes('floor_watt')) {
    			this.log('Thermostat load changed: ', newSettingsObj.floor_watt);
    			callback(null, true);
    			this.node.endpoints[0].clusters.hvacThermostat.write('1025', newSettingsObj.floor_watt)
    				.then(result => {
    					this.log('1025: ', result);
    				})
    				.catch(err => {
    					this.log('could not write 1025');
    					this.log(err);
    				});
    		}
        this.log('calibration test: ', changedKeysArr.includes('thermostat_calibration'));
        if (changedKeysArr.includes('thermostat_calibration')) {
          this.log('Thermostat calibration: ', newSettingsObj.thermostat_calibration);
          callback(null, true);
          this.node.endpoints[0].clusters.hvacThermostat.write("1047", newSettingsObj.thermostat_calibration)
            .then(result => {
              this.log('1047: ', result);
            })
            .catch(err => {
              this.log('could not write 1047');
              this.log(err);
            });
        }
        this.log('Regulator time test: ', changedKeysArr.includes('regulator_time'));
        if (changedKeysArr.includes('regulator_time')) {
          this.log('Regulator time: ', newSettingsObj.regulator_time);
          callback(null, true);
          this.node.endpoints[0].clusters.hvacThermostat.write("1028", newSettingsObj.regulator_time)
            .then(result => {
              this.log('1028: ', result);
            })
            .catch(err => {
              this.log('could not write 1028');
              this.log(err);
            });
        }
    	}*/
}

module.exports = ESHSUPERTR;

//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ZigBeeDevice has been inited
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] Node: f09495b9-8b75-42b2-94a5-d0218e378abf
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Battery: false
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Endpoints: 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] -- Clusters:
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- zapp
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- genBasic
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : genBasic
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- zclVersion : 1
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- manufacturerName : ELKO
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- modelId : Super TR
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- powerSource : 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- genIdentify
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : genIdentify
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- identifyTime : 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- hvacThermostat
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1025 : 2000 		\\(encoding:21, value: (bath/entre = 1000 decimal,  gang and lekerom = 2000)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1026 : Gang 		\\(encoding:42, value: <verified sonetext as hexstring>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1027 : 0 			\\(encoding:30, value: <verified 00=luftføler, 01=gulvføler, 03=gulv vakt>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1028 : 15 					\\(encoding:20 value:0f for all termostats)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1029 : 0 					\\value:0=thermostat mode 1=regulator mode
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1030 : 1 					\\value:01=device on ??=device off)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1031 : 						\\(encoding:41 value:00 for all termostats) unhandled length warning)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1032 : 0 			\\(encoding:21 value: floating values ex: 001a, 01a9, 01dd, 0000, 0087 <- probably power consumption
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1033 : -9990		\\(encoding:29 value: <verified floor temperature sensor measurement>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1041 : 0					\\(encoding:10, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1042 : 0					\\(encoding:10, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1043 : 1			\\(encoding:10, value: <verified child lock> 00=unlocked 01=locked
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1044 : 28			\\(encoding:20, value:1c for gang/bad/entre og 1b for lekerom) <- might be max temp for gulv vakt
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1045 : 0			\\(floating encoding:10, value: <verified heating active/inactive> 00=idle 01=heating
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1046 : R					\\(encoding:41, value:520a000106010107 for both) unhandled length warning
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1047 : 20					\\(encoding:28, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1048 : 9					\\(encoding:20, value:0a for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1049 : 0					\\(encoding:20, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : hvacThermostat
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- localTemp : 2370
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- absMinHeatSetpointLimit : 5
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- absMaxHeatSetpointLimit : 50
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- occupiedCoolingSetpoint : 2600
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- occupiedHeatingSetpoint : 1500
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- ctrlSeqeOfOper : 2
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- systemMode : 1
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
