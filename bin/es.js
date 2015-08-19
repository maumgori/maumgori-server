/**
엘라스틱서치 사용 모듈.
*/
var YAML = require('yamljs');
var http = require('http');
var fs = require('fs');

// 마음고리 홈 디렉토리.
var $MAUM_HOME = require('path').join(__dirname, '..');
//마음고리 환경설정 정보가 담긴 객체.
var config_obj = YAML.load($MAUM_HOME+'/config/maum.yml');

//aggregation 가져오기.
exports.getAggs = function(socket,req_data){
  searchEs(socket,req_data,"aggregations")
};

//hits 가져오기.
exports.getHits = function(socket,req_data){
  searchEs(socket,req_data,"hits")
};

var searchEs = function(socket, req_data, element){
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_emit = req_data.emit; //emit 값.
  var req_query = req_data.query;   //QueryDSL
  //console.log("%j",req_data);

  var headers = {
    'Content-Type': 'application/json'
  }
  var path_val = "";
  if(req_index !== null && req_index !== ""){
    path_val += "/"+req_index;
    if(req_type !== null && req_type !== ""){
      path_val += "/"+req_type;
    }
  } else {
    path_val += "/_all";
  }
  path_val += "/_search";

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
      //console.log("%j",resultObject);
      if(resultObject){
        socket.emit(req_emit,resultObject[element]);  //소켓 통신.
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.write(JSON.stringify(req_query));
  es_req.end();
}

//도큐먼트 1건 가져오기.
exports.getDocument = function(socket, req_data){
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_id = req_data.id; //type
  var req_element = req_data.element; //found 또는 _source
  var req_emit = req_data.emit; //emit 값.

  var headers = {
    'Content-Type': 'application/json'
  };

  var path_val = "";
  if(req_index !== null && req_index !== ""){
    path_val += "/"+req_index;
    if(req_type !== null && req_type !== ""){
      path_val += "/"+req_type;
      if(req_id !== null && req_id !== ""){
        path_val += "/"+req_id.toLowerCase();
      }
    }
  }

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'GET',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        socket.emit(req_emit,resultObject[req_element]);
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.end();
}

//로그인
exports.login = function(socket, req_data){
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_id = req_data.id; //type
  var req_passwd = req_data.passwd; //type
  //var req_element = req_data.element; //found 또는 _source
  var req_emit = req_data.emit; //emit 값.

  var headers = {
    'Content-Type': 'application/json'
  };

  var path_val = "";
  if(req_index !== null && req_index !== ""){
    path_val += "/"+req_index;
    if(req_type !== null && req_type !== ""){
      path_val += "/"+req_type;
      if(req_id !== null && req_id !== ""){
        path_val += "/"+req_id.toLowerCase();
      }
    }
  }

  var resObj = {
    idExist : false,
    correctPasswd : false,
    isError : false,
    user_obj : null
  }

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'GET',
    headers: headers
  };

  console.log('login');
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        if(resultObject.found){
          if(req_id === resultObject._source.id ){
            resObj.idExist = true;
            // 패스워드 암호화.
            var hash = require('crypto').createHash('sha256');
            var passwd_val = hash.update(req_passwd).digest('hex');
            if(passwd_val === resultObject._source.passwd ){
              resObj.correctPasswd = true;
              resObj.user_obj = resultObject._source;
            }
          }
        } else {
          resObj.idExist = false;
        }

        socket.emit(req_emit,resObj);
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.end();
}

