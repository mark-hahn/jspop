
var fs         = require('fs');
var path       = require('path');
var browserify = require('browserify');
var opts       = require('./args');
var parse      = require('./parse');
var output     = require('./output');
var utils      = require('./utils');

(_=>{
  "use strict";
  
  let file = opts.args[0];
  let parsedModules = parse(file);
  let outFile = output(file, parsedModules);
  if (opts.browserify) {
    let browserifyOpts = {};
    if (opts.browserifyMap) browserifyOpts.debug = true;
    let b = browserify(outFile,browserifyOpts);
    b.bundle( (err, buf) => {
      if(err) utils.fatal(`Browserify: ${err.message}`);
      let bundlePath = (opts.browserifyPath ? opts.browserifyPath : 'bundle.js');
      fs.writeFileSync(bundlePath, buf);
    });
  }
})();
