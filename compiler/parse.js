
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
      
      let pins = {};
      for (let pinName in moduleIn) {
        let pinVal = moduleIn[pinName], constVal;
        if (pinVal === null || pinVal === undefined) {
          pins[pinName] = pinName;
        } else if (Array.isArray(pinVal)) {
          if (!module.constants) module.constants = {};
          module.constants[pinName] = pinVal[0];
        } else {
          if (typeof pinVal !== 'string') utils.fatal(
              `pin value "${pinVal}" for pin ${pinName} in module ${modName} is not array or string.`);
          if (/\W/.test(pinVal)) utils.fatal(
              `wire name "${pinVal}" for pin ${pinName} in module ${modName} has invalid character`);
          pins[pinName] = pinVal;
        }
      }
      module.pins = pins;
    }
    return {project: doc.project, env: {modules}};
  };
  
})();