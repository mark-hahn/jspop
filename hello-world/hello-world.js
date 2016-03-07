
var Popx = require('popx');
var $http = null;
(_=>{
  'use strict';
  $http = class extends Popx {
    constructor (module) {
      super(module);
const http = require('http');
let resByReqId = {};
let reqId = 0;
switch(this.get('$op')) {
  case 'server':
    const hostname = this.get('$host') || '127.0.0.1';
    const port = this.get('$port') || 8080;
    http.createServer((req, res) => {
      resByReqId[++reqId] = res;
      this.emit('$req', null, 
          {reqId, reqUrl: req.url, reqHdrs: req.headers, reqMethod: req.method});
    }).listen(port, hostname, _=> {
      this.log(`Server running at http://${hostname}:${port}/`);
    });
    this.react('$res', (_, data, meta) => {
      let res = resByReqId[meta.reqId];
      res.writeHead(meta.resCode || 200, meta.hdrs || {'Content-Type': 'text/plain' });
      res.end(data);
    });
    break;
  default: 
    utils.fatal(`invalid $op "${this.get('$op')}" for $http module ${this.module.name}`);
}
    }
  };
})();
var $constant = null;
(_=>{
  'use strict';
  $constant = class extends Popx {
    constructor (module) {
      super(module);
let data = this.get('$data');
if(this.isPin('$in'))
  this.react('$in', (_, __, meta) => {
    this.emit('$out', data, meta);
  });
else
  this.put('$out', data);
    }
  };
})();
var $log = null;
(_=>{
  'use strict';
  $log = class extends Popx {
    constructor (module) {
      super(module);
let fs     = require('fs');
let util   = require('util');
let moment = require('moment');
let pinNames = (this.get('$allWires') ? '***' : '**');
this.react(pinNames, null, (pinName, data, meta) => {
  let line = `${moment().format().slice(0,-6).replace('T',' ')} 
              ${meta.sentFrom.pinName}(${meta.sentFrom.module}) 
              ${meta.isEvent ? 'event' : ''}
              ->
              ${meta.sentFrom.wireName}: ${util.inspect(data)}`
              .replace(/\s+/g, ' ');
  if (this.get('$console') !== false) {
    console.log(line.slice(0,100));
  }
  let path = this.get('$path');
  if (path && Popx.inNode()) fs.appendFileSync(path, line + '\n');
});
    }
  };
})();
new($http)({"name":"httpServer","type":"$http","wireByPin":{"$req":"httpReq","$res":"httpRes"},"constByPin":{"$op":"server","$port":8081}});
new($constant)({"name":"pageConstant","type":"$constant","wireByPin":{"$in":"httpReq","$out":"httpRes"},"constByPin":{"$data":"Hello World!"}});
new($log)({"name":"log","type":"$log","wireByPin":{"httpReq":"httpReq","httpRes":"httpRes"},"constByPin":{}});
