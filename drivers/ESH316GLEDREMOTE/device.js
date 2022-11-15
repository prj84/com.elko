'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/WirelessOnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/WirelessLevelControlBoundCluster');

class ESH316GLEDREMOTE extends ZigBeeDevice {

  onNodeInit({ zclNode }) {
    // This is for the raw logging of zigbee trafic. Otherwise not used.
    //const { Util } = require('homey-zigbeedriver');
    //Util.debugZigbeeClusters(true);

    //this.enableDebug();
    //this.printNode();
    this.setAvailable();
    //const settings = this.getSettings();

//---------------------
    // Bind Toggle button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onToggle: this._toggleCommandHandler.bind(this),
    }));

    // Bind dim turn button commands
    zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onStep: this._stepCommandHandler.bind(this),
    }));

	}

  _toggleCommandHandler() {
      this.triggerFlow({ id: 'ESH316GLEDREMOTE_toggle' })
      .then(() => this.log(`triggered ESH316GLEDREMOTE_toggle`))
      .catch(err => this.error('Error triggering ESH316GLEDREMOTE_toggle', err));
  }

  _stepCommandHandler({ mode, stepSize, transitionTime }) {
    if (typeof mode === 'string' && mode === 'up') {
        this.triggerFlow({ id: 'ESH316GLEDREMOTE_dim_up' })
        .then(() => this.log('ESH316GLEDREMOTE_dim_up flow was triggered', `${mode}`))
        .catch(err => this.error('Error: triggering ESH316GLEDREMOTE_dim_up flow', `${mode}`, err));
      };
    if (typeof mode === 'string' && mode === 'down') {
        this.triggerFlow({ id: 'ESH316GLEDREMOTE_dim_down' })
        .then(() => this.log('ESH316GLEDREMOTE_dim_down flow was triggered', `${mode}`))
        .catch(err => this.error('Error: triggering ESH316GLEDREMOTE_dim_down flow', `${mode}`, err));
      }
    }

}
module.exports = ESH316GLEDREMOTE;

 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] Node: 08406aaa-e7e3-4dc8-bece-1cd830dd25ca
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] - Receive when idle: false
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] - Endpoints: 1
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] -- Clusters:
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] --- basic
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] --- identify
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] --- onOff
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] --- levelControl
 //2020-08-18 09:22:57 [log] [ManagerDrivers] [ESH316GLEDREMOTE] [0] ------------------------------------------

/*
Step Up:
LevelControlBoundCluster levelControl.step { mode: 'up', stepSize: 12, transitionTime: 65535 }

Step Down:
LevelControlBoundCluster levelControl.step { mode: 'down', stepSize: 12, transitionTime: 65535 }
*/
