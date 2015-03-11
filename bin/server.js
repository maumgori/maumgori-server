var express = require('express');
var stylus = require('stylus');
var bodyParser = require('body-parser');
var YAML = require('yamljs');
var http = require('http');

// 마음고리 홈 디렉토리.
var $MAUM_HOME = require('path').join(__dirname, '../');

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

// 회원가입 데이터 받는 REST API
app.post('/signin', function(req, res){
  var user_obj = req.body; //body-parser 있어야 사용 가능. JSON 형식만 읽어들이기 가능.
  // 엘라스틱서치 사용자정보 입력 시작.
  var userString = JSON.stringify(user_obj);
  console.log(userString);
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: 'localhost', port: 9200, path: '/users/user/'+user_obj.id,
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(data) {
      responseString += data;
    });
    es_res.on('end', function() {
      console.log(responseString);
      var resultObject = JSON.parse(responseString);
    });
  });
  es_req.write(userString);
  es_req.end();
  // 엘라스틱서치 사용자정보 입력 끝.

  res.send('user inserted');
});

// 회원 가입 시 아이디 체크.
app.get('/users/:id', function(req, res){
  var id = req.params.id;
//  console.log("id : "+id);
  var idExist = false;
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: 'localhost', port: 9200, path: '/users/user/'+id,
    method: 'GET',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(data) {
      var resultObject = JSON.parse(data);
//      console.log("%j",resultObject);
      if(resultObject.found){
        idExist = resultObject.found;
      } else {
        idExist = false;
      }
      res.send(idExist);
    }).on('error', function(error) {
      console.log(error);
      res.send(false);
    });
  });
  es_req.end();
});

//jade 에서 include 하는 파트 파일들 존재하는 디렉토리.
app.get('/partials/:partialFile', function(req, res) {
  res.render('partials/' + req.params.partialFile);
});

// index.jade 실행.
// '/' 대신 '*' 로 해 놓으면 모든 경로에서 로딩.
app.get('*', function(req, res) {
  res.render('index', {
    // index.jade 에 보낼 object data 설정.
  });
});

var port = 3000;
app.listen(port);
console.log('Start maumgori-server on port ' + port + '...');
