var express = require('express'),
    stylus = require('stylus');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

app.use(stylus.middleware(
  {
    src: __dirname + '/public',
    compile: compile
  }
));
app.use(express.static(__dirname + '/public'));

// To-Do : 이 부분에 Elasticsearch 관련 나중에 셋팅.

//jade 에서 include 하는 하위 파일들 존재하는 디렉토리.
app.get('/conts/:contFile', function(req, res) {
  res.render('conts/' + req.params.contFile);
});

// index.jade 실행.
// / 대신 * 로 해 놓으면 모든 경로에서 로딩.
app.get('*', function(req, res) {
  res.render('index', {
    // index.jade 에 보낼 object data 설정.
  });
});

var port = 3000;
app.listen(port);
console.log('Listening on port ' + port + '...');
