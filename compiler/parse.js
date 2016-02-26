
var yaml  = require('js-yaml');
var utils = require('./utils');

(_=>{
  'use strict';
  
  module.exports = (file, source) => {
    let doc;
    try { doc = yaml.load(source); }
    catch (e) { utils.fatal(`syntax (yaml): ${file}, ${e.message}`); }    
    let constIdx = 0;
    let modules  = {};
    let moduleByConstValue = {};
    
    if (!doc.modules) utils.fatal(`no modules found in file ${file}`);
    
    for (let moduleName in doc.modules) {
      let moduleIn = doc.modules[moduleName];
      let module = modules[moduleName] = 
         {module: (moduleIn.$module ? moduleIn.$module : moduleName)};
      if (moduleIn.$state) module.state = moduleIn.$state;
      
      let pins = {};
      for (let pinName in moduleIn) {
        if(pinName.slice(0,1) === '$') continue;
        let pinVal = moduleIn[pinName], wireName, constVal;
        if (pinVal === null || pinVal === undefined) {
          wireName = pinName;
        } else if (typeof pinVal !== 'string') {
          constVal = pinVal;
        } else {
          let match = (/^\s*<\s+(.*)$/).exec(pinVal);
          if (match) {
            let constStr = match[1];
            try { constVal = eval(constStr); } 
            catch (e) {constVal = constStr;}
          } else {
            wireName = pinVal;
          }
        }
        if (constVal !== undefined && constVal !== null) {
          let jsonConstVal = JSON.stringify(constVal);
          let constModule;
          if (moduleByConstValue[jsonConstVal]) {
            constModule = moduleByConstValue[jsonConstVal];
            wireName = constModule.pins.out;
          } else {
            wireName = `_const${constIdx++}`;
            constModule = {module: 'stdlib/constant', state: constVal, pins: {out: wireName}};
            moduleByConstValue[jsonConstVal] = constModule;
          }
        }
        if (wireName) {
          pins[pinName] = wireName;
        }
      }
      module.pins = pins;
    }
    for (let constValue in moduleByConstValue) {
      let constModule = moduleByConstValue[constValue];
      modules[constModule.pins.out] = constModule;
    }
    return {appInfo: doc.app, env: {modules}};
  };
  
})();