
var fs         = require('fs');
var browserify = require('browserify');
var stdlibPath = require('popx-stdlib');
var opts       = require('./args');
var parse      = require('./parse');
var output     = require('./output');
var utils      = require('./utils');

(_=>{
  "use strict";
  
  let file = opts.args[0], source;
  try { source = fs.readFileSync(file, 'utf8'); }
  catch (e) {utils.fatal(`cannot read file ${file}`);}
  let parsedData = parse(file, source);
  let outFile = output(file, parsedData);
  if (opts.browserify) {
    let stdlibPaths = [];
    for (let module of parsedData.env.modules) {
      if (module.type[0] === '$') stdlibPaths.push(stdlibPath + module.type);
    }
    let b = browserify(outFile);
    b.require(stdlibPaths);
    b.bundle( (err, buf) => {
      if(err) utils.fatal(`Browserify: ${err.message}`);
      let bundlePath = (opts.browserifyPath ? opts.browserifyPath : 'bundle.js');
      fs.writeFileSync(bundlePath, buf);
    });
  }
})();
