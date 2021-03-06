/**
 * Smart Plug.
 *
 * UI element representing a smart plug with an on/off switch and
 * energy monitoring functionality.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const OnOffSwitch = require('./on-off-switch');

class SmartPlug extends OnOffSwitch {
  /**
   * SmartPlug Constructor (extends OnOffSwitch).
   *
   * @param {Object} description Thing description object.
   * @param {String} format 'svg', 'html', or 'htmlDetail'.
   */
  constructor(model, description, format) {
    super(
      model,
      description,
      format,
      {
        baseIcon: '/optimized-images/thing-icons/smart_plug.svg',
      }
    );
  }

  /**
   * Find any properties required for this view.
   */
  findProperties() {
    super.findProperties();

    this.powerProperty = null;

    // Look for properties by type first.
    for (const name in this.displayedProperties) {
      const type = this.displayedProperties[name].property['@type'];

      if (type === 'InstantaneousPowerProperty') {
        this.powerProperty = name;
        break;
      }
    }

    // If necessary, match on name.
    if (this.powerProperty === null &&
        this.displayedProperties.hasOwnProperty('instantaneousPower')) {
      this.powerProperty = 'instantaneousPower';
    }
  }

  get icon() {
    return this.element.querySelector('webthing-smart-plug-capability');
  }

  /**
   * Update the display for the provided property.
   * @param {string} name - name of the property
   * @param {*} value - value of the property
   */
  updateProperty(name, value) {
    super.updateProperty(name, value);

    if (!this.displayedProperties.hasOwnProperty(name)) {
      return;
    }

    if (name === this.powerProperty) {
      value = parseFloat(value);
      this.icon.power = value;
    }
  }

  iconView() {
    let power = '';
    if (this.powerProperty !== null) {
      power = 'data-have-power="true"';
    }

    return `
      <webthing-smart-plug-capability ${power}>
      </webthing-smart-plug-capability>`;
  }
}

module.exports = SmartPlug;
