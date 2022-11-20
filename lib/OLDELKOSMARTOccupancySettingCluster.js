'use strict';

const { Cluster, ZCLDataTypes, ZCLDataType } = require('zigbee-clusters');

const ATTRIBUTES = {
  AmbienceLightThreshold: { id: 0, manufacturerId: 0x105e, type: ZCLDataTypes.unit16},
  OccupancyActions: { id: 1, manufacturerId: 0x105e, type: ZCLDataTypes.enum8({
      NoCommands: 0, //No commands are sent.
      On_OnOff: 1, //Occupied state causes send ON command via OnOff cluster, onuccupied/forced off states cause send OFF command via OnOff cluster.
      On_LevelCommand: 2 //Occupied state causes send ON command via OnOff cluster, unoccupied/force off state cause send move to level command vith level defined in UnoccupiedLevel attribute via  level cluster. If UnoccupiedLevel attribute is 0, instead of move to level OFF command via OnOff cluster is sent.
    }),
  },
  //Level value 0-254 used in command sent according OccupancyActions.Is used after reboot, runtime value can be changed throught runtime attribute UnoccupiedLevel. If you change this attribute, also UnoccupiedLevel attribute is changed.
  UnoccupiedLevelDflt: { id: 2, manufacturerId: 0x105e, type: ZCLDataTypes.uint8},
  //After reboot value from UnoccupiedLevelDflt attribute is taken as value for this attribute.
  //Runtime value. Level value 0-254 used in command sent according OccupancyActions.
  UnoccupiedLevel: { id: 3, manufacturerId: 0x105e, type: ZCLDataTypes.uint8}
};

const COMMANDS = {
};

class ELKOSMARTOccupancySettingCluster extends Cluster {

  static get ID() {
    return 65305; // The cluster id
  }

  static get NAME() {
    return 'OccupancySetting'; // The cluster name
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES; // Returns the defined attributes
  }

  static get COMMANDS() {
    return COMMANDS; // Returns the defined commands
  }

}

Cluster.addCluster(ELKOSMARTOccupancySettingCluster);

module.exports = ELKOSMARTOccupancySettingCluster;
