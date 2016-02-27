
var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var moment = require('moment');
var opts   = require('./args');

( _=> {
  "use strict";
  module.exports = (file, parsedData) => {
    let outputFolder = opts.outputFolder || '.';
    let project = parsedData.project;
    project.file = file;
    project.compiled = moment().format().slice(0,-6).replace('T',' ');
    var out = `/*${util.inspect(project)}*/\n\n`;
    // let envJSON = JSON.stringify(parsedData.env);
    // let regex = new RegExp(',"','g');
    // regex.lastIndex = 60;
    // let env = '';
    // while(regex.exec(envJSON)) {
    //   env += '  ' + envJSON.slice(0, regex.lastIndex-1) + "\n";
    //   envJSON = '"' + envJSON.slice(regex.lastIndex);
    //   regex.lastIndex = 70;
    // }
    // env += '  ' + envJSON;
    // out += `var env = JSON.parse(\`\n${env}\`);\n`;
    for (let module of parsedData.env.modules) {
      if (module.type.slice(0,1) === '$') {
        out += `var stdlib = require("popx-stdlib");\n`;
        break;
      }
    }
    for (let module of parsedData.env.modules) {
      let path = `"${module.type}"`;
      if (module.type.slice(0,1) === '$') path = `stdlib(${path})`;
      out += `new(require(${path}))(${JSON.stringify(module)});\n`;
    }
    // out += `for (var mod of env.modules) {\n`;
    // out += `  path = (mod.type[0] === '$' ? stdlibPath + mod.type : mode.type);\n`;
    // out += `  new(require(path))(mod);\n`;
    // out += `}\n`;
    let outFile = `${outputFolder}/${path.parse(file).name}.js`;
    fs.writeFileSync(outFile, out);
    return  outFile;
  };
})();
