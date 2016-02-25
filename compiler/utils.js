
var moment = require('moment');

(()=>{
  "use strict";
  
  module.exports = {
    log: msg => {
      let line = `${moment().format().slice(0,-6).replace('T',' ')} popx ${msg}`;
      console.log(line);
    },
    error:  msg => {
      this.log(`error: ${msg}`);
    },
    fatal: msg => {
      this.log(`fatal error: ${msg}`);
      process.exit(1);
    }
  };
})();
