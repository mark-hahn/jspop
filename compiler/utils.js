
var moment = require('moment');

(()=>{
  "use strict";
  let log;
  module.exports = {
    log: log = (...args)  => {
      let line = `${moment().format().slice(0,-6).replace('T',' ')} popx`;
      console.log(line, ...args);
    },
    error: msg => {
      log(`error: ${msg}`);
    },
    fatal: msg => {
      console.log(this);
      log(`fatal error: ${msg}`);
      process.exit(1);
    }
  };
})();
