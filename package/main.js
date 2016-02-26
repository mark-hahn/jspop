
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

(_=>{
  'use strict';

  let wires = {};
  let reacts = {};
  
  let setOrEmit = (self, pinName, val, event) => {
    let wireName = self.module.pins[pinName];
    if (!wireName) utils.fatal(`invalid set pin ${pinName} in module ${self.name}`);
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
      setTimeout((_=> pinCb[1](pinCb[0], wireName, wire)), 0);
    }
  };
  
  module.exports = class Popx {
    constructor (env, name, module) {
      this.env    = env;
      this.name   = name;
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
        if(!wireName) utils.fatal(`invalid react pin ${pinName} in module ${this.name}`);
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
    
    set (pinName, val) {
      setOrEmit(this, pinName, val, false);
    }
    
    emit (pinName, val) {
      setOrEmit(this, pinName, val, true);
    }
  };
})();
