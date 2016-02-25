
var yaml  = require('js-yaml');
var utils = require('./utils');

(_=>{
  'use strict';
  
  module.exports = (source) => {
    let doc;
    try { doc = yaml.load(source); }
    catch (e) { utils.fatal(`popx syntax (yaml): ${file}, ${e.message}`); }    
    let modulesByWire = doc.wires || {};
    let constIdx = 0;
    let moduleByConstValue = {};
    
    if (!doc.modules)
      utils.fatal(`no modules found in file ${file}`);
            
    for (let moduleName in doc.modules) {
      let module = doc.modules[moduleName];
      let moduleFileName = (module.$module ? module.$module : moduleName);
      delete module.$module;
      let moduleState = module.$state;
      delete module.$state;
      
      let pins = [];
      for (let pin in module) {
        let pinVal = module[pin], wire, constVal;
        if (pinVal === null || pinVal === undefined) {
          wire = pin;
        } else if (typeof pinVal !== 'string') {
          constVal = pinVal;
        } else {
          let match = (/^\s*<\s+(.*)$/).exec(pinVal);
          if (match) {
            let constStr = match[1];
            try { constVal = eval(constStr); } 
            catch (e) {constVal = constStr;}
          } else {
            wire = pinVal;
          }
        }
        if (constVal) {
          let jsonConstVal = JSON.stringify(constVal);
          let constModule;
          if (moduleByConstValue[jsonConstVal]) {
            constModule = moduleByConstValue[jsonConstVal];
            wire = constModule.out;
          } else {
            wire = `__const${constIdx++}`;
            constModule = {$module: 'constant', $state: constVal, out: wire};
            moduleByConstValue[jsonConstVal] = constModule;
            doc.modules[wire] = constModule;
            modulesByWire[wire] = [constModule];
          }
        }
        if (wire) {
          if (!modulesByWire[wire]) modulesByWire[wire] = [];
          modulesByWire[wire].push(module);
          module[pin] = wire;
        }
      }
      module.$module = moduleFileName;
      if (moduleState !== undefined && moduleState !== null) 
        module.$state = moduleState;
    }
    return {appInfo: doc.app, modulesByName: doc.modules, modulesByWire};
  };
  
})();