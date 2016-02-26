
var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var moment = require('moment');
var parse  = require('./parse');
var utils  = require('./utils');
var opts   = require('./args');

( _=> {
  "use strict";
  
  let outputFolder = opts.outputFolder || '.';
  let file = opts.args[0], source;
  try { source = fs.readFileSync(file, 'utf8'); }
  catch (e) {utils.fatal(`cannot read file ${file}`);}
  let parsedData = parse(file, source);
  let project = parsedData.project;
  project.file = file;
  project.compiled = moment().format().slice(0,-6).replace('T',' ');
  let envJSON = JSON.stringify(parsedData.env);
  let regex = new RegExp(',"','g');
  regex.lastIndex = 60;
  let env = '';
  while(regex.exec(envJSON)) {
    env += '    ' + envJSON.slice(0, regex.lastIndex-1) + "\n";
    envJSON = '"' + envJSON.slice(regex.lastIndex);
    regex.lastIndex = 70;
  }
  env += '    ' + envJSON;
  var out = `/*${util.inspect(project)}*/\n\n`;
  out += `var env = JSON.parse(\`\n${env}\`);\n`;
  var haveStdlibRequire = false;
  for (var module of parsedData.env.modules) {
    if (module.type == 'constant') {
      out += `var stdlibPath = require("popx-stdlib");\n`;
      break;
    }
  }
  out += `for (var mod of env.modules) {\n`;
  out += `  var path = (mod.type.indexOf('/') >= 0 ? mod.type : stdlibPath + mod.type);\n`;
  out += `  new(require(path))(mod);\n`;
  out += `}\n`;
  fs.writeFileSync(`${outputFolder}/${path.parse(file).name}.js`, out); 

})();
