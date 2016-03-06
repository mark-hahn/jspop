
var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var moment = require('moment');
var opts   = require('./args');
var stdlib = require('popx-stdlib');
var utils  = require('./utils');

( _=> {
  "use strict";
  
  let addBoilerPlate = ((moduleName, body) => {
    return `
var ${moduleName} = null;
(_=>{
  'use strict';
  ${moduleName} = class extends Popx {
    constructor (module) {
      super(module);
${body}      
    }
  };
})();
`; });

  module.exports = (file, parsedData) => {
    let stdlibModulesIncluded = {};
    let outputFolder = opts.outputFolder || '.';
    
    var out = `/*${util.inspect(project)}*/\n\nvar Popx = require('popx');\n`;
    for (let module of parsedData.env.modules) {
      if (module.type.slice(0,1) === '$' && !stdlibModulesIncluded[module.type]) {
        out += (addBoilerPlate(module.type, stdlib(module.type)));
        stdlibModulesIncluded[module.type] = true;
      }
    }
    for (let module of parsedData.env.modules) {
      let klass = (module.type.slice(0,1) === '$' ? 
                   module.type : `require("${module.type}")`);
      out += `new(${klass})(${JSON.stringify(module)});\n`;
    }
    let outFile = `${outputFolder}/${path.parse(file).name}.js`;
    fs.writeFileSync(outFile, out.replace(/\n\s*\n/gm,'\n'));
    return  outFile;
  };
})();
