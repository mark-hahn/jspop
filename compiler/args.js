
var commander = require('commander');

commander
  .version('0.1.0')
  .usage('[options] popxfile')
  .option('-c, --compile', 'Compile popx file(s)')
  .option('-b, --browersify', 'Run BrowserifY On Output')
  .option('-p, --browersify-path [bPath]', 'Browserify Output File')
  .option('-o, --output-folder [outFolder]', 'Output Folder Path')
  .parse(process.argv);

module.exports = commander;
