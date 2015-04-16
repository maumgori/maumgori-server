(function(){

  var ctrls = angular.module('controllers',['ngImgCrop','services']);

  //로그인/회원가입 컨트롤러.
  ctrls.controller('loginFormCtrl', function($scope,$http,socket){

    //로그인 id, pw 객체
    $scope.login_obj = {
      id : '',
      passwd : '',
      passwd_pre : '',
      passwd_pre_correct : false
    }

    //사용자 로그인: 다른곳에서 호출하는 곳이 있기 때문에 먼저 선언해야 함.
    $scope.login = function(){
      var login_s_obj = {
        index : "users",
        type : "user",
        id : $scope.login_obj.id,
        passwd : $scope.login_obj.passwd,
        emit : "login"
      }
      socket.emit('login',login_s_obj);
    };
    socket.on('login', function(data){
      //console.log(data);
      if(!data.idExist){
        toastr.error('존재하지 않는 아이디입니다.', '로그인 실패')
      } else {
        if(!data.correctPasswd){
          toastr.error('패스워드가 일치하지 않습니다.', '로그인 실패');
        } else {
          //console.log(data.user_obj);
          append_user_obj(data.user_obj);
          $scope.user_obj.is_loggedin = true;
          if($scope.user_obj.signin_step < ($scope.user_obj.signin_step_text.length - 1)){
            $scope.user_obj.signin_step++;
          }
          //console.log($scope.login_obj);
          sessionStorage["maum_login_obj"] = JSON.stringify($scope.login_obj);
        }
      }
    });

    if(sessionStorage["maum_login_obj"]){
      //console.log(sessionStorage["maum_login_obj"]);
      var login_session = JSON.parse(sessionStorage["maum_login_obj"]);
      //console.log(login_session);
      $scope.login_obj = login_session;
      $scope.login();
    }

    //패스워드 체크.
    $scope.checkPasswd = function(passwd){
      console.log(passwd);
      var check_passwd_obj = {
        passwd : passwd,
        emit : "passwdPreCorrect"
      }
      socket.emit('encPasswd',check_passwd_obj);
    }
    //이전 패스워드와 맞으면 패스워드 변경 가능.
    socket.on('passwdPreCorrect',function(data){
      if(!data.passwd_enc){
        $scope.login_obj.passwd_pre_correct = false;
      } else {
        if(data.passwd_enc === $scope.user_obj.passwd_enc){
          //console.log("패스워드 일치.")
          $scope.login_obj.passwd_pre_correct = true;
        } else {
          $scope.login_obj.passwd_pre_correct = false;
        }
      }
      //console.log(data);
    });

    // 서버에서 가져온 사용자 정보를 user_obj에 대입.
    var append_user_obj = function(data){
      console.log(data);
      var obj_keys = Object.keys(data); // key Array 가져옴. ["signin_step","id","type","passwd", ...];

      for(var i=0; i < obj_keys.length; i++){
        $scope.user_obj[obj_keys[i]] = data[obj_keys[i]];
      }
      $scope.user_obj.passwd_enc = data.passwd;
      $scope.user_obj.passwd = "";
      $scope.user_obj.passwd_re = "";
      if($scope.user_obj.id !== ''){
        $scope.user_obj.id_created = true;
      }
      //생년월일 적용
      var bday = new Date(data.birthday);
      $scope.user_obj.birthday = {};
      $scope.user_obj.birthday.year = bday.getFullYear();
      $scope.user_obj.birthday.month = bday.getMonth()+1; //month 는 0~11
      $scope.user_obj.birthday.day = bday.getDate();

      //카테고리 적용
      if(data.category !== null && data.category_list !== null){
        $scope.user_obj_func.categoryCheck();
      }

      var search_data = {
        filter : {
          term : {
            register_done : true
          }
        }
      };
      //socket.emit('getExpertList',search_data);
      var req_data = {
        index : "users",
        type : "user",
        emit: "expertList",
        query : search_data
      }
      socket.emit('getHits',req_data);

    }

    /**
    user_obj : 가입/로그인 사용자 정보 담는 객체.
    */
    $scope.user_obj = {
      is_loggedin : false,
      register_done : false,
      signin_step : 0,
      id : '',
      id_created : false,
      id_check_val : false,
      type : 'expert',
      passwd : '',
      passwd_re : '',
      passwd_enc : '',
      passwd_pre : '',
      signin_step_text : ["아이디 생성","개인 정보","전문 분야","소개","서비스 비용"],
      user_photo : '/images/blank-user.jpg',
      user_photo_data : '',
      name : '',
      gender : 'male',
      birthday : {
        year : 1990,
        month : 1,
        day : 1
      },
      age : 0,
      phone : [],
      email : '',
      homepage : '',
      kakao : '',
      naver_line : '',
      facebook : '',
      twitter : '',
      googleplus : '',
      linkedin : '',
      instagram : '',
      category_list : null,
      category: null,
      expert_type : '',
      location : '',
      career : '',
      activity: '',
      profile_title : '',
      profile_text : '',
      proflie_txt_color : false,
      proflie_txt_location : 'top',
      profile_bg_img : '/images/profile_background.png',
      price: {
        phone_enable : true,
        phone_amount : 20000,
        email_enable : true,
        email_amount : 10000,
        message_enable : true,
        message_amount : 20000,
        interview_enable : true,
        interview_amount : 50000,
      }
    };

    $scope.user_obj_func = {
      step_0_chk : function() {
        var data = {
          passwd_1_class : 'text-danger',
          passwd_2_class : 'text-danger',
          passwd_1_form_class : 'has-error',
          passwd_2_form_class : 'has-error',
          passwd_1_txt : '',
          passwd_2_txt : '',
          id_class : 'text-danger',
          id_form_class : 'has-error',
          id_txt : '',
          id_confirmed : false,
          passwd_1_confirmed : false,
          passwd_2_confirmed : false,
          confirmed : false
        }

        // 아이디 검증.
        if($scope.user_obj.id === ''){
          data.id_class = "";
          data.id_form_class = "";
          data.id_txt = ""
          data.id_confirmed = false;
        } else {
          var ck_validation = /^[A-Za-z0-9_]{0,20}$/;
          if(!ck_validation.test($scope.user_obj.id)){
            data.id_class = "text-danger";
            data.id_form_class = "has-error";
            data.id_txt = "영어, 숫자, '_' 만 입력 가능합니다."
            data.id_confirmed = false;
          } else {
            if($scope.user_obj.id.length < 4){
              data.id_class = "text-danger";
              data.id_form_class = "has-error";
              data.id_txt = "4자리 이상 입력하세요."
              data.id_confirmed = false;
            } else {
              if($scope.user_obj.id_check_val){
                data.id_class = "text-danger";
                data.id_form_class = "has-error";
                data.id_txt = "이미 존재하는 아이디 입니다."
                data.id_confirmed = false;
              } else {
                data.id_class = "text-primary";
                data.id_form_class = "has-primary";
                data.id_txt = "사용 가능한 아이디 입니다."
                data.id_confirmed = true;
              }
            }
          }
        }
        // 비밀번호 검증.
        if($scope.user_obj.passwd === ''){
          data.passwd_1_class = "",
          data.passwd_1_form_class = "",
          data.passwd_1_txt = "",
          data.passwd_1_confirmed = false;
        } else {
          if($scope.user_obj.passwd.length < 6){
            data.passwd_1_class = "text-danger",
            data.passwd_1_form_class = "has-error",
            data.passwd_1_txt = "비밀번호는 6자리 이상 입력하세요.",
            data.passwd_confirmed = false;
          } else {
            data.passwd_1_class = "text-primary",
            data.passwd_1_form_class = "has-primary",
            data.passwd_1_txt = "사용 가능한 비밀번호입니다.",
            data.passwd_1_confirmed = true;
          }
        }
        // 비밀번호 확인 검증.
        if($scope.user_obj.passwd_re === ''){
          data.passwd_2_class = "",
          data.passwd_2_form_class = "",
          data.passwd_2_txt = "",
          data.passwd_2_confirmed = false;
        } else {
          if($scope.user_obj.passwd === $scope.user_obj.passwd_re){
            data.passwd_2_class = "text-primary",
            data.passwd_2_form_class = "has-primary",
            data.passwd_2_txt = "비밀번호가 확인되었습니다.",
            data.passwd_2_confirmed = true;
          } else {
            data.passwd_2_class = "text-danger",
            data.passwd_2_form_class = "has-error",
            data.passwd_2_txt = "비밀번호가 동일하지 않습니다.",
            data.passwd_2_confirmed = false;
          }
        }
        data.confirmed = data.id_confirmed && data.passwd_1_confirmed && data.passwd_2_confirmed;
        return data;
      },
      signin_before : function() {
        $scope.user_obj.signin_step--;
      },
      temp_id : "",
      temp_passwd : "",
      signin_next : function() {
        // 마지막 단계까지 끝.
        if($scope.user_obj.signin_step === 0){
          $scope.user_obj_func.temp_id = $scope.user_obj.id;
          $scope.user_obj_func.temp_passwd = $scope.user_obj.passwd;
          //console.log($scope.login_obj);
        }
        if($scope.user_obj.signin_step === ($scope.user_obj.signin_step_text.length-1)){
          $scope.user_obj.register_done = true;
        }

        // /signin 에 POST 로 user_obj 데이터 전달.
        $http.post('/signin',$scope.user_obj).success(function(data){
          toastr.success('사용자 정보가 저장되었습니다.', '저장 완료');
          append_user_obj(data);
          if($scope.user_obj.signin_step === ($scope.user_obj.signin_step_text.length-1)){
            //$scope.user_obj.is_loggedin = true;
            if($scope.user_obj_func.temp_id !== "" && $scope.user_obj_func.temp_passwd !== ""){
              $scope.login_obj.id = $scope.user_obj_func.temp_id;
              $scope.login_obj.passwd = $scope.user_obj_func.temp_passwd;
              $scope.login();
            }
            $('#signinModal').modal('hide');
          } else {
            $scope.user_obj.signin_step++;
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      upload_photo : function(){
//        console.log($scope.user_obj.user_photo_data);
        var photoData = {
          photo : $scope.user_obj.user_photo_data,
          id : $scope.user_obj.id
        };
        $http.post('/fileupload/photo',photoData).success(function(data){
          //console.log("result : "+data);
          $scope.user_obj.user_photo = data;
          $('#imgUploadModal').modal('hide');
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      user_photo_append : function(){
        $scope.user_obj.user_photo = $scope.user_obj.user_photo_data;
        $('#imgUploadModal').modal('hide');
      },
      birth_option : function(){
        var data = {
          years : null,
          months : [1,2,3,4,5,6,7,8,9,10,11,12],
          days : null
        }
        data.years = new Array(100);
        for(var i=0; i < 100; i++){
          data.years[i] = (new Date()).getFullYear()-i;
        }
        //윤달 계산 로직
        var this_month = Number($scope.user_obj.birthday.month);
        if(this_month === 2){
          if( (Number($scope.user_obj.birthday.year) % 4 === 0) &&
              (Number($scope.user_obj.birthday.year) % 100 !== 0) ||
              (Number($scope.user_obj.birthday.year) % 400 === 0)
          ){
            data.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
          } else {
            data.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
          }
        } else if (this_month === 4 || this_month === 6 || this_month === 9 || this_month === 11){
          data.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
        } else {
          data.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
        }
        $scope.user_obj.age = (new Date()).getFullYear() - $scope.user_obj.birthday.year;
        return data;
      },
      categoryCheck : function(){
        $scope.user_obj.category = [];
        for(var i=0; i<$scope.user_obj.category_list.length; i++){
          if($scope.user_obj.category_list[i].checked){
            $scope.user_obj.category.push($scope.user_obj.category_list[i].name);
          }
        }
        console.log($scope.user_obj.category_list);
        console.log($scope.user_obj.category);
      },
      profileBgImgUpload : function(){
        $('#bntBgImgSave').attr('disabeld',true);
        var bgCanvas = $('#profile_bg_img').cropper('getCroppedCanvas');
        //console.log(bgCanvas.toDataURL());
        var photoData = {
          photo : bgCanvas.toDataURL(),
          id : $scope.user_obj.id+'_bg'
        };
        $http.post('/fileupload/photo',photoData).success(function(data){
          //console.log("result : "+data);
          d = new Date();
          $scope.user_obj.profile_bg_img = data+"?"+d.getTime();
          $("#profile_bg_img_div").load();
          $('#profileBgModal').modal('hide');
          $('#profile_bg_img').cropper('destroy');
        }).error(function(error){
          console.log("error : "+error);
        });
      }
    };

    //ID 존재하는지 확인
    $scope.id_check = function(){
      if($scope.user_obj.id.length > 0){
        var id_check_obj = {
          index : "users",
          type : "user",
          id : $scope.user_obj.id,
          element : "found",
          emit : "idExists"
        }
        socket.emit('getDocument',id_check_obj);
      }
    };
    socket.on('idExists', function(data){
      //console.log(data);
      $scope.user_obj.id_check_val = data;
    });

    //메타데이타 생성
    socket.on('metaData', function(data){
      //console.log(data);
      $scope.metadata = data;
      if($scope.user_obj.expert_type === null || $scope.user_obj.expert_type === "" ){
        $scope.user_obj.expert_type = $scope.metadata.expert_type[0];
      }
      if($scope.user_obj.location === null || $scope.user_obj.location === "" ){
        $scope.user_obj.location = $scope.metadata.location[0];
      }
      if($scope.user_obj.category_list === null || $scope.user_obj.category_list === "" || $scope.user_obj.category_list.length === 0){
        $scope.user_obj.category_list = [];
        var cate_temp = data.category;
        for(var i=0; i<cate_temp.length; i++ ){
          cate_temp[i].checked = false;
          $scope.user_obj.category_list.push(cate_temp[i]);
        }
      }
      //$scope.$apply();  //그냥은 반영 되는데 웹소켓은 바로 반영 안되서 $apply 해줘야함. //factory 하면 됨.
    });
    socket.emit('getMetaData');

    $scope.filterByCategory = function(expected, actual){
      //console.log("expected : "+expected);
      //console.log("actual : "+actual);
      if(actual !== null){
        //가입 하다가 만 경우 actual == null 나옴.
        return actual.indexOf(expected) > -1;
      }
    };

    // 로그인 사용자 객체 초기화.
    var user_init = JSON.stringify($scope.user_obj);   //$scope.user_obj의 초기 상태를 저장 해 놓기 위한 객체.

    // 로그아웃.
    $scope.logout = function(){
      $scope.login_obj.id='';
      $scope.login_obj.passwd='';
      $scope.user_obj = JSON.parse(user_init);  //JSON.stringify 하면 함수는 복사 안됨.
      $scope.user_obj.expert_type = $scope.metadata.expert_type[0];
      $scope.user_obj.location = $scope.metadata.location[0];
      delete sessionStorage["maum_login_obj"];
    };

    // 사용자 이미지 크롭
    $scope.myImage='';
    $scope.myCroppedImage='';
    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#user_photo_file')).on('change',handleFileSelect);

  });

  ctrls.controller('mainCtrl', function($scope,$http,socket) {

    socket.on('expertList', function(data){
      $scope.expertList = [];
      for(var i=0; i < data.hits.length; i++){
        //console.log(data.hits[i]._source);
        $scope.expertList.push(data.hits[i]._source);
      }
      //console.log($scope.expertList);
      //$scope.$apply();  //그냥은 반영 되는데 웹소켓은 바로 반영 안되서 $apply 해줘야함.
    });

    var search_data = {
      filter : {
        term : {
          register_done : true
        }
      }
    };
    var req_data = {
      index : "users",
      type : "user",
      emit: "expertList",
      query : search_data
    }
    socket.emit('getHits',req_data);

  });

})();
