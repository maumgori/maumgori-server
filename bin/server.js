var express = require('express');
var stylus = require('stylus');
var bodyParser = require('body-parser');  //데이터 입력을 위한 패키지.
var multiparty = require('multiparty');   //파일 업로드를 위한 패키지.
var YAML = require('yamljs');
var http = require('http');
var fs = require('fs');
var es = require('./es.js');

// 마음고리 홈 디렉토리.
var $MAUM_HOME = require('path').join(__dirname, '..');
//마음고리 환경설정 정보가 담긴 객체.
var config_obj = YAML.load($MAUM_HOME+'/config/maum.yml');
// console.log("%j",config_obj);

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path);
}

// server/views 경로의 파일에 jade 엔진 적용.
app.set('views', $MAUM_HOME + '/server/views');
app.set('view engine', 'jade');
// 스타일러스 파일 컴파일.
app.use(stylus.middleware(
  {
    src: $MAUM_HOME + '/public',
    compile: compile
  }
));
app.use(express.static($MAUM_HOME + '/public'));
//body-paerser 미들웨어 적용.
app.use(bodyParser.json())

// 회원정보 입력.
app.post('/signin', function(req, res){
  es.insertUser(req, res);
});

// 회원 가입 시 아이디 체크.
app.get('/users/:id', function(req, res){
  es.checkId(req,res);
});

// 이미지 파일 업로드.
// https://github.com/andrewrk/node-multiparty/ 잘 참고할것.
app.post('/fileupload/photo', function(req, res) {
  var form = new multiparty.Form();
  var size = '';
  var fileName = '';
  // 전체. 파일 아닌 경우도.
  form.on('part', function(part){
      if(!part.filename) return;
      size = part.byteCount;
      fileName = part.filename;
  });
  // 파일인 경우.
  form.on('file', function(name,file){
    /*
    console.log(file.path);
    console.log('file.fieldName: ' + file.fieldName);
    console.log('file.originalFilename: ' + file.originalFilename);
    console.log('file.size: ' + file.size);
    console.log('file.path: ' + file.path);
    console.log('filename: ' + fileName);
    console.log('fileSize: '+ size);
    */
    if(!fileName)
      fileName = file.originalFilename;
    var tmp_path = file.path;   //이 함수가 실행될 때 이미 이미지는 업로드 되어 있음. 저장된 임시 디렉토리.
    var target_path = $MAUM_HOME+'/public/images/profile/'+fileName;
    //임시 디렉토리에서 target_path로 이미지 무브.
    fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      fs.unlink(tmp_path, function() {
        if (err) throw err;
        res.send('/images/profile/'+fileName);
      });
    });

  });
  form.parse(req);
});

//이미지 파일들 리턴
app.get('/images/:id', function(req, res) {
  res.render('partials/' + req.params.id);
});

// /metadata 에서 메타데이터 리턴. config/metadata.yml 파싱.
app.get('/metadata', function(req, res){
  var metadata_obj = YAML.load($MAUM_HOME+'/config/metadata.yml');
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(metadata_obj));
});

//jade 에서 include 하는 파트 파일들 존재하는 디렉토리.
app.get('/partials/:partialFile', function(req, res) {
  res.render('partials/' + req.params.partialFile);
});

// index.jade 실행.
// '/' 대신 '*' 로 해 놓으면 모든 경로에서 로딩.
app.get('/', function(req, res) {
  res.render('index', {
    // index.jade 에 보낼 object data 설정.
  });
});

var port = 3000;
app.listen(port);
console.log('Start maumgori-server on port ' + port + '...');
