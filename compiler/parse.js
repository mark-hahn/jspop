
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
            else if (pinName !== '$module') constByPin[pinName] = pinVal[0];
        } else {
          if (typeof pinVal !== 'string') utils.fatal(
              `pin value "${pinVal}" for pin ${pinName} in module ${modName} is not array or string.`);
          let wireName = pinVal.replace(/[><]/g, '');
          if (/[^0-9a-z_]/i.test(wireName)) utils.fatal(
              `wire name "${pinVal}" for pin ${pinName} in module ${modName} has invalid character`);
          wireByPin[pinName] = wireName;
        }
      }
      module.wireByPin  = wireByPin;
      module.constByPin = constByPin;
      
      let subModFile;
      let stdLib = (module.name[0] === '$');
      if (module.type === '$IO') ioModule = module;
      else if (!stdLib && module.type.slice(-5).toLowerCase() === '.popx')
          subModFile = module.type;
      else if (!stdLib && fs.existsSync(module.type + '.popx'))
          subModFile = module.type + '.popx';
      if (subModFile) {
        let wirePath = (parent ? parent.wirePath + ':' : '') + module.name;
        let subMods = parse(subModFile, {wireByPin, wirePath});
        modules = modules.concat(subMods);
      } else if (module.type !== '$IO')
          modules.push(module);
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
    // utils.log(modules);
    return modules;
  };
})();
