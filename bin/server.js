var express = require('express');
var stylus = require('stylus');
var $MAUM_HOME = __dirname + '/../';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path);
}

app.set('views', $MAUM_HOME + '/server/views');
app.set('view engine', 'jade');

app.use(stylus.middleware(
  {
    src: $MAUM_HOME + '/public',
    compile: compile
  }
));
app.use(express.static($MAUM_HOME + '/public'));

// To-Do : 이 부분에 Elasticsearch 관련 나중에 셋팅.

//jade 에서 include 하는 파트 파일들 존재하는 디렉토리.
app.get('/partials/:partialFile', function(req, res) {
  res.render('partials/' + req.params.partialFile);
});

app.get('/signin', function(req, res){
  res.render('signin');
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
console.log('Listening on port ' + port + '...');
