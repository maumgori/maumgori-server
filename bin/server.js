var express = require('express');
var stylus = require('stylus');
var bodyParser = require('body-parser');  //데이터 입력을 위한 패키지.
var YAML = require('yamljs');
var http = require('http');

var es = require('./es.js');  // 엘라스틱서치 처리.
var file = require('./file.js');  //파일 업로드 처리.

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
app.use(bodyParser.json({limit: '50mb'}))

//로그인
app.post('/login', function(req, res){
  es.login(req, res);
});
// 회원정보 입력.
app.post('/signin', function(req, res){
  es.insertUser(req, res);
});
// 회원 가입 시 아이디 체크.
app.get('/users/:id', function(req, res){
  es.checkId(req,res);
});

app.get('/expertlist', function(req, res){
  es.getExpertList(req,res);
});

// 이미지 파일 업로드.
app.post('/fileupload/photo', function(req, res) {
  file.saveProfileImg(req,res);
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
