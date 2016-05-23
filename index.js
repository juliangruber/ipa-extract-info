var fromFd = require('yauzl').fromFd;
var collect = require('collect-stream');
var bplistParse = require('bplist-parser').parseBuffer;
var plistParse = require('plist').parse;
var reg = require('./lib/reg');

var chrOpenChevron = 60;
var chrLowercaseB = 98;

module.exports = function(fd, cb){
  fromFd(fd, function(err, zip){
    if (err) return cb(err);

    zip.on('entry', function(entry){
      if (!reg.test(entry.fileName)) return;

      zip.openReadStream(entry, function(err, file){
        if (err) return cb(err);

        collect(file, function(err, src){
          if (err) return cb(err);

          var obj;
          try {
            if (src[0] === chrOpenChevron) {
              obj = plistParse(src.toString());
            } else if (src[0] === chrLowercaseB) {
              obj = bplistParse(src);
            } else {
              return cb(new Error('unknown plist type %s', src[0]));
            }
          } catch (err) {
            return cb(err);
          }

          cb(null, [].concat(obj), src);
        });
      });
    });
  });
}
