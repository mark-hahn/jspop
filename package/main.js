
utils      = require('../compiler/utils');
deepFreeze = require('deep-freeze');

inNode        = null;
wireValue     = {};
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
    set (pinName, data, meta, isEvent) {
      let wireName = this.module.wireByPin[pinName];
      if (!wireName) return;
      if (!isEvent && data === wireValue[wireName].data) return;
      data = deepFreeze(data);
      meta = (typeof meta === 'object' ? meta : {});
      meta.sentFrom = {module: this.module.name, pinName, wireName}; 
      meta.isEvent = !!isEvent;
      let value = {data, meta};
      reactLoop: 
      for (let react of reactsByWires[wireName]) {
        let type = react.reactType;
        if (type === 'value' && isEvent || type === 'event' && !isEvent) continue;
        let other = react.module;
        let otherQueue = other.pinQueues[react.pinName];
        if (isEvent) meta.cb = react.cb;
        else {
          wireValue[wireName] = value;
          for (value of otherQueue) if (typeof value === 'function') continue reactLoop;
          value = cb;
        }
        otherQueue.push(value);
        other.totalQueueLen++;
        setTimeout(other._run.bind(other), 0);
      }
    }
    emit (pinName, data, meta) {
      this.set(pinName, data, meta, true);
    }
    get (pinName) {
      let constVal = this.module.constByPin[pinName];
      if (constVal !== undefined) return constVal;
      let wireName = this.module.wireByPin[pinName];
      if (wireName) return wireValue[wireName];
    }
    isPin (pinName) {
      return !!this.module.wireByPin[pinName];
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
      switch (pinNames) {
        case '*':
          for (let pinName in this.module.wireByPin) this._addReact(pinName, reactType, cb);
          break;
        case '**':
          for (let wireName in wireValue)
              reactsByWires[wireName].push({module: this, pinName: '$allWires', cb});
          break;
        default:
          let pinNameList = pinNames.split(/[\s,;:]/g);
          for (let pinName of pinNameList) {
            pinName = pinName.replace(/\s/g,'');
            if(pinName) this._addReact(pinName, reactType, cb);
          }
          break;
      }
    }
    setFrozenAttr (frozenObj, sel, newVal) {
      let cloneObj = (frozenObj, depth) => {
        let clone;
        if (typeof frozenObj !== 'object') clone = frozenObj;
        else {
          clone = (Array.isArray(frozenObj) ? [] : {});
          if (sel === 'unshift' || sel === 'push') {
            for (let key in frozenObj) clone.push(frozenObj[key]);
            switch (sel) {
              case 'unshift': clone.unshift(newVal); return clone;
              case 'push':    clone.push(newVal);    return clone;
            }
          }
          let selKey = sel[depth];
          let foundSelKey = false;
          for (let key in frozenObj) {
            if (depth < sel.length && key === selKey) {
              foundSelKey = true;
              if (depth === sel.length-1) {
                if (newVal !== undefined) clone[key] = newVal;
                sel = [];
                continue;
              }
              clone[key] = cloneObj(frozenObj[key], depth+1);
            } else {
              clone[key] = frozenObj[key];
            }
          }
          if (!foundSelKey && newVal !== undefined) {
            let val = newVal;
            for (i = sel.length-1; i > depth; i--) {
              let obj = {}; 
              obj[sel[i]] = val;
              val = obj;
            }
            clone[selKey] = val;
            sel = [];
          }
        }
        return clone;
      };
      return deepFreeze(cloneObj(frozenObj, 0));
    }
    log (...args) {
      utils.log(this.module.name + ':', ...args);
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
          let entry = queue.shift();
          this.totalQueueLen--;
          let value, cb;
          if (typeof entry === 'function') {
            value =  this.get(pinName);
            cb = entry;
          } else {
            value = entry;
            cb = entry.meta.cb;
          }
          try { cb.call(this, pinName, value.data, value.meta); }
          catch (err) { 
            this.log('Exception thrown:', err.message);
            if (err.fatal && Popx.inNode()) process.exit(1); 
          }
        }
      }
    }
  };
})();

