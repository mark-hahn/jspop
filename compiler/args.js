
var commander = require('commander');

commander
  .version('0.1.0')
  .usage('[options] popxfile')
  .option('-c, --compile', 'Compile popx file')
  .option('-b, --browserify', 'Create Browserify Bundle')
  .option('-p, --browserify-path [browserifyPath]', 'Browserify Bundle File Path And Name')
  .option('-m, --browserify-map', 'Inlcude Inline Map In Browserify Bundle')
  .option('-o, --output-folder [outFolder]', 'Output Folder Path')
  .parse(process.argv);
  
if (commander.browersifyPath || commander['browersify-map'] ) {
  commander.browersify = true;
}

module.exports = commander;
