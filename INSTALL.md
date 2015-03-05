
server.js 생성 (app.js)
/* server.js 시작 */
var express = require('express');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'; //노드 환경변수 가져옴.
var app = express();

app.configure(function(){
  app.set('views', __dirname + '/server/views');
  app.set('view engine', 'jade');
});

// / 보다 * 가 나음. 전체 받음.
app.get('*', function(req, res){
  res.render('index'):
});

var port=3000;
app.listen(port);
console.log('listening port : '+port);
/* server.js 끝 */

server/views 디렉토리 생성
index.jade 파일 생성

/* index.jade 파일 시작. */
!!!5
html
  head
    // link (href="/favicon.ico", rel..
  body
    h1 hello world

/* index.jade 파일 끝. */

node server.js 하던지
nodemon 설치해서 하던지 ( npm install nodemon -g )
nodemon server.js


동영상 - 06.

server.js 생성 (app.js)
/* server.js 시작 */
var express = require('express');
var stylus = require('stylus');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'; //노드 환경변수 가져옴.
var app = express();

function compile(str, path){
  return stylus(str).set('filename',path);
}

app.configure(function(){
  app.set('views', __dirname + '/server/views');
  app.set('view engine', 'jade');

  app.use(express.logger('dev'));   //로깅 프로그램.
  app.use(express.bodyParser())
  app.use(stylus.middleware(
  {
    src : __dirname + '/public',
    compile : compile
  }
  ));
  app.use(express.static(__dirname + '/public')); // 찾아볼것.

});

// / 보다 * 가 나음. 전체 받음.
app.get('*', function(req, res){
  res.render('index'):
});

var port=3000;
app.listen(port);
console.log('listening port : '+port);
/* server.js 끝 */

npm install stylus --save


동영상 - 07.

server/includes 생성.
layout.jade 생성.
/* layout.jade 파일 시작. */
!!!5
html
  head
    link(href="/favicon.ico", rel="shortcut icon", type="image/x-icon")
    link(rel="stylesheet", href="/css/bootstrap.css")
    link(rel="stylesheet", href="/vendor/toastr/toastr.css")
    link(rel="stylesheet", href="/css/site.css")
  body(ng-app='app')
    block main-content
    include scripts // scripts.jade 파일 만들어야 함. 안그러면 오류.

/* layout.jade 파일 끝. */

public/css 생성.
bootstrap 복사.
site.styl 파일 생성.

=== 앵귤러 :
public/app 디렉토리 생성.
app.js 생성.
/* app.js 시작 */
angular.module('app', ['ngResource', 'ngRoute']);

angular.module('app').config(function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/', {templateUrl: '/partials/main', controller : 'mainCtrl'});

});

angular.module('app').controller('mainCtrl',function($scope){
  $scope.myVar = "Hello Angular";
})
/* app.js 끝 */

/views/partials 디렉토리 생성. 앵귤러 파샬 파일 넣을 곳.
main.jade 생성.
/* main.jade 시작 */
h1 this is partial
h2 {{myVar}}
/* main.jade 끝 */

/* index.jade 파일 수정. */
extends ../includes/layout

block main-content
  section.content
    div(ng-view)
/* index.jade 파일 끝. */

layout.jade 수정. 위 참고.

server.js 수정.
/* server.js 시작 */
var express = require('express');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'; //노드 환경변수 가져옴.
var app = express();

function compile(str, path){
  return stylus(str).set('filename',path);
}

app.configure(function(){
  app.set('views', __dirname + '/server/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(stylus.middleware(
    {
      src : __dirname + 'public',
      compile : compile
    }
  ));

  app.use(express.static(__dirname+'/public'));
});

app.get('/partials/:partialPath', function(req, res){
  res.render('partials/' + req.params.partialPath);
});

// / 보다 * 가 나음. 전체 받음.
app.get('*', function(req, res){
  res.render('index'):
});

var port=3000;
app.listen(port);
console.log('listening port : '+port);
/* server.js 끝 */
