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
//메뉴 정보 객체.
var menu_obj = YAML.load($MAUM_HOME+'/config/menu.yml');
//console.log("%j",menu_obj);

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

// socket.io 사용. : http://socket.io/docs/
var server = http.Server(app);
var io = require('socket.io').listen(server);
io.on('connection', function(socket){

  //console.log('socket.io connected');

  //메타데이타 겟.
  socket.on('getMetaData', function(){
    var metadata_obj = YAML.load($MAUM_HOME+'/config/metadata.yml');
    socket.emit('metaData',metadata_obj);
  });

  //_search로 aggs 겟.
  socket.on('getAggs', function(data){
    es.getAggs(socket, data);
  });

  //_search로 hits 겟.
  socket.on('getHits', function(data){
    es.getHits(socket, data);
  });

  //document 직접 겟.
  socket.on('getDocument', function(data){
    es.getDocument(socket, data);
  });

  //로그인
  socket.on('login', function(data){
    es.login(socket, data);
  });

  //패스워드 암호화 해서 리턴.
  socket.on('encPasswd', function(data){
    var req_passwd = data.passwd; //passwd
    var req_emit = data.emit; //emit 값.

    var hash = require('crypto').createHash('sha256');
    var passwd_val = hash.update(req_passwd).digest('hex');
    var ret_obj = {passwd_enc : passwd_val};
    socket.emit(req_emit,ret_obj);
  });

  //도큐먼트 저장 - 공통
  socket.on('insertDocument', function(data){
    es.insertDocument(socket,data);
  });

  //전문가 저장.
  socket.on('insertExpert', function(data){
    es.insertExpert(socket,data);
  });

  //앱 사용자 회원가입.
  socket.on('appUserSignin', function(data){
    es.appUserSignin(socket,data);
  });

  //app.js 에 메뉴 status 생성.
  socket.emit('renderMenu',menu_obj);

});

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

//네비게이션 바 디렉토리
app.get('/nav/:navFile', function(req, res) {
  res.render('nav/' + req.params.navFile, menu_obj);
});

//메뉴 디렉토리
app.get('/pages/:page1', function(req, res) {
  res.render('pages/' + req.params.page1);
});
//메뉴 디렉토리
app.get('/pages/:page1/:page2', function(req, res) {
  res.render('pages/' + req.params.page1 + '/' + req.params.page2);
});

app.get('/signin/:signinFiles', function(req, res) {
  res.render('signin/' + req.params.signinFiles);
});
/*
app.get('/signin', function(req, res) {
  res.render('signin');
});

app.get('/main', function(req, res){
  res.render('main'); //메뉴가 아니라 여기서 보내줘야 메뉴에서 제대로 나옴.
});
*/
// index.jade 실행.
// '/' 대신 '*' 로 해 놓으면 모든 경로에서 로딩.
app.get('/', function(req, res) {
  res.render('index');
});

var port = 3000;
//app.listen(port);
console.log('Start maumgori-server on port ' + port + '...');

server.listen(port);  //socket.io 사용하려면 이렇게 변경.
