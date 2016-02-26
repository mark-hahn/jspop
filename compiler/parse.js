
var yaml  = require('js-yaml');
var utils = require('./utils');

(_=>{
  'use strict';
  
  module.exports = (file, source) => {
    let doc;
    try { doc = yaml.load(source); }
    catch (e) { utils.fatal(`syntax (yaml): ${file}, ${e.message}`); }    
    let constIdx = 0;
    let modules  = [];
    let moduleByConstValue = {};
    
    if (!doc.modules) utils.fatal(`no modules found in file ${file}`);
    
    for (let modName in doc.modules) {
      let moduleIn = doc.modules[modName];
      let module = {name:modName, type: (moduleIn.$require ? moduleIn.$require : modName)};
      modules.unshift(module);
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
            wireName = `$const${constIdx++}`;
            constModule = {name:wireName, type: '$constant', 
                          state: constVal, pins: {out: wireName}};
            modules.push(constModule);
            moduleByConstValue[jsonConstVal] = constModule;
          }
        }
        if (wireName) {
          pins[pinName] = wireName;
        }
      }
      module.pins = pins;
    }
    return {project: doc.project, env: {modules}};
  };
  
})();