
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

inNode        = null;
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
    static inNode () {
      if (inNode === null) {
        try {
          inNode = (Object.prototype.toString.call(global.process) === '[object process]');
        } catch (e) {inNode = false;}
      }
      return inNode;
    }
    set (pinName, value, data, isEvent) {
      let wireName = this.module.wireByPin[pinName];
      if (!wireName) return;
      if (!isEvent && value === wireValues[wireName]) return;
      value = deepFreeze(value);
      for (let react of reactsByWires[wireName]) {
        let type = react.reactType;
        if (type === 'value' && isEvent || type === 'event' && !isEvent) continue;
        let other = react.module;
        let otherQueue = other.pinQueues[react.pinName];
        data.isEvent = !!isEvent;
        data.sentFrom = {module: this.module.name, pinName, wireName}; 
        let pinQueueItem = deepFreeze(Object.assign({}, react, {value, data}));
        if (!isEvent) {
          wireValues[wireName] = value;
          for (let i = 0; i < otherQueue.length; i++) 
              if (!otherQueue[i].isEvent) otherQueue.splice(i, 1, pinQueueItem); return;
        } 
        otherQueue.push(pinQueueItem);
        other.totalQueueLen++;
        setTimeout(other._run.bind(other), 0);
      }
    }
    emit (pinName, value, data) {
      this.set(pinName, value, data, true);
    }
    get (pinName) {
      let constVal = this.module.constByPin[pinName];
      if (constVal !== undefined) return constVal;
      let wireName = this.module.wireByPin[pinName];
      if (wireName) return wireValues[wireName];
    }
    isInstancePin (pinName) {
      return (pinName[0] !== '$');
    }
    getInstancePins () {
      let iPins = [];
      for (let pinName of this.module.wireByPin) 
          if (this.isInstancePin(pinName)) iPins.push(pinName);
      return iPins; 
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
    log (...args) {
      msg = `Module ${this.module.name}: `;
      for (let arg of args) {
        if (typeof arg === 'object') msg += util.inspect(arg, {depth: null});
        else msg += arg;
      }
      console.log(msg);
    }
    _addReact (pinName, reactType, cb) {
      let wireName = this.module.wireByPin[pinName];
      if (!wireName) utils.fatal(`react call with invalid pin "${pinName}"`);
      if (!reactsByWires[wireName]) reactsByWires[wireName] = [];
      if (!this.pinQueues[pinName]) this.pinQueues[pinName] = [];
      reactsByWires[wireName].push({module: this, pinName, reactType, cb});
    }
    _run () {
      if (this.totalQueueLen === 0) return;
      for (let pinName in this.pinQueues) {
        let queue = this.pinQueues[pinName];
        let queueLen = queue.length;
        for (let i = 0; i < queueLen; i++) {
          let pinQueueItem = queue.shift();
          this.totalQueueLen--;
          let value = (pinQueueItem.isEvent ? pinQueueItem.value : this.get(pinName));
          try { pinQueueItem.cb.call(this, pinName, value, pinQueueItem.data); }
          catch (err) { 
            this.log('Exception thrown:', err.message);
            if (err.fatal) process.exit(1); 
          }
        }
      }
    }
  };
})();

