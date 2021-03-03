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
    
    // measure_power
    if (this.hasCapability('measure_power')) {
      this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
        get: 'activePower',
        getOpts: {
          getOnStart: true,
        },
        report: 'activePower',
        reportParser(value) {
          return value;
        },
        endpoint: this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT),
      });

      await this.configureAttributeReporting([
        {
          endpointId: this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT),
          cluster: CLUSTER.ELECTRICAL_MEASUREMENT,
          attributeName: 'activePower',
          minInterval: 0,
          maxInterval: 600, // once per ~5 min
          minChange: 10,
        },
      ]);
    }

    // meter_power
    if (this.hasCapability('meter_power')) {
      if (typeof this.meteringFactor !== 'number') {
        const { multiplier, divisor } = await this.zclNode.endpoints[
          this.getClusterEndpoint(CLUSTER.METERING)
        ]
          .clusters[CLUSTER.METERING.NAME]
          .readAttributes('multiplier', 'divisor');

        this.meteringFactor = multiplier / divisor;

      }
      this.registerCapability('meter_power', CLUSTER.METERING, {
        getOpts: {
          getOnStart: true,
        },
        endpoint: this.getClusterEndpoint(CLUSTER.METERING),
      });
      await this.configureAttributeReporting([
        {
          endpointId: this.getClusterEndpoint(CLUSTER.METERING),
          cluster: CLUSTER.METERING,
          attributeName: 'currentSummationDelivered',
          minInterval: 0,
          maxInterval: 600, // once per ~5 min
          minChange: 1,
        },
      ]);
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

    // Ballast Configuration - rlMode
    if (changedKeys.includes('rl_mode')) {
      let _rlMode = 0;
      if (newSettings['rl_mode']) {
        _rlMode = 3;
      }
      const result = await this.zclNode.endpoints[this.ELKOSMARTEndpoint].clusters.ballastConfiguration
        .writeAttributes({ rlMode: _rlMode });

      this.log('[SETTINGS]', '[Write Attribute]', '[Ballast Configuration - rlMode]', `[Value = ${_rlMode}] Result:\n`, result);
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
