
var fs    = require('fs-plus');
var utils = require('./utils');

(_=>{
  'use strict';
  
  module.exports = (file) => {
    var doc;
    try {
      doc = yaml.load(fs.readFileSync(file, 'utf8'));
      // console.log(doc);
    } catch (e) {
      utils.fatal(`reading popx (yaml) file: ${file}, ${e.message}`);
    }    
    return doc;
  };
  
})();