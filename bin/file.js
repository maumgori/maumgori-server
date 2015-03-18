var multiparty = require('multiparty');   //파일 업로드를 위한 패키지.
var fs = require('fs');

// 마음고리 홈 디렉토리.
var $MAUM_HOME = require('path').join(__dirname, '..');

// 이미지 파일 업로드.
// http://stackoverflow.com/questions/6926016/nodejs-saving-a-base64-encoded-image-to-disk : 참고.
exports.saveProfileImg = function (req, res) {
  var bodyVal = req.body;
  //console.log('%j', bodyVal);
  var fileName = $MAUM_HOME+'/public/images/profile/'+bodyVal.id+'.png';
  var base64Data = bodyVal.photo.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(fileName, base64Data, 'base64', function(err) {
    if(err) throw err;
    res.send('/images/profile/'+bodyVal.id+'.png');
  });
}

// https://github.com/andrewrk/node-multiparty/ 잘 참고할것.