/**
  전문가 정보 입력하는 함수.
  user_obj : 사용자 정보가 들어있는 객체.
  user_obj.id 는 필수. REST 주소는 무조건 소문자로 변환해서 저장.
*/
exports.insertExpert = function (socket, req_data) {
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_emit = req_data.emit; //emit 값.
  var user_obj = req_data.user_obj;

  var passwd_val = '';
  //처음 저장이면 패스워드 sha256 암호화. 아닌 경우 그냥 저장.
  if(user_obj.passwd_enc === ''){
    if(user_obj.passwd !== ''){
      var hash = require('crypto').createHash('sha256');
      passwd_val = hash.update(user_obj.passwd).digest('hex');
    } else {
      // 오류 리턴
    }
  } else {
    passwd_val = user_obj.passwd_enc;
  }

  //엘라스틱서치 /experts/expert 에 저장되는 사용자 도큐먼트.
  var es_obj = {
    register_date : new Date(),
    register_done : user_obj.register_done,
    signin_step : user_obj.signin_step,
    type : user_obj.type,
    id : user_obj.id.toLowerCase(),
    passwd : passwd_val,
    user_photo : user_obj.user_photo,
    name : user_obj.name,
    gender : user_obj.gender,
    birth : user_obj.birth,
    birthday : user_obj.birthday,
    phone : user_obj.phone,
    email : user_obj.email,
    homepage : user_obj.homepage,
    kakao : user_obj.kakao,
    naver_line : user_obj.naver_line,
    facebook : user_obj.facebook,
    twitter : user_obj.twitter,
    googleplus : user_obj.googleplus,
    linkedin : user_obj.linkedin,
    instagram : user_obj.instagram,
    category_list: user_obj.category_list,
    category: user_obj.category,
    expert_type : user_obj.expert_type,
    location : user_obj.location,
    career : user_obj.career,
    activity: user_obj.activity,
    profile_title: user_obj.profile_title,
    profile_text: user_obj.profile_text,
    proflie_txt_color: user_obj.proflie_txt_color,
    proflie_txt_location: user_obj.proflie_txt_location,
    profile_bg_img: user_obj.profile_bg_img,
    method_list: user_obj.method_list,
    method: user_obj.method,
    method_price_min : user_obj.method_price_min,
    method_price_max : user_obj.method_price_max
  }

  var userString = JSON.stringify(es_obj);
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/experts/expert',
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        socket.emit(req_emit,es_obj);
      } else {
        socket.emit('error',error);
      }
    });
  });
  es_req.write(userString);
  es_req.end();

  // /data 경로에 날짜 이름으로 사용자 입력 데이터 저장.
  var today = new Date();
  var tomonth = "0"+(today.getMonth()+1);
  var todate = "0"+(today.getDate());
  tomonth = tomonth.substring(tomonth.length-2,tomonth.length);
  todate = todate.substring(todate.length-2,todate.length);
  fs.open($MAUM_HOME+'/data/experts/expert_'+today.getFullYear()+tomonth+todate+'.json','a', function(err, fd){
    fs.write( fd, userString+'\n', null, 'utf8', function(){
      fs.close(fd, function(){
        //console.log('file closed');
      });
    });
  });

};
// 엘라스틱서치 전문가 정보 입력 끝.

//앱 사용자 회원가입.
exports.appUserSignin = function (socket, req_data) {
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_emit = req_data.emit; //emit 값.
  var user_obj = req_data.user_obj;

  var passwd_val = '';
  //처음 저장이면 패스워드 sha256 암호화. 아닌 경우 그냥 저장.
  if(user_obj.passwd_enc === ''){
    if(user_obj.passwd !== ''){
      var hash = require('crypto').createHash('sha256');
      passwd_val = hash.update(user_obj.passwd).digest('hex');
    } else {
      // 오류 리턴
    }
  } else {
    passwd_val = user_obj.passwd_enc;
  }

  //엘라스틱서치 /userss/user 에 저장되는 사용자 도큐먼트.
  var register_date_temp = user_obj.register_date || new Date();
  var es_obj = {
    register_date : register_date_temp,
    id : user_obj.id.toLowerCase(),
    passwd : passwd_val,
    name : user_obj.name,
    nicname : user_obj.nicname,
    birthday : user_obj.birthday,
    gender : user_obj.gender,
    email : user_obj.email,
    phone : user_obj.phone,
    jjim : user_obj.jjim,
    messages : user_obj.messages
  }

  var userString = JSON.stringify(es_obj);
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/users/user',
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        socket.emit(req_emit,es_obj);
      } else {
        socket.emit('error',error);
      }
    });
  });
  es_req.write(userString);
  es_req.end();

  // /data 경로에 날짜 이름으로 사용자 입력 데이터 저장.
  var today = new Date();
  var tomonth = "0"+(today.getMonth()+1);
  var todate = "0"+(today.getDate());
  tomonth = tomonth.substring(tomonth.length-2,tomonth.length);
  todate = todate.substring(todate.length-2,todate.length);
  fs.open($MAUM_HOME+'/data/users/user_'+today.getFullYear()+tomonth+todate+'.json','a', function(err, fd){
    fs.write( fd, userString+'\n', null, 'utf8', function(){
      fs.close(fd, function(){
        //console.log('file closed');
      });
    });
  });

};
//앱 사용자 회원가입 끝

/**
엘라스틱서치 Document 저장 - 아무 로직 없는 공통.
index : 인덱스명
type : 타입명
emit : emit 할 소켓 이벤트.
doc_data : 저장할 도큐먼트
*/
exports.insertDocument = function (socket, req_data) {
  var req_index = req_data.index; //index
  var req_type = req_data.type; //type
  var req_emit = req_data.emit; //emit 값.
  var doc_data = req_data.doc_data;

  var userString = JSON.stringify(doc_data);
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: req_index+'/'+req_type,
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        socket.emit(req_emit,res_data);
      } else {
        socket.emit('error',error);
      }
    });
  });
  es_req.write(userString);
  es_req.end();

  // /data 경로에 날짜 이름으로 입력 데이터 저장.
  var today = new Date();
  var tomonth = "0"+(today.getMonth()+1);
  var todate = "0"+(today.getDate());
  tomonth = tomonth.substring(tomonth.length-2,tomonth.length);
  todate = todate.substring(todate.length-2,todate.length);
  fs.open($MAUM_HOME+'/data/etc/etc_'+today.getFullYear()+tomonth+todate+'.json','a', function(err, fd){
    fs.write( fd, userString+'\n', null, 'utf8', function(){
      fs.close(fd, function(){
        //console.log('file closed');
      });
    });
  });

};
