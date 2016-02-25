
var fs     = require('fs');
var util   = require('util');
var Popx   = require('popx');
var moment = require('moment');

(()=>{
  'use strict';

  class Log extends Popx {
    constructor () {
      super();
      this.react( 'console path *', (console, path, pins) => {
        console = console || true;
        for(var pinName in pins) {
          let pin = pins[pinName];
          let line = `${moment.format().slice(0,-6).replace('T',' ')} 
                      ${pin.$event ? 'event' : 'value'}
                      ${pinName}: ${util.inspect(pin.val)}`
                     .replace(/\s+/g, ' ');
          if (console) console.log(line);
          if (path) fs.appendFile(path,line);
        }
      });
    }
  }

  module.exports = new Log();
})();