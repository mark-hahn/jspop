
var moment = require('moment');

(()=>{
  "use strict";
  let log;
  module.exports = {
    log: log = function () {
      let line = `${moment().format().slice(0,-6).replace('T',' ')} popx`;
      console.log(line, ...arguments);
    },
    error: msg => {
      log(`error: ${msg}`);
    },
    fatal: msg => {
      log(`fatal error: ${msg}`);
      process.exit(1);
    }
  };
})();
