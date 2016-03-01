
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
      let module = {name:modName, type: (moduleIn.$module ? moduleIn.$module : modName)};
      delete moduleIn.$module;
      modules.push(module);
      
      let wireByPin = {};
      let constByPin = {};
      for (let pinName in moduleIn) {
        let pinVal = moduleIn[pinName];
        if (pinVal === null || pinVal === undefined) {
          wireByPin[pinName] = pinName;
        } else if (Array.isArray(pinVal)) {
          constByPin[pinName] = pinVal[0];
        } else {
          if (typeof pinVal !== 'string') utils.fatal(
              `pin value "${pinVal}" for pin ${pinName} in module ${modName} is not array or string.`);
          if (/\W/.test(pinVal)) utils.fatal(
              `wire name "${pinVal}" for pin ${pinName} in module ${modName} has invalid character`);
          wireByPin[pinName] = pinVal;
        }
      }
      module.wireByPin = wireByPin;
      module.constByPin = constByPin;
    }
    return {project: doc.project, env: {modules}};
  };
  
})();