'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
require('./ELKOSMARTOnOffCluster');
require('./ELKOSMARTBallastConfigurationCluster');

// This is for the raw logging of zigbee trafic. Otherwise not used.
 const { Util } = require('homey-zigbeedriver');
 Util.debugZigbeeClusters(true);

class ELKOSMARTGenericDevice extends ZigBeeDevice {

  async onNodeInit() {
    const { manifest } = this.driver;
    await this.setSettings({ zb_endpoint_descriptors: manifest.zigbee.endpoints });

    // Developer options
     this.printNode();
     this.enableDebug();

    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF);
      this.getClusterCapabilityValue('onoff', CLUSTER.ON_OFF);
    }
    if (this.hasCapability('dim')) {
      this.registerCapability('dim', CLUSTER.LEVEL_CONTROL);
      this.getClusterCapabilityValue('dim', CLUSTER.LEVEL_CONTROL);
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

    this.log('Driver has been initiated');
  }


    if(this.hasCapability('dim')) {
      if (this.isFirstInit()) {
        this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.levelControl
          .writeAttributes({ onLevel: 255 });
      }
    }


    this.log('Driver has been initied');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    // Level Control - onLevel
    if (changedKeys.includes('onlevel_memory') || changedKeys.includes('onlevel_level')) {
      let _onLevel = 255;
      if (!newSettings['onlevel_memory']) {
        _onLevel = Math.round(2.555556 * newSettings['onlevel_level'] - 1.555556); // 1-100=1-254
      }
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.levelControl
        .writeAttributes({ onLevel: _onLevel });

      this.log('[SETTINGS]', '[Write Attribute]', '[Level Control - onLevel]', `[Value = ${_onLevel}] Result:\n`, result);
    }

    // Ballast Configuration - minLevel
    if (changedKeys.includes('brightness_min')) {
      const _minLevel = Math.round(6.487179 * newSettings['brightness_min'] - 5.487179); // 1-40=1-254
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.ballastConfiguration
        .writeAttributes({ minLevel: _minLevel });

      this.log('[SETTINGS]', '[Write Attribute]', '[Ballast Configuration - minLevel]', `[Value = ${_minLevel}] Result:\n`, result);
    }

    // Ballast Configuration - maxLevel
    if (changedKeys.includes('brightness_max')) {
      const _maxLevel = Math.round(6.325 * newSettings['brightness_max'] - 378.5); // 60-100=1-254
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.ballastConfiguration
        .writeAttributes({ maxLevel: _maxLevel });

      this.log('[SETTINGS]', '[Write Attribute]', '[Ballast Configuration - maxLevel]', `[Value = ${_maxLevel}] Result:\n`, result);
    }

    // Ballast Configuration - Control_Mode
    if (changedKeys.includes('Control_mode')) {
      var control_Mode = 0x00;
      switch (newSettings.Control_mode) {
        case 'RC_Mode':
          control_Mode = 0x01;
          break;
        case 'RL_Mode':
          control_Mode = 0x02;
          break;
        case 'RL_LED_Mode':
          control_Mode = 0x03;
          break;
      }
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.ballastConfiguration
        .writeAttributes({ ControlMode: control_Mode });

      const result2 = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.ballastConfiguration
        .readAttributes('ControlMode');


      this.log()
      this.log('[SETTINGS]', '[Write Attribute]', '[Ballast Configuration - Control_mode]', `[Value = ${control_Mode}] Result:\n`, result, result2);
    }

    // On/Off - offTimer
    if (changedKeys.includes('onoff_offtimer')) {
      const _offTimer = newSettings['onoff_offtimer'];
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.onOff
        .writeAttributes({ offTimer: _offTimer });

      this.log('[SETTINGS]', '[Write Attribute]', '[On/Off - offTimer]', `[Value = ${_offTimer}] Result:\n`, result);
    }

    // On/Off - preWarning
    if (changedKeys.includes('onoff_prewarning')) {
      const _preWarning = newSettings['onoff_prewarning'];
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.onOff
        .writeAttributes({ preWarning: _preWarning });

      this.log('[SETTINGS]', '[Write Attribute]', '[On/Off - preWarning]', `[Value = ${_preWarning}] Result:\n`, result);
    }
  }

}

module.exports = ELKOSMARTGenericDevice;
