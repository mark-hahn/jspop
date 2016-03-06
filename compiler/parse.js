
var util  = require('util');
var yaml  = require('js-yaml');
var utils = require('./utils');

(_=>{
  'use strict';
  
  module.exports = (file, source) => {
    let doc;
    try { doc = yaml.load(source); }
    catch (e) { utils.fatal(`syntax (yaml): ${file}, ${e.message}`); }    
    // console.log(util.inspect(doc, {depth:null}));

    let modules  = [];
    if (!doc.modules) utils.fatal(`no modules found in file ${file}`);
    
    for (let modName in doc.modules) {
      let moduleIn = doc.modules[modName];
      let module = {name:modName, type: (moduleIn.$module ? moduleIn.$module[0] : '$constant')};
      delete moduleIn.$module;
      modules.push(module);
      
      let wireByPin = {};
      let constByPin = {};
      for (let pinName in moduleIn) {
        let pinVal = moduleIn[pinName];
        pinName = pinName.replace(/[><]/g, '');
        if (pinVal === null || pinVal === undefined) {
          wireByPin[pinName] = pinName;
        } else if (Array.isArray(pinVal)) {
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
    }
    return {project: doc.module, env: {modules}};
  };
  
})();