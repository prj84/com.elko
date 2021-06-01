'use strict';

const Homey = require('homey');

module.exports = class ELKOSMARTAPP extends Homey.App {

	async onInit() {
		//await this._initFlows();
		this.log('ELKO Smart app is running...');
		//this.log('Initiating flow cards...');
	}

	//async _initFlows() {
	 //this.homey.flow.getActionCard('set_regulator')
   //.registerRunListener((args, state) => args.device.triggerCapabilityListener('dim.regulator', args.set_regulator, {}));


	//};


}
