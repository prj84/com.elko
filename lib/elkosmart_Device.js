'use strict';


const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER, Cluster } = require('zigbee-clusters');
const ELKOSMARTUtil = require('./elkosmart_Util');
const ELKOSMARTBallastConfigurationCluster = require('./elkosmart_BallastConfigurationCluster');
const ELKOSMARTOccupancySensingCluster = require('./elkosmart_OccupancySensingCluster');
const ELKOSMARTMfcFF17Cluster = require('./elkosmart_MfcFF17Cluster');
const ELKOSMARTSpecificThermostatCluster = require('./elkosmart_SpecificThermostatCluster');
require('./elkosmart_MfcFF19Cluster');
const ELKOSMARTMfcFC04Cluster = require('./elkosmart_MfcFC04Cluster');
require('./elkosmart_OnOffCluster');
require('./elkosmart_BallastConfigurationCluster');

class ELKOSMARTDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode, node }) {
    super.onNodeInit({ zclNode, node });

    const { manifest } = this.driver;
    await this.setSettings({ zb_endpoint_descriptors: manifest.zigbee.endpoints });
    const settings = this.getSettings();
    console.log(settings);

    // Developer options
    //this.printNode();
    //this.enableDebug();

    // Capability OnOff
    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF);
    }

    // Capability Dim
    if (this.hasCapability('dim')) {
      this.registerCapability('dim', CLUSTER.LEVEL_CONTROL);

      if (this.isFirstInit()) {
        this.levelControlCluster.writeAttributes({ onLevel: 255 }).catch(err => {
          this.error('[onNodeInit]', 'Error: Failed to write attribute onLevel.', err);
        });
      }
    }

    // Capability Measure Luminance
    if (this.hasCapability('measure_luminance')) {
      this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 10,
            maxInterval: 60,
            minChange: 441,
          },
        },
      });
    }

    // Capability Alarm Motion
    if (this.hasCapability('alarm_motion')) {
      this.registerCapability('alarm_motion', CLUSTER.OCCUPANCY_SENSING, { reportParser: value => value.occupied });
    }

    // Capability Measure Power
    if (this.hasCapability('measure_power')) {
      if (Object.keys(await this.electricalMeasurementCluster.readAttributes('activePower')).length > 0) {
        if (typeof this.activePowerFactor !== 'number') {
          await this.electricalMeasurementCluster.readAttributes('acPowerMultiplier', 'acPowerDivisor').catch(err => {
            this.error('[onNodeInit]', 'Failed to read attributes acPowerMultiplier & acPowerDivisor.', err);
          }).then((acPowerMultiplier, acPowerDivisor) => {
            this.activePowerFactor = acPowerMultiplier / acPowerDivisor;
          });
        }

        const clusterCapabilityConfiguration = {
          reportOpts: {
            configureAttributeReporting: {
              minInterval: 5,
              maxInterval: 900,
              minChange: 1,
            },
          },
        };

        this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, clusterCapabilityConfiguration);
      } else if (Object.keys(await this.meteringCluster.readAttributes('instantaneousDemand')).length > 0) {
        if (typeof this.meteringFactor !== 'number') {
          await this.meteringCluster.readAttributes('multiplier', 'divisor').then(({ multiplier, divisor }) => {
            this.meteringFactor = multiplier / divisor;
          }).catch(err => {
            this.error('[onNodeInit]', 'Failed to read attributes acPowerMultiplier & acPowerDivisor.', err);
          });
        }

        const clusterCapabilityConfiguration = {
          get: 'instantaneousDemand',
          getOpts: {
            getOnStart: true,
          },
          report: 'instantaneousDemand',
          reportOpts: {
            configureAttributeReporting: {
              minInterval: 5,
              maxInterval: 900,
              minChange: 100,
            },
          },
          reportParser(value) {
            const meteringFactor = this.meteringFactor || 0.001;
            if (value < 0) return null;
            return value * meteringFactor;
          },
        };

        this.registerCapability('measure_power', CLUSTER.METERING, clusterCapabilityConfiguration);
      }
    }

    // Capability Measure Voltage
    if (this.hasCapability('measure_voltage')) {
      if (typeof this.acVoltageFactor !== 'number') {
        await this.electricalMeasurementCluster.readAttributes('acVoltageMultiplier', 'acVoltageDivisor').then(({ acVoltageMultiplier, acVoltageDivisor }) => {
          this.acVoltageFactor = acVoltageMultiplier / acVoltageDivisor;
        }).catch(err => {
          this.error('[onNodeInit]', 'Failed to read attributes acVoltageFactor & acVoltageDivisor.', err);
        });
      }

      const clusterCapabilityConfiguration = {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 5,
            maxInterval: 900,
            minChange: 2,
          },
        },
      };

      this.registerCapability('measure_voltage', CLUSTER.ELECTRICAL_MEASUREMENT, clusterCapabilityConfiguration);
    }

    // Capability Measure Current
    if (this.hasCapability('measure_current')) {
      if (typeof this.acCurrentFactor !== 'number') {
        await this.electricalMeasurementCluster.readAttributes('acCurrentMultiplier', 'acCurrentDivisor').then(({ acCurrentMultiplier, acCurrentDivisor }) => {
          this.acCurrentFactor = acCurrentMultiplier / acCurrentDivisor;
        }).catch(err => {
          this.error('[onNodeInit]', 'Failed to read attributes acCurrentMultiplier & acCurrentDivisor.', err);
        });
      }

      const clusterCapabilityConfiguration = {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 30,
            maxInterval: 900,
            minChange: 1,
          },
        },
      };

      this.registerCapability('measure_current', CLUSTER.ELECTRICAL_MEASUREMENT, clusterCapabilityConfiguration);
    }

    // Capability Meter Power
    if (this.hasCapability('meter_power')) {
      if (typeof this.meteringFactor !== 'number') {
        await this.meteringCluster.readAttributes('multiplier', 'divisor').then(({ multiplier, divisor }) => {
          this.meteringFactor = multiplier / divisor;
        }).catch(err => {
          this.error('[onNodeInit]', 'Failed to read attributes acPowerMultiplier & acPowerDivisor.', err);
        });
      }

      const clusterCapabilityConfiguration = {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 30,
            maxInterval: 900,
            minChange: 1,
          },
        },
      };

      this.registerCapability('meter_power', CLUSTER.METERING, clusterCapabilityConfiguration);
    }

    // Capability Alarm_battery
    if (this.hasCapability('alarm_battery')) {
    this.batteryThreshold = 20;
    this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
          reportOpts: {
            configureAttributeReporting: {
              minInterval: 6000, // No minimum reporting interval
              maxInterval: 60000, // Maximally every ~24 hours
              minChange: 2, // Report when value changed by 2%
            },
          },
        });
    }

    // Capability measure_battery
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
    }

    // Capability measure_temperature
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
    }

    // Capability measure_temperature
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
    }

    this.log('Driver has been initiated');
  }

  get onOffCluster() {
    const onOffClusterEndpoint = this.getClusterEndpoint(CLUSTER.ON_OFF);
    if (onOffClusterEndpoint === null) throw new Error('MISSING_ON_OFF_CLUSTER');
    return this.zclNode.endpoints[onOffClusterEndpoint].clusters.onOff;
  }

  get meteringCluster() {
    const meteringClusterEndpoint = this.getClusterEndpoint(CLUSTER.METERING);
    if (meteringClusterEndpoint === null) throw new Error('MISSING_METERING_CLUSTER');
    return this.zclNode.endpoints[meteringClusterEndpoint].clusters.metering;
  }

  get electricalMeasurementCluster() {
    const electricalMeasurementClusterEndpoint = this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT);
    if (electricalMeasurementClusterEndpoint === null) throw new Error('MISSING_ELECTRICAL_MEASUREMENT_CLUSTER');
    return this.zclNode.endpoints[electricalMeasurementClusterEndpoint].clusters.electricalMeasurement;
  }

  get levelControlCluster() {
    const levelControlClusterEndpoint = this.getClusterEndpoint(CLUSTER.LEVEL_CONTROL);
    if (levelControlClusterEndpoint === null) throw new Error('MISSING_LEVEL_CONTROL_CLUSTER');
    return this.zclNode.endpoints[levelControlClusterEndpoint].clusters.levelControl;
  }

  get ballastConfigurationCluster() {
    const ballastConfigurationClusterEndpoint = this.getClusterEndpoint(CLUSTER.BALLAST_CONFIGURATION);
    if (ballastConfigurationClusterEndpoint === null) throw new Error('MISSING_BALLAST_CONFIGURATION_CLUSTER');
    return this.zclNode.endpoints[ballastConfigurationClusterEndpoint].clusters.ballastConfiguration;
  }

  get occupancySensingCluster() {
    const occupancySensingClusterEndpoint = this.getClusterEndpoint(CLUSTER.OCCUPANCY_SENSING);
    if (occupancySensingClusterEndpoint === null) throw new Error('MISSING_OCCUPANCY_SENSING_CLUSTER');
    return this.zclNode.endpoints[occupancySensingClusterEndpoint].clusters.occupancySensing;
  }

  get temperaturemeasurementCluster() {
    const temperaturemeasurementClusterEndpoint = this.getClusterEndpoint(CLUSTER.TEMPERATURE_MEASUREMENT);
    if (temperaturemeasurementClusterEndpoint === null) throw new Error('MISSING_TEMPERATURE_MEASUREMENT_CLUSTER');
    return this.zclNode.endpoints[temperaturemeasurementClusterEndpoint].clusters.temperaturemeasuremnt;
  }

  get relativehumiditymeasuremntCluster() {
    const relativehumiditymeasuremntClusterEndpoint = this.getClusterEndpoint(CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT);
    if (relativehumiditymeasuremntClusterEndpoint === null) throw new Error('MISSING_RELATIVE_HUMIDITY_MEASUREMENT_CLUSTER');
    return this.zclNode.endpoints[relativehumiditymeasuremntClusterEndpoint].clusters.relativehumiditymeasurement;
  }

  get elkosmart_MfcFF17Cluster() {
    const elkosmart_ClusterEndpoint = this.getClusterEndpoint(Cluster.getCluster('elkosmart_MfcFF17'));
    if (elkosmart_ClusterEndpoint === null) throw new Error('MISSING_ELKOSMART_MFC_FF17_CLUSTER');
    return this.zclNode.endpoints[elkosmart_ClusterEndpoint].clusters.elkosmart_MfcFF17;
  }

  get elkosmart_MfcFF19Cluster() {
    const elkosmart_ClusterEndpoint = this.getClusterEndpoint(Cluster.getCluster('elkosmart_MfcFF19'));
    if (elkosmart_ClusterEndpoint === null) throw new Error('MISSING_ELKOSMART_MFC_FF19_CLUSTER');
    return this.zclNode.endpoints[elkosmart_ClusterEndpoint].clusters.elkosmart_MfcFF19;
  }

  get elkosmart_MfcFC04Cluster() {
    const elkosmart_ClusterEndpoint = this.getClusterEndpoint(Cluster.getCluster('elkosmart_MfcFC04'));
    if (elkosmart_ClusterEndpoint === null) throw new Error('MISSING_ELKOSMART_MFC_FC04_CLUSTER');
    return this.zclNode.endpoints[elkosmart_ClusterEndpoint].clusters.elkosmart_MfcFC04;
  }

  hasCluster(cluster) {
    for (const endpointId of Object.keys(this.zclNode.endpoints)) {
      if (cluster.NAME in this.zclNode.endpoints[endpointId].clusters) {
        return true;
      }
    }
    return false;
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    // Level Control - onLevel
    if (changedKeys.includes('onlevelMemory') || changedKeys.includes('onlevelLevel')) {
      let _onLevel = 255;
      if (!newSettings['onlevelMemory']) {
        _onLevel = Math.round(2.555556 * (changedKeys.includes('onlevelLevel') ? newSettings['onlevelLevel'] : oldSettings['onlevelLevel']) - 1.555556); // 1-100=1-254
      }

      this.log('[onSettings]', `Writing attribute onLevel → ${_onLevel}.`);
      this.levelControlCluster.writeAttributes({ onLevel: _onLevel }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute onLevel.', err);
      });
    }

    // Ballast Configuration - minLevel
    if (changedKeys.includes('brightnessMin')) {
      const _minLevel = Math.round(6.487179 * newSettings['brightnessMin'] - 5.487179); // 1-40=1-254

      this.log('[onSettings]', `Writing attribute minLevel → ${_minLevel}.`);
      this.ballastConfigurationCluster.writeAttributes({ minLevel: _minLevel }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute minLevel.', err);
      });
    }

    // Ballast Configuration - maxLevel
    if (changedKeys.includes('brightnessMax')) {
      const _maxLevel = Math.round(6.325 * newSettings['brightnessMax'] - 378.5); // 60-100=1-254

      this.log('[onSettings]', `Writing attribute maxLevel → ${_maxLevel}.`);
      this.ballastConfigurationCluster.writeAttributes({ maxLevel: _maxLevel }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute maxLevel.', err);
      });
    }

    // Ballast Configuration - controlMode
    if (changedKeys.includes('controlMode')) {
      let _controlMode;

      if (newSettings['controlMode'] in ELKOSMARTBallastConfigurationCluster.controlMode) {
        _controlMode = ELKOSMARTBallastConfigurationCluster.controlMode[newSettings['controlMode']];
      } else {
        this.error('[onSettings]', 'Not a valid value for controlMode.');
      }

      if (typeof _controlMode !== 'undefined') {
        this.log('[onSettings]', `Writing attribute controlMode → ${_controlMode} (${newSettings['controlMode']}).`);
        this.ballastConfigurationCluster.writeAttributes({ controlMode: _controlMode }).catch(err => {
          this.error('[onSettings]', 'Failed to write attribute controlMode.', err);
        });
      }
    }

    // Ballast Configuration - wiringMode
    if (changedKeys.includes('wiringMode')) {
      let _wiringMode;

      if (newSettings['wiringMode'] in ELKOSMARTBallastConfigurationCluster.wiringMode) {
        _wiringMode = ELKOSMARTBallastConfigurationCluster.wiringMode[newSettings['wiringMode']];
      } else {
        this.error('[onSettings]', 'Not a valid value for wiringMode.');
      }

      if (typeof _wiringMode !== 'undefined') {
        this.log('[onSettings]', `Writing attribute wiringMode → ${_wiringMode} (${newSettings['wiringMode']}).`);
        this.ballastConfigurationCluster.writeAttributes({ wiringMode: _wiringMode }).catch(err => {
          this.error('[onSettings]', 'Failed to write attribute wiringMode.', err);
        });
      }
    }

    // On/Off - offTimer
    if (changedKeys.includes('offTimer')) {
      const _offTimer = newSettings['offTimer'];

      this.log('[onSettings]', `Writing attribute offTimer → ${_offTimer}.`);
      this.onOffCluster.writeAttributes({ offTimer: _offTimer }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute offTimer.', err);
      });
    }

    // On/Off - preWarning
    if (changedKeys.includes('preWarning')) {
      const _preWarning = newSettings['preWarning'];

      this.log('[onSettings]', `Writing attribute preWarning → ${_preWarning}.`);
      this.onOffCluster.writeAttributes({ preWarning: _preWarning }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute preWarning.', err);
      });
    }

    // elkosmart_MfcFC04 - Backlight Mode
    if (changedKeys.includes('backlightMode')) {
      let backlightMode;
      let elkosmart_MfcCluster;

      if (this.hasCluster(ELKOSMARTMfcFC04Cluster)) {
        elkosmart_MfcCluster = this.elkosmart_MfcFC04Cluster;
        if (newSettings['backlightMode'] in ELKOSMARTMfcFC04Cluster.BACKLIGHT_MODE) {
          backlightMode = ELKOSMARTMfcFC04Cluster.BACKLIGHT_MODE[newSettings['backlightMode']];
        } else {
          this.error('[onSettings]', 'Not a valid value for backlightMode.');
        }
      } else if (this.hasCluster(ELKOSMARTMfcFF17Cluster)) {
        elkosmart_MfcCluster = this.elkosmart_MfcFF17Cluster;
        if (newSettings['backlightMode'] in ELKOSMARTMfcFF17Cluster.BACKLIGHT_MODE) {
          backlightMode = ELKOSMARTMfcFF17Cluster.BACKLIGHT_MODE[newSettings['backlightMode']];
        } else {
          this.error('[onSettings]', 'Not a valid value for backlightMode.');
        }
      }

      if (typeof backlightMode !== 'undefined' || typeof elkosmart_MfcCluster !== 'undefined') {
        this.log('[onSettings]', `Writing attribute backlightMode → ${backlightMode} (${newSettings['backlightMode']}).`);
        elkosmart_MfcCluster.writeAttributes({ backlightMode }).catch(err => {
          this.error('[onSettings]', 'Failed to write attribute backlightMode.', err);
        });
      }
    }

    // OccupancySensing - pirOccupiedToUnoccupiedDelay
    if (changedKeys.includes('pirOccupiedToUnoccupiedDelay')) {
      const _pirOccupiedToUnoccupiedDelay = newSettings['pirOccupiedToUnoccupiedDelay'];

      this.log('[onSettings]', `Writing attribute pirOccupiedToUnoccupiedDelay → ${_pirOccupiedToUnoccupiedDelay}.`);
      this.occupancySensingCluster.writeAttributes({ pirOccupiedToUnoccupiedDelay: _pirOccupiedToUnoccupiedDelay }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute pirOccupiedToUnoccupiedDelay.', err);
      });
    }

    // OccupancySensing - pirSensitivity
    if (changedKeys.includes('pirSensitivity')) {
      let _pirSensitivity;

      if (newSettings['pirSensitivity'] in ELKOSMARTOccupancySensingCluster.PIR_SENSITIVITIES) {
        _pirSensitivity = ELKOSMARTOccupancySensingCluster.PIR_SENSITIVITIES[newSettings['pirSensitivity']];
      } else {
        this.error('[onSettings]', 'Not a valid value for pirSensitivity.');
      }

      if (typeof _pirSensitivity !== 'undefined') {
        this.log('[onSettings]', `Writing attribute pirSensitivity → ${_pirSensitivity} (${newSettings['pirSensitivity']}).`);
        this.occupancySensingCluster.writeAttributes({ pirSensitivity: _pirSensitivity }).catch(err => {
          this.error('[onSettings]', 'Failed to write attribute pirSensitivity.', err);
        });
      }
    }

    // ELKOSMARTGen2 - luxThreshold
    if (changedKeys.includes('luxThreshold')) {
      const _luxThreshold = ELKOSMARTUtil.LuxToUInt(newSettings['luxThreshold']);

      this.log('[onSettings]', `Writing attribute luxThreshold → ${_luxThreshold}.`);
      this.elkosmart_Gen2Cluster.writeAttributes({ luxThreshold: _luxThreshold }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute luxThreshold.', err);
      });
    }

    /*// ESH Termostat - childLock
    if (changedKeys.includes('childLock')) {
      const _childLock = ELKOSMARTSpecificThermostatCluster.childLock(newSettings['childLock']);

      this.log('[onSettings]', `Writing attribute childLock → ${_childLock}.`);
      this.ThermostatCluster.writeAttributes({ childLock: _childLock }).catch(err => {
        this.error('[onSettings]', 'Failed to write attribute childLock.', err);
      });
    }*/


  }

}

module.exports = ELKOSMARTDevice;
