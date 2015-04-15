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
  user_obj.id 는 필수. REST 주소는 무조건 소문자로 변환해서 저장.
*/
exports.insertUser = function (req, res) {
  // 엘라스틱서치 사용자정보 입력 시작.
  var user_obj = req.body; //body-parser 있어야 사용 가능. JSON 형식만 읽어들이기 가능.
//  console.log("%j",user_obj);
  var passwd_val = '';
  //처음 저장이면 패스워드 sha256 암호화. 아닌 경우 그냥 저장. // 잠시 보류
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

  var price_obj = user_obj.price;
  price_obj.enable_list = [];
  var price_arr = [];
  if(price_obj.phone_enable === true){
    price_arr.push(price_obj.phone_amount);
    price_obj.enable_list.push("phone");
  }
  if(price_obj.email_enable === true){
    price_arr.push(price_obj.email_amount);
    price_obj.enable_list.push("email");
  }
  if(price_obj.message_enable === true){
    price_arr.push(price_obj.message_amount);
    price_obj.enable_list.push("message");
  }
  if(price_obj.interview_enable === true){
    price_arr.push(price_obj.interview_amount);
    price_obj.enable_list.push("interview");
  }

  price_arr.sort();
  if(price_arr.length > 0){
    price_obj.min_amount = price_arr[0];
    price_obj.max_amount = price_arr[price_arr.length-1];
  } else {
    price_obj.min_amount = 0;
    price_obj.max_amount = 0;
  }

  //엘라스틱서치 users/user 에 저장되는 사용자 도큐먼트.
  var es_obj = {
    register_done : user_obj.register_done,
    signin_step : user_obj.signin_step,
    type : user_obj.type,
    id : user_obj.id,
    passwd : passwd_val,
    user_photo : user_obj.user_photo,
    name : user_obj.name,
    gender : user_obj.gender,
    birthday : new Date(user_obj.birthday.year,user_obj.birthday.month+1,user_obj.birthday.day),
    age : user_obj.age,
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
    price : price_obj
  }
//  console.log('%j',es_obj);

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
    es_res.on('data', function(data) {
      responseString += data;
    });
    es_res.on('end', function() {
//      console.log(responseString);
      res.send(userString);
//      return JSON.parse(responseString);
    });
  });
  es_req.write(userString);
  es_req.end();
  // 엘라스틱서치 사용자정보 입력 끝.
};

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

//로그인용
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

//전문가 목록 : 웹속켓용
exports.getExpertList = function(socket,req_data){
  var expert_list = [];
  var headers = {
    'Content-Type': 'application/json'
  };
  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: '/users/user/_search',
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
      //console.log("%j",resultObject);
      if(resultObject.hits){
        for(var i=0; i < resultObject.hits.hits.length; i++){
          expert_list.push(resultObject.hits.hits[i]._source)
        }
      } else {
      }
      socket.emit('expertList',expert_list);  //소켓 통신.
    }).on('error', function(error) {
      console.log(error);
      return { result : error };
    });
  });
  es_req.write(JSON.stringify(req_data));
  es_req.end();
}

//로그인. ES에서 사용자 ID 가져와서 패스워드와 매치.
// http://bcho.tistory.com/920 참고해서 세션 작업까지 완료 할 것.
/*
exports.login = function(req, res){
  var login_obj = req.body;
  //console.log(login_obj);
  var id = login_obj.id.toLowerCase();
  var resObj = {
    idExist : false,
    correctPasswd : false,
    isError : false,
    user_obj : null
  }
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
      //console.log("%j",resultObject);
      if(resultObject.found){
        if(login_obj.id === resultObject._source.id ){
          resObj.idExist = true;
          // 패스워드 암호화.
          var hash = require('crypto').createHash('sha256');
          var passwd_val = hash.update(login_obj.passwd).digest('hex');
          if(passwd_val === resultObject._source.passwd ){
            resObj.correctPasswd = true;
            resObj.user_obj = resultObject._source;
          }
        }
      } else {
        resObj.idExist = false;
      }
      res.send(resObj);
    }).on('error', function(error) {
      console.log(error);
      resObj.isError = true;
      res.send(resObj);
    });
  });
  es_req.end();
}
*/
