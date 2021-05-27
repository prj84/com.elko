'use strict';

const { Cluster, OnOffCluster, ZCLDataTypes } = require('zigbee-clusters');

class ELKOSMARTOnOffCluster extends OnOffCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,

      /* 0xe000: PreWarning (manufacturer specific, read/write)
             * Description:   Indicates end of the OffTimer by dimming down for x seconds.
             * Default:       0x0000
             * Range:         0x0000 -  0xffff
             */
      preWarning: {
        id: 57344,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint16,
      },

      /* 0xe001: OffTimer (OnTimeReload) (manufacturer specific, read/write)
             * Description:   Has meaning only if attribute OnTimeReload is not 0. Defines number of seconds before the light is switched off automaticaly when the user is somehow inform the light will be switched off automaticaly. Value 0 or 0xFFFF disables prewarning. For switch is is just short switch OFF and ON, for dimmer device goes to 60 percent and starts slowly dimm down. During this time user can reload the time and postpone automatic switch off for time defined in OnTimeReload.       If you enter value greater that 6553, after reboot you will read again value 6553. If you enter 0xFFFF, functionality will be disabled.
             * Default:       0x00000000
             * Range:         0x00000000 -  0xffffffff
             */
      offTimer: {
        id: 57345,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint32,
      },

      /* 0xe002: OnTimeReloadOptions (manufacturer specific, read/write)
             * Description:   bit0: 1 = OnTimeReload timer can be canceled by receiving OFF command -> light is going OFF immediately, 0 = can not be canceled, is always restarted.
             bit1-bit7: reserved.
             * Default:       0x01
             * Range:         0x00 -  0x01
             */
      OnTimeReloadOptions: {
        id: 57346,
        manufacturerId: 0x105e,
        type: ZCLDataTypes.uint32,
      },

      /* ?: onTime (manufacturer specific, read/write)
             * Description:   Defines number of  seconds before the light is switched off automaticaly.  Time is in seconds.
             * Description:   Value 0 disable the functionality.  When brightness is changed, or ON command is received, timer is always restarted.
             * Default:       0x00000000
             * Range:         0x00000000 -  0xffffffff
             */
      onTime: {
        id: 16385,
        type: ZCLDataTypes.uint16,
      },

      /* ?: OffwaitTimer (manufacturer specific, read/write)
             * Description:   The OffWaitTime attribute specifies the length of time (in 1/10ths second) that the 'off' state SHALL be guarded to prevent an on command turning the device back to its 'on' state (e.g., when leaving a room, the lights are turned off but an occupancy sensor detects the leaving person and attempts to turn the lights back on). If this attribute is set to 0x0000, the device SHALL remain in its current state. Device does not take this attribute in account and also does not change it,
             * Default:       0x00000000
             * Range:         0x00000000 -  0xffffffff
             */
      offwaitTime: {
        id: 16386,
        type: ZCLDataTypes.uint16,
      },
    };
  }

}

Cluster.addCluster(ELKOSMARTOnOffCluster);

module.exports = ELKOSMARTOnOffCluster;
