
var moment = require('moment');

(()=>{
  "use strict";
  let log;
  module.exports = {
    log: log = msg => {
      let line = `${moment().format().slice(0,-6).replace('T',' ')} popx ${msg}`;
      console.log(line);
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
