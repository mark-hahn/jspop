
var util  = require('util');
var path  = require('path');
var yaml  = require('js-yaml');
var utils = require('./utils');

(_=>{
  'use strict';
  let parse;
  let docModsCache = {};
  let TopWires = {};
  module.exports = parse = (file, parent) => {
    
    // debug
    parent = {wireByPin: {$taskList: 'parentTaskList'}, wirePath: 'parentWire'};
    
    file = path.normalize(file);
    let docModules;
    if (docModsCache[file]) docModules = docModsCache[file];
    else {
      let source;
      try { source = fs.readFileSync(file, 'utf8'); }
      catch (e) {utils.fatal(`cannot read file ${file}`);}
      let doc;
      try { doc = yaml.load(source); }
      catch (e) { utils.fatal(`syntax (yaml): ${file}, ${e.message}`); } 
      docModules = doc.modules;
      if (!docModules) utils.fatal(`no modules found in file ${file}`);
      docModsCache[file] = docModules;
    } 
    let modules  = [];
    let ioModule;
    for (let modName in docModules) {
      let moduleIn = docModules[modName];
      let module = {name: modName, type: (moduleIn.$module ? moduleIn.$module[0] : '$constant')};
      let wireByPin = {};
      let constByPin = {};
      for (let pinName in moduleIn) {
        let pinVal = moduleIn[pinName];
        pinName = pinName.replace(/[><]/g, '');
        if (Array.isArray(pinVal)) {
          if (pinVal.length > 1) { 
            if (pinVal[0] === 'file') 
                 constByPin[pinName] = fs.readFileSync(pinVal[1], 'utf8');
            else constByPin[pinName] = pinVal;
          } 
            else constByPin[pinName] = pinVal[0];
        } else {
          if (typeof pinVal !== 'string') utils.fatal(
              `pin value "${pinVal}" for pin ${pinName} in module ${modName} is not array or string.`);
          if (/[^0-9a-z><_]/i.test(pinVal)) utils.fatal(
              `wire name "${pinVal}" for pin ${pinName} in module ${modName} has invalid character`);
          wireByPin[pinName] = pinVal;
        }
      }
      module.wireByPin = wireByPin;
      module.constByPin = constByPin;
      if (module.type === '$IO') ioModule = module;
      else modules.push(module);
    }
    if (parent) {
      if (!ioModule) utils.fatal(`no $IO module found in submodule ${file}`);
      let parentByLocalWireName = {};
      for (let pinName in ioModule.wireByPin) {
          if (parent.wireByPin[pinName]) {
          let wireName = ioModule.wireByPin[pinName];
          parentByLocalWireName[wireName] = parent.wireByPin[pinName];
        }
      }
      for (let module of modules) {
        for (let pinName in module.wireByPin) {
          let wireName = module.wireByPin[pinName];
          module.wireByPin[pinName] = 
              parentByLocalWireName[wireName] || parent.wirePath + ':' + wireName;
        }
      }
    }
    utils.log(modules);
    return {modules};
  };
})();