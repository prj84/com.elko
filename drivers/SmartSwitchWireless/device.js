'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/WirelessOnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/WirelessLevelControlBoundCluster');
const ELKOSMARTSwitchConfigurationCluster = require('../../lib/elkosmart_SwitchConfigurationCluster');

Cluster.addCluster(ELKOSMARTSwitchConfigurationCluster);

class SmartSwitchWireless extends ZigBeeDevice {

  onNodeInit({ zclNode }) {
    //This is for the raw logging of zigbee trafic. Otherwise not used.
    //const { Util } = require('homey-zigbeedriver');
    //Util.debugZigbeeClusters(true);

    //this.enableDebug();
    //this.printNode();
    this.setAvailable();

//---------------------
//Read switch configurations (Remote is set as 1-way switch as default)
zclNode.endpoints[21].clusters.SwitchConfiguration.readAttributes('SwitchActions');
zclNode.endpoints[22].clusters.SwitchConfiguration.readAttributes('SwitchActions');
zclNode.endpoints[23].clusters.SwitchConfiguration.readAttributes('SwitchActions');
zclNode.endpoints[24].clusters.SwitchConfiguration.readAttributes('SwitchActions');
//Write switch configuration - 2-way switch
zclNode.endpoints[21].clusters.SwitchConfiguration.writeAttributes({ SwitchActions: 1});
zclNode.endpoints[22].clusters.SwitchConfiguration.writeAttributes({ SwitchActions: 1});
zclNode.endpoints[23].clusters.SwitchConfiguration.writeAttributes({ SwitchActions: 127});
zclNode.endpoints[24].clusters.SwitchConfiguration.writeAttributes({ SwitchActions: 127});

//---------------------
// Register measure_battery capability and configure attribute reporting
this.batteryThreshold = 20;
if (this.hasCapability('alarm_battery')) {
this.registerCapability('alarm_battery', CLUSTER.POWER_CONFIGURATION, {
      reportOpts: {
        configureAttributeReporting: {
          endpointId: 21,
          minInterval: 6000, // No minimum reporting interval
          maxInterval: 60000, // Maximally every ~24 hours
          minChange: 2, // Report when value changed by 2%
        },
      },
    });
  };

// measure_battery
if (this.hasCapability('measure_battery')) {
this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
        reportOpts: {
          configureAttributeReporting: {
            endpointid: 21,
            minInterval: 6000,
            maxInterval: 60000,
            minChange: 1,
          },
        },
      });
  };
//---------------------

    // Bind On Off Command buttons
    zclNode.endpoints[21].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onsetOn: this._setOnCommandHandler21.bind(this),
      onsetOff: this._setOffCommandHandler21.bind(this),
    }));

    zclNode.endpoints[22].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onsetOn: this._setOnCommandHandler22.bind(this),
      onsetOff: this._setOffCommandHandler22.bind(this),
    }));

    // Bind levelcontroll command buttons
    zclNode.endpoints[21].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onMoveWithOnOff: this._moveWithOnOffCommandHandler21.bind(this),
      onMove: this._moveCommandHandler21.bind(this),
      onStop: this._stopCommandHandler21.bind(this),
    }));

    zclNode.endpoints[22].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onMoveWithOnOff: this._moveWithOnOffCommandHandler22.bind(this),
      onMove: this._moveCommandHandler22.bind(this),
      onStop: this._stopCommandHandler22.bind(this),
    }));

	}

  _setOnCommandHandler21() {
      this.triggerFlow({ id: 'SmartSwitchWireless_setOn_21' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOn_21`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOn_21', err));
  }

  _setOnCommandHandler22() {
      this.triggerFlow({ id: 'SmartSwitchWireless_setOn_22' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOn_22`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOn_22', err));
  }

  _setOffCommandHandler21() {
      this.triggerFlow({ id: 'SmartSwitchWireless_setOff_21' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_21`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_21', err));
  }

  _setOffCommandHandler22() {
      this.triggerFlow({ id: 'SmartSwitchWireless_setOff_22' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_22`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_22', err));
  }

  _moveWithOnOffCommandHandler21() {
      this.triggerFlow({ id: 'SmartSwitchWireless_moveWithOnOff_21' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_21`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_21', err));
  }

  _moveWithOnOffCommandHandler22() {
      this.triggerFlow({ id: 'SmartSwitchWireless_moveWithOnOff_22' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_22`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_22', err));
  }

  _moveCommandHandler21() {
      this.triggerFlow({ id: 'SmartSwitchWireless_move_21' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_21`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_21', err));
  }

  _moveCommandHandler22() {
      this.triggerFlow({ id: 'SmartSwitchWireless_move_22' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_22`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_22', err));
  }

  _stopCommandHandler21() {
      this.triggerFlow({ id: 'SmartSwitchWireless_stop_21' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_21`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_21', err));
  }

  _stopCommandHandler22() {
      this.triggerFlow({ id: 'SmartSwitchWireless_stop_22' })
      .then(() => this.log(`triggered SmartSwitchWireless_setOff_22`))
      .catch(err => this.error('Error triggering SmartSwitchWireless_setOff_22', err));
  }



}
module.exports = SmartSwitchWireless;

//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] ------------------------------------------
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] Node: eddff899-48c3-4aa0-9180-3c6eb40fee70
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] - Receive when idle: false
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] - Endpoints: 21
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] -- Clusters:
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- basic
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- powerConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- identify
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- pollControl
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- SwitchConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] - Endpoints: 22
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] -- Clusters:
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- basic
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- powerConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- identify
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- SwitchConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] - Endpoints: 23
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] -- Clusters:
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- basic
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- powerConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- identify
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- SwitchConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] - Endpoints: 24
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] -- Clusters:
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- basic
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- powerConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- identify
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] --- SwitchConfiguration
//[log] 2021-05-21 13:36:54 [ManagerDrivers] [Driver:SmartSwitchWireless] [Device:cec46053-eb9a-4b2d-9711-3875291130a2] ------------------------------------------
