'use strict';

const ELKOSMARTDevice = require('../../lib/elkosmart_Device');

class ESH316GLED_Pre2019 extends ELKOSMARTDevice{

  }

module.exports = ESH316GLED_Pre2019;

//Gen 1 dimmer
//─────────────── Logging stdout & stderr ───────────────
//2018-08-11 06:58:25 [log] [ElkoApp] Elko App is running!
//2018-08-11 06:58:25 [log] [ManagerDrivers] [ESH316GLED] [0] ZigBeeDevice has been inited
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ------------------------------------------
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] Node: f8da0f82-a366-45aa-815c-e65b83a142f8
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] - Battery: false
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] - Endpoints: 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] -- Clusters:
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- zapp
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genBasic
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genBasic
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- zclVersion : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- appVersion : 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- hwVersion : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- manufacturerName : ELKO
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- modelId : ElkoDimmerZHA
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- powerSource : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- swBuildId : 0.0.19
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genIdentify
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genIdentify
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- identifyTime : 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genOnOff
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genOnOff
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- onOff : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genLevelCtrl
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genLevelCtrl
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- currentLevel : 254
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ------------------------------------------

//Gen 2 Dimmer
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ------------------------------------------
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] Node: cd7088b0-532f-4a62-9140-4c1754e25742
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] - Battery: false
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] - Endpoints: 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] -- Clusters:
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- zapp
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genBasic
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genBasic
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- zclVersion : 3
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- appVersion : 6
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- manufacturerName : ELKO
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- modelId : ElkoDimmerZHA
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- powerSource : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- swBuildId : 0.6
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genIdentify
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genIdentify
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- identifyTime : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genGroups
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genGroups
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- nameSupport : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genScenes
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genScenes
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- count : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- currentScene : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- currentGroup : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sceneValid : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- nameSupport : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genOnOff
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genOnOff
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- onOff : 0
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genLevelCtrl
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- 65533 : 1
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genLevelCtrl
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- currentLevel : 79
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] --- genOta
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- cid : genOta
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ---- sid : attrs
//2020-01-20 13:45:38 [log] [ManagerDrivers] [ESH316GLED] [7] ------------------------------------------
