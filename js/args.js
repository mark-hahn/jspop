
var opts = require('commander');

module.exports = opts
  .version('0.1.0')
  .usage('[options] <popxfile ...>')
  .option('-c, --compile', 'Compile popx file(s)')
  .option('-o, --output-folder [path]', 'Output Path')
  .parse(process.argv);

console.log({
  compile: opts.compile, 
  outPath: opts.outputFolder, 
  inFiles: opts.args
});
