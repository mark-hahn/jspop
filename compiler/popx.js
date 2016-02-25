
var fs    = require('fs');
var util  = require('util');
var opts  = require('./args');
var parse = require('./parse');
var utils = require('./utils');

( _=> {
  "use strict";
  
  for (let file of opts.args) {
    let source = fs.readFileSync(file, 'utf8');
    let parsedData = parse(source);
    let appInfo = parsedData.appInfo;
    let modulesByName = parsedData.modulesByName;
    let modulesByWire = parsedData.modulesByWire;
    utils.log(util.inspect({file, appInfo, modulesByName, modulesByWire}));
  }
  
})();
