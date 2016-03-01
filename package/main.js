
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

wireValues    = {};
reactsByWires = {};

(_=>{
  'use strict';

  module.exports = class Popx {
    constructor (module) {
      this.module        = module;
      this.pinQueues     = {};
      this.totalQueueLen = 0;
    }
    react (pinNames, reactType, cb) {
      if (pinNames === '*') {
        for (let pinName in this.module.wireByPin) this._addReact(pinName, reactType, cb);
      } else {
        let pinNameList = pinNames.split(/[\s,;:]/g);
        for (let pinName of pinNameList) {
          pinName = pinName.replace(/\s/g,'');
          if(pinName) this._addReact(pinName, reactType, cb);
        }
      }
    }
    get (pinName) {
      let constVal = this.module.constByPin[pinName];
      if (constVal !== undefined) return constVal;
      let wireName = this._getWireName(pinName, 'get');
      return wireValues[wireName];
    }
    set (pinName, val, event) {
      let wireName = this._getWireName(pinName, 'set');
      if (!event && val === wireValues[wireName]) return;
      for (let react of reactsByWires[wireName]) {
        let type = react.reactType;
        if (type === 'value' && event || type === 'event' && !event) continue;
        let other = react.module;
        let otherQueue = other.pinQueues[react.pinName];
        let sentFrom = {module: this.module.name, pinName, wireName};
        let pinQueueItem = Object.assign({}, react, {val: deepFreeze(val), event, sentFrom});
        if (!event) {
          wireValues[wireName] = deepFreeze(val);
          for (let i=0; i < otherQueue.length; i++) {
            if (!otherQueue[i].event) {
              otherQueue.splice(i, 1, pinQueueItem);
              return;
            }
          }
        } 
        otherQueue.push(pinQueueItem);
        other.totalQueueLen++;
        setTimeout(other._run.bind(other), 0);
      }
    }
    emit (pinName, val) {
      this.set(pinName, val, true);
    }
    _getWireName (pinName, call) {
      let wireName = this.module.wireByPin[pinName];
      if(!wireName) utils.fatal(
          `invalid pin ${pinName} in ${call} call from module ${this.module.name}`);
      return wireName;
    }
    _addReact (pinName, reactType, cb) {
      let wireName = this._getWireName(pinName, 'react');
      if (!reactsByWires[wireName]) reactsByWires[wireName] = [];
      if (!this.pinQueues[pinName]) this.pinQueues[pinName] = [];
      reactsByWires[wireName].push({module: this, pinName, reactType, cb});
    }
    _run () {
      if (this.totalQueueLen === 0) return;
      for (let pinName in this.pinQueues) {
        let queue = this.pinQueues[pinName];
        for (let i=0; i < queue.length; i++) {
          let react = queue.shift();
          this.totalQueueLen--;
          let val = (react.event ? react.val : this.get(pinName));
          react.cb.call(this, pinName, val, react.event, react.sentFrom);
        }
      }
      if (this.totalQueueLen) setTimeout(this._run.bind(this), 0);
    }
  };
})();

