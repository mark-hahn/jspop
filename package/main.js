
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

(_=>{
  'use strict';

  let wires = {};
  let reacts = {};
  
  module.exports = class Popx {
    constructor (module) {
      this.module = module;
      for (let pin in module.pins) {
        let wireName = module.pins[pin];
        if (!wires[wireName]) wires[wireName] = {val: null};
      }
    }
    
    react (pinNames, cb) {
      if (pinNames === '*') {
        for (let pinName in this.module.pins)  {
          let wireName = this.module.pins[pinName];
          if (!reacts[wireName]) reacts[wireName] = [];
          reacts[wireName].push([pinName,cb]);
        }
        return;
      }
      let pinNameList = pinNames.split(/[^a-z0-9_]/g);
      for (let pinName of pinNameList) {
        if(!pinName) continue;
        let wireName = this.module.pins[pinName];
        if(!wireName) utils.fatal(`invalid react pin ${pinName} in module ${this.module.name}`);
        if (!reacts[wireName]) reacts[wireName] = [];
        reacts[wireName].push([pinName,cb]);
      }
    }
    
    get (pinName) {
      let wireName = this.module.pins[pinName];
      let wire = wires[wireName], val;
      if (wire) val = wire.val;
      return {wireName, val};
    }
    
    set (pinName, val, event) {
      let wireName = this.module.pins[pinName];
      if (!wireName) utils.fatal(`invalid set pin ${pinName} in module ${this.module.name}`);
      let wire = wires[wireName];
      if (event) {
        delete wire.changed;
        wire.event = true;
      } else {
        if (wire.val === val) return;
        delete wire.event;
        wire.changed = true;
      }
      wire.val = deepFreeze(val);
      for (let pinCb of reacts[wireName]) {
        ((pinCb) => {
          setTimeout((_=> pinCb[1](wire.val, pinCb[0], 
                                  {wireName, event, senderName:this.module.name, senderPin:pinName})), 0);
        })(pinCb);
      }
    }
    
    emit (pinName, val) {
      this.setOrEmit(pinName, val, true);
    }
  };
})();
