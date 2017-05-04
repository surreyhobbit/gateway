/**
 *
 * ZigBeeClassifier - Determines properties from ZigBee clusters.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */


'use strict';

var zclId = require('zcl-id');
var utils = require('../../utils');

const ZHA_PROFILE_ID = zclId.profile('HA').value;
const ZHA_PROFILE_ID_HEX = utils.hexStr(ZHA_PROFILE_ID, 4);
const CLUSTER_ID_GENONOFF = zclId.cluster('genOnOff').value;
const CLUSTER_ID_GENONOFF_HEX = utils.hexStr(CLUSTER_ID_GENONOFF, 4);

const THING_TYPE_ON_OFF_SWITCH = 'onOffSwitch';

class ZigBeeClassifier {

  constructor() {
  }

  findZhaEndpointWithInputClusterIdHex(node, clusterIdHex) {
    for (var endpointNum in node.activeEndpoints) {
      var endpoint = node.activeEndpoints[endpointNum];
      if (endpoint.profileId == ZHA_PROFILE_ID_HEX) {
        if (endpoint.inputClusters.includes(clusterIdHex)) {
          return endpointNum;
        }
      }
    }
  }

  classify(node) {
    if (!node.isCoordinator) {
      var endpointNum;
      endpointNum =
        this.findZhaEndpointWithInputClusterIdHex(node,
                                                  CLUSTER_ID_GENONOFF_HEX);
      if (endpointNum) {
        this.initOnOffSwitch(node, endpointNum);
      }
    }
    if (!node.name) {
      node.name = node.defaultName;
    }
  }

  initOnOffSwitch(node, endpointNum) {
    node.type = THING_TYPE_ON_OFF_SWITCH;
    node.properties = [{
      'name': 'on',
      'type': 'boolean',
    }];
    node.actions = [{
      'name': 'toggle',
      'description': 'Toggles On/Off',
    }];
    node.propertyMaps = { 'on': {
                            'profileId': ZHA_PROFILE_ID,
                            'endpoint': endpointNum,
                            'clusterId': CLUSTER_ID_GENONOFF,
                            'cmd': {
                              true: 'on',
                              false: 'off'
                            },
                            'attr': 'onOff'
                          },
                        };

    node.defaultName = node.id + '-' + node.type;
    node.sendFrames([
      node.makeBindFrame('on'),
      node.makeConfigReportFrame('on'),
      node.makeReadAttributeFrame('on')
    ]);
  }
}

module.exports = new ZigBeeClassifier();
