var fs = require('fs');
str = fs.createReadStream("/dev/disk0");
var on = false;
var buffer = 0;
str.on('data', function(chunk) {
var data = chunk.toString();
if (data.match(/\$i\.from/)) {on = true;}
if (on) {console.log(data);
buffer += data.length;}
if (buffer > 50000) {buffer = 0; on = false;}
});
str.on('end', process.exit);
