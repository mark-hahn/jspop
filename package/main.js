
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

reactsByWires = {};

(_=>{
  'use strict';

  module.exports = class Popx {
    constructor (module) {
      this.module        = module;
      this.pinQueues     = {};
      this.pinValues     = {};
      this.totalQueueLen = 0;
    }
    getWireName (pinName, call) {
      let wireName = this.module.pins[pinName];
      if(!wireName) utils.fatal(
          `invalid pin ${pinName} in ${call} call from module ${this.module.name}`);
      return wireName;
    }
    addReact (pinName, cb) {
      let wireName = this.getWireName(pinName, 'react');
      if (!reactsByWires[wireName]) reactsByWires[wireName] = [];
      if (!this.pinQueues[pinName]) this.pinQueues[pinName] = [];
      reactsByWires[wireName].push({module: this, pinName, cb});
    }
    react (pinNames, cb) {
      if (pinNames === '*') {
        for (let pinName in this.module.pins) this.addReact(pinName, cb);
      } else {
        let pinNameList = pinNames.split(/[\s,;:]/g);
        for (let pinName of pinNameList) {
          pinName = pinName.replace(/\s/g,'');
          if(pinName) this.addReact(pinName, cb);
        }
      }
    }
    get (pinName) {
      return this.pinValues[pinName];
    }
    set (pinName, val, event) {
      let wireName = this.getWireName(pinName, 'set');
      val = deepFreeze(val);
      for (let react of reactsByWires[wireName]) {
        let other = react.module;
        let otherQueue = other.pinQueues[react.pinName];
        let otherQueueLen = otherQueue.length;
        let origOtherQueueLen = otherQueueLen;
        while (otherQueueLen && !otherQueue[otherQueueLen-1].event) {
          otherQueue.length = --otherQueueLen;
        }
        let sentFrom = {module: this.module.name, pinName: pinName, event, wireName};
        otherQueue.push(Object.assign({}, react, {val, sentFrom}));
        other.bumpTotalQueueLen(otherQueueLen + 1 - origOtherQueueLen);
      }
    }
    emit (pinName, val) {
      this.set(pinName, val, true);
    }
    bumpTotalQueueLen (bump) { 
      this.totalQueueLen += bump; 
    }
    run () {
      if (this.totalQueueLen === 0) return;
      let ran = false;
      for (let pinName in this.pinQueues) {
        let queue = this.pinQueues[pinName];
        while (queue.length) {
          let setReact = queue.shift();
          this.totalQueueLen--;
          let val = setReact.val;
          let oldVal = this.pinValues[pinName];
          let sentFrom = setReact.sentFrom;
          this.pinValues[pinName] = val;
          setReact.cb.call(this, pinName, val, oldVal, sentFrom);
          ran = true;
        }
      }
      return ran;
    }
    static runLoop (moduleInstances) {
      let numModules = moduleInstances.length;
      if (numModules === 0) return;
      let moduleRunningIdx = 0;
      let runOne = (_=> {
        let module = moduleInstances[moduleRunningIdx];
        moduleRunningIdx = (moduleRunningIdx + 1) % numModules;
        if (module.run() || moduleRunningIdx === 0) setTimeout(runOne, 0);
        else runOne();
      });
      runOne();
    }
  };
})();

