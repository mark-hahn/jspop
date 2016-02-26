
deepFreeze = require('deep-freeze');

(_=>{
  'use strict';

  module.exports = class Popx {
    constructor (env, module) {
      this.pins = module.pins;
    }
    react (pinNames, cb) {
      console.log('react', pinNames, cb);
    }
    set (pinName, pinVal) {
      console.log('set', pinName, pinVal);
    }
    emit (pinName, pinVal) {
      console.log('emit', pinName, pinVal);
    }
  };
})();