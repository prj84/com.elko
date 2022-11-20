'use strict';

class ELKOSMARTUtil {

  static LuxToUInt(value) {
    return Math.round(10000 * Math.log10(value)) + 1;
  }

  static UIntToLux(value) {
    return Math.round(10 ** ((value - 1) / 10000));
  }

}

module.exports = ELKOSMARTUtil;
