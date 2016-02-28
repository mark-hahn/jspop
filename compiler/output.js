
var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var moment = require('moment');
var opts   = require('./args');
var stdlib = require('popx-stdlib');

( _=> {
  "use strict";
  module.exports = (file, parsedData) => {
    let stdlibModulesIncluded = {};
    let outputFolder = opts.outputFolder || '.';
    let project = parsedData.project;
    project.file = file;
    project.compiled = moment().format().slice(0,-6).replace('T',' ');
    var out = `/*${util.inspect(project)}*/\n\nvar Popx = require('popx');\n`;
    for (let module of parsedData.env.modules) {
      if (module.type.slice(0,1) === '$') {
        if (!stdlibModulesIncluded[module.type]) {
          stdlibModulesIncluded[module.type] = true;
          out += stdlib(module.type);
        }
      }
    }
    out += '\nvar mods = [];\n';
    for (let module of parsedData.env.modules) {
      let klass = (module.type.slice(0,1) === '$' ? 
                   module.type : `require("${module.type}")`);
      out += `mods.push(new(${klass})(${JSON.stringify(module)}));\n`;
    }
    out += 'Popx.runLoop(mods);\n';
    let outFile = `${outputFolder}/${path.parse(file).name}.js`;
    fs.writeFileSync(outFile, out);
    return  outFile;
  };
})();
