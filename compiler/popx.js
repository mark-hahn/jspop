
var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var moment = require('moment');
var opts   = require('./args');
var parse  = require('./parse');
var utils  = require('./utils');

( _=> {
  "use strict";
  
  let outputFolder = opts.outputFolder || '.';
  if(opts.compile) {
    for (let file of opts.args) {
      let source = fs.readFileSync(file, 'utf8');
      let parsedData = parse(file, source);
      let appInfo = parsedData.appInfo;
      appInfo.file = file;
      appInfo.compiled = moment().format().slice(0,-6).replace('T',' ');
      let envJSON = JSON.stringify(parsedData.env);
      let env = '';
      let regex = new RegExp(',"','g');
      regex.lastIndex = 60;
      while(regex.exec(envJSON)) {
        env += '    ' + envJSON.slice(0, regex.lastIndex-1) + "\n";
        envJSON = '"' + envJSON.slice(regex.lastIndex);
        regex.lastIndex = 70;
      }
      env += '    ' + envJSON;
      let out = `
/*${util.inspect(appInfo)}*/\n
(_=>{  
  "use strict";\n`;
      out += `  let env = JSON.parse(\`\n${env}\`);\n`;
      let haveStdlibRequire = false;
      for (let moduleName in parsedData.env.modules) {
        let module = '"' + parsedData.env.modules[moduleName].module;
        module = module.replace(/^"stdlib\//, 'stdlibPath + "');
        if(!haveStdlibRequire && module.slice(0, 10) === 'stdlibPath') {
          out += `  let stdlibPath = require("popx-stdlib");\n`;
          haveStdlibRequire = true;
        }
        out += `  new(require(${module}"))(env, "${moduleName}", env.modules.${moduleName});\n`;
      }
      out += `})();\n`;
      fs.writeFileSync(`${outputFolder}/${path.parse(file).name}.js`, out); 
    }
  }
  
})();
