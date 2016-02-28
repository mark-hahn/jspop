
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
        for (let pinName in this.module.pins) addReact(pinName, cb);
      } else {
        let pinNameList = pinNames.split(/[\s,;:]/g);
        for (let pinName of pinNameList) {
          pinName = pinName.replace(/\s/g,'');
          if(pinName) addReact(pinName, cb);
        }
      }
    }
    get (pinName) {
      this.getWireName(pinName, 'get');
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
        let sentFrom = {module: this.module.name, pinName: pinName, event};
        otherQueue.push(Object.assign({}, react, {val, sentFrom}));
        other.bumpTotalQueueLen(otherQueueLen - origOtherQueueLen);
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
      for (let pinName in this.pinQueues) {
        for (let setReact of this.pinQueues[pinName]) {
          let val = setReact.val;
          let oldVal = this.pinValues[pinName];
          let sentFrom = setReact.sentFrom;
          this.pinValues[pinName] = val;
          setReact.cb.call(this, pinName, val, oldVal, sentFrom);
          this.totalQueueLen--;
        }
        this.pinQueues[pinName] = [];
      }
      return true;
    }
  };
})();

