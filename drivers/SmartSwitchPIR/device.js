'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { ZCLNode, CLUSTER } = require('zigbee-clusters');
const ELKOSMARTOnOffCluster = require('../../lib/ELKOSMARTOnOffCluster');


class SmartSwitchPIR extends ZigBeeDevice {

  async	onNodeInit({ zclNode }) {
      this.enableDebug();
      this.printNode();
      this.setAvailable();

      if (this.hasCapability('onoff')) {
        this.registerCapability('onoff', CLUSTER.ON_OFF);
        this.getClusterCapabilityValue('onoff', CLUSTER.ON_OFF);
      }

      await this.configureAttributeReporting([
        {
            endpointID: 1,
            cluster: CLUSTER.ON_OFF,
            attributeName: 'onOff',
            minInterval: 0,
            maxInterval: 300,
            minChange: 0,
        },
      ])

      if (this.hasCapability('measure_luminance')) {
        this.registerCapability('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT);
        this.getClusterCapabilityValue('measure_luminance', CLUSTER.ILLUMINANCE_MEASUREMENT);
      }

/*      await this.configureAttributeReporting([
        {
            endpointID: 37,
            cluster: CLUSTER.ILLUMINANCE_MEASUREMENT,
            attributeName: 'measure_luminance',
            minInterval: 0,
            maxInterval: 300,
            minChange: 0,
        },
      ])*/


      zclNode.endpoints[37].clusters[CLUSTER.ILLUMINANCE_MEASUREMENT.NAME]
      .on('attr.measuredValue', this.onLuminanceMeasuredValueAttributeReport.bind(this));


      zclNode.endpoints[37].clusters[CLUSTER.OCCUPANCY_SENSING.NAME]
      .on('attr.occupancy', this.onOccupancyAttributeReport.bind(this));

    }

    onOccupancyAttributeReport({ occupied }) {
      this.log('occupancy attribute report', occupied);

      this.setCapabilityValue('alarm_motion', occupied).catch(this.error);
    }

/*
      // Set and clear motion timeout
      const alarmMotionResetWindow = 5 //this.getSetting('hacked_alarm_motion_reset_window') ? 5 : (this.getSetting('alarm_motion_reset_window') || 300);
      // Set a timeout after which the alarm_motion capability is reset
      if (this.motionAlarmTimeout) clearTimeout(this.motionAlarmTimeout);

      this.motionAlarmTimeout = setTimeout(() => {
        this.log('manual alarm_motion reset');
        this.setCapabilityValue('alarm_motion', false).catch(this.error);
      }, alarmMotionResetWindow * 1000);
    }
*/
      /**
      * Set `measure_luminance` when a `measureValue` attribute report is received on the measure
      * luminance cluster.
      * @param {number} measuredValue
      */
      onLuminanceMeasuredValueAttributeReport(measuredValue) {
      this.log('illuminance measuredValue report', measuredValue);
      this.setCapabilityValue('measure_luminance', measuredValue).catch(this.error);
      }


  async onSettings({ oldSettings, newSettings, changedKeys }) {
    // On/Off - offTimer
    if (changedKeys.includes('onTime')) {
      const _onTime = newSettings['onTime'];
      const result = await this.zclNode.endpoints[1].clusters.onOff
        .writeAttributes({ onTime: _onTime });

      this.log('[SETTINGS]', '[Write Attribute]', '[onTime]', `[Value = ${_onTime}] Result:\n`, result);
    }

    // On/Off - preWarning
    if (changedKeys.includes('offWaitTime')) {
      const _offWaitTime = newSettings['offWaitTime'];
      const result = await this.zclNode.endpoints[1].clusters.onOff
        .writeAttributes({ offWaitTime: _offWaitTime });

      this.log('[SETTINGS]', '[Write Attribute]', '[offWaitTime]', `[Value = ${_offWaitTime}] Result:\n`, result);
    }

    // On/Off - preWarning
    if (changedKeys.includes('pirOccupiedToUnoccupiedDelay')) {
      const _pirOccupiedToUnoccupiedDelay = newSettings['pirOccupiedToUnoccupiedDelay'];
      const result = await this.zclNode.endpoints[37].clusters.occupancySensing
        .writeAttributes({ pirOccupiedToUnoccupiedDelay: _pirOccupiedToUnoccupiedDelay });

      this.log('[SETTINGS]', '[Write Attribute]', '[pirOccupiedToUnoccupiedDelay]', `[Value = ${_pirOccupiedToUnoccupiedDelay}] Result:\n`, result);
    }
  }

}


module.exports = SmartSwitchPIR;
