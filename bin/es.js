/**
엘라스틱서치 사용 모듈.
*/

var YAML = require('yamljs');
var http = require('http');

// 마음고리 홈 디렉토리.
var $MAUM_HOME = require('path').join(__dirname, '..');
//마음고리 환경설정 정보가 담긴 객체.
var config_obj = YAML.load($MAUM_HOME+'/config/maum.yml');

/**
  사용자 정보 입력하는 함수.
  user_obj : 사용자 정보가 들어있는 객체.
  user_obj.id 는 필수.
*/
exports.insertUser = function (req, res) {
  // 엘라스틱서치 사용자정보 입력 시작.
  var user_obj = req.body; //body-parser 있어야 사용 가능. JSON 형식만 읽어들이기 가능.
  console.log("%j",user_obj);
  var userString = JSON.stringify(user_obj);
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/users/user/'+user_obj.id,
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
//      console.log(responseString);
      res.send("사용자 정보가 입력되었습니다.");
//      return JSON.parse(responseString);
    });
  });
  es_req.write(userString);
  es_req.end();
  // 엘라스틱서치 사용자정보 입력 끝.
};

/**
  아이디 존재하는지 체크하는 함수.
*/
exports.checkId = function(req, res){
  var id = req.params.id;
//  console.log("id : "+id);
  var idExist = false;
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/users/user/'+id,
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
}

//전문가 목록 겟.
exports.getExpertList = function(req, res){
  var expert_list = [];
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/users/user/_search',
    method: 'GET',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(data) {
      var resultObject = JSON.parse(data);
      console.log("%j",resultObject);
      if(resultObject.hits){
        for(var i=0; i < resultObject.hits.hits.length; i++){
          expert_list.push(resultObject.hits.hits[i]._source)
        }
      } else {
      }
      res.send(expert_list);
    }).on('error', function(error) {
      console.log(error);
      res.send(false);
    });
  });
  es_req.end();
}
