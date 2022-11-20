'use strict';

const ELKOSMARTDevice = require('./ELKOSMARTDevice');

class ELKOSMARTDeveloperDevice extends ELKLOSMART_Device {

  async onNodeInit({ zclNode, node }) {
    this.debug('[ELKOSMARTDeveloperDevice]', '[onNodeInit]', 'Developer mode detected.');
    await this.removeDeveloperCapabilities();
    await super.onNodeInit({ zclNode, node });

    await this.addDeveloperCapabilities();
  }

  async getMfcAttributes() {
    // const node = await this.homey.zigbee.getNode(this);

    this.mfcAttributes = [];

    this.handleFrame = this.node.handleFrame;
    this.node.handleFrame = (endpointId, clusterId, frame, meta) => {
      if (frame[0] === 0x0c & frame[4] === 0x16) {
        const mfc = frame.slice(1, 3).reverse().toString('hex');
        // const attributes = frame.slice(6, frame.length);
        // this.debug('endpointId:', endpointId, 'clusterId:', clusterId, 'frame:', frame, 'meta:', meta);

        if (frame.length > 6) {
          for (let i = 6; i < frame.length; i += 4) {
            const attributeId = frame.slice(i, i + 2).reverse().toString('hex');
            const attr = `Endpoint: ${endpointId}\tCluster: ${clusterId}    Mfc: 0x${mfc} Attribute: 0x${attributeId}`;
            this.mfcAttributes.push(attr);
          }
          this.debug('mfcAttributes', this.mfcAttributes);
        }
      }

      this.handleFrame(endpointId, clusterId, frame, meta);
    };

    for (const [endpointIdString, endpoint] of Object.entries(this.zclNode.endpoints)) {
      const endpointId = parseInt(endpointIdString, 10);

      for (const cluster of Object.values(endpoint.clusters)) {
        const clusterId = cluster.constructor.ID;
        this.debug('Endpoint:', endpointId, 'Cluster:', clusterId);

        await this.zclNode.sendFrame(
          endpointId, // endpoint id
          clusterId, // cluster id
          Buffer.from([
            4, // frame control
            0x5e, // Manufacturer code
            0x10, // Manufacturer code
            0, // transaction sequence number
            0x0c, // command 0x15: 'Discover Attributes Extended' 0x0C: 'Discover Attributes'
            0x00, // Start
            0x00, // Start
            0xFF, // Maximum attributes returned
          ]),
        );
      }
    }
  }

  async removeDeveloperCapabilities() {
    // const cababilities = this.getCapabilities();
    for (const cabability of this.getCapabilities()) {
      if (cabability.startsWith('button.developerMode')) {
        this.removeCapability(cabability);
      }
    }
  }

  async addDeveloperCapabilities() {
    const capability = 'button.developerModegetMfcAttributes';
    const capabilityOptions = {
      maintenanceAction: true,
      title: { en: 'Get Mfc Attributes' },
      desc: { en: "This is a developer button, it shouldn't be exposed to the public." },
    };

    await this.addCapability(capability);
    await this.setCapabilityOptions(capability, capabilityOptions);
    this.registerCapabilityListener(capability, async () => {
      this.getMfcAttributes();
    });
  }

  printMfcAttributes() {
    this.log('------------------------------------------');

    // log the entire Node
    this.log('Node:', this.getData().token);
    this.log('- Receive when idle:', this.node.receiveWhenIdle);

    Object.keys(this.zclNode.endpoints)
      .forEach(endpoint => {
        this.log('- Endpoints:', endpoint);
        this.log('-- Clusters:');
        Object.keys(this.zclNode.endpoints[endpoint].clusters)
          .forEach(key => {
            this.log('---', key);
          });
      });

    this.log('------------------------------------------');
  }

}

module.exports = ELKOSMARTDeveloperDevice;
