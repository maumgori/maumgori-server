(function(){

  var ctrls = angular.module('controllers',['ngImgCrop','services']);

  //로그인/회원가입 컨트롤러.
  ctrls.controller('maumCtrl', function($scope,$http,socket,$state){
    var user_init = "";

    //로그인 id, pw 객체
    $scope.login_obj = {
      id : '',
      passwd : '',
      passwd_pre : '',
      passwd_pre_correct : false
    }

    // 서버에서 가져온 사용자 정보를 user_obj에 대입.
    var append_user_obj = function(data){
      //console.log(data);
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

      //카테고리 적용
      if(data.category !== null && data.category_list !== null){
        $scope.user_func.categoryCheck();
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
        index : "experts",
        type : "expert",
        emit: "expertList",
        query : search_data
      }
      socket.emit('getHits',req_data);

    }

    /**
    user_obj : 가입/로그인 사용자 정보 담는 객체. 로그인 후에 계속 사용.
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
      birth : {
        year : 1980,
        month : 1,
        day : 1
      },
      birthday : null,
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
      method_list : null,
      method : [],
      method_price_min : 0,
      method_price_max : 0
    };

    /**
    user_func : user_obj 객체를 컨트롤하는 함수를 모아놓은 객체.
    */
    $scope.user_func = {
      login : function(){
        //사용자 로그인
        var login_s_obj = {
          index : "experts",
          type : "expert",
          id : $scope.login_obj.id,
          passwd : $scope.login_obj.passwd,
          emit : "login"
        }
        socket.emit('login',login_s_obj);
      },
      logout : function(){
        $scope.login_obj.id='';
        $scope.login_obj.passwd='';
        $scope.user_obj = JSON.parse(user_init);  //JSON.stringify 하면 함수는 복사 안됨.
        $scope.user_obj.expert_type = $scope.metadata.expert_type[0];
        $scope.user_obj.location = $scope.metadata.location[0];
        delete sessionStorage["maum_login_obj"];
        socket.emit('getMetaData'); //보유자격, 활동지역, 전문분야 다시 셋팅해줘야 함.
        $state.go('login'); //로그인 후 첫 화면
      },
      id_validate_text : "",
      id_validate : function(){
        if(!$scope.user_obj.id || $scope.user_obj.id.length === 0 ){
          $scope.user_func.id_validate_text = "";
          return false;
        } else {
          if($scope.user_obj.id.length > 3){
            var ck_validation = /^[A-Za-z0-9_]{0,20}$/;
            if(ck_validation.test($scope.user_obj.id)){
              if($scope.user_obj.id_check_val){
                $scope.user_func.id_validate_text = "이미 존재하는 아이디 입니다.";
                return false;
              } else {
                $scope.user_func.id_validate_text = "사용 가능한 아이디 입니다.";
                return true;
              }
            } else {
              $scope.user_func.id_validate_text = "영어, 숫자, '_' 만 입력 가능합니다.";
              return false;
            }
          } else {
            if($scope.user_obj.id.length > 0){
              $scope.user_func.id_validate_text = "4자리 이상 입력하세요.";
            }
            return false;
          }
        }
      },
      id_check : function(){
        //아이디 존재하는지 체크.
        if($scope.user_obj.id.length > 3){
          var id_check_obj = {
            index : "experts",
            type : "expert",
            id : $scope.user_obj.id,
            element : "found",
            emit : "idExists"
          }
          socket.emit('getDocument',id_check_obj);
        }
      },
      checkPasswd : function(passwd){
        //패스워드 암호화 후 체크.
        //console.log(passwd);
        var check_passwd_obj = {
          passwd : passwd,
          emit : "passwdPreCorrect"
        }
        socket.emit('encPasswd',check_passwd_obj);
      },
      signin_before : function() {
        //이전 버튼 클릭
        $scope.user_obj.signin_step--;
      },
      temp_id : "",
      temp_passwd : "",
      signin_next : function() {
        // 다음 버튼 클릭
        // 0 step : id, passwd 저장.
        if($scope.user_obj.signin_step === 0){
          $scope.user_func.temp_id = $scope.user_obj.id;
          $scope.user_func.temp_passwd = $scope.user_obj.passwd;
        }
        if($scope.user_obj.signin_step === ($scope.user_obj.signin_step_text.length-1)){
          $scope.user_obj.register_done = true;
        }
        var req_data = {
          index : "experts",
          type : "expert",
          emit: "insertExpertRes",
          user_obj : $scope.user_obj
        }
        socket.emit('insertExpert',req_data);
      },
      upload_photo : function(){
        //console.log($scope.user_obj.user_photo_data);
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
      birth_option : {
        years : null,
        months : [1,2,3,4,5,6,7,8,9,10,11,12],
        days : null,
        onChange : function(){
          //달 선택시 일 변경. 윤달 로직 적용.
          var this_month = Number($scope.user_obj.birth.month);
          if(this_month === 2){
            if( (Number($scope.user_obj.birth.year) % 4 === 0) &&
                (Number($scope.user_obj.birth.year) % 100 !== 0) ||
                (Number($scope.user_obj.birth.year) % 400 === 0)
            ){
              $scope.user_func.birth_option.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
            } else {
              $scope.user_func.birth_option.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
            }
          } else if (this_month === 4 || this_month === 6 || this_month === 9 || this_month === 11){
            $scope.user_func.birth_option.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
          } else {
            $scope.user_func.birth_option.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
          }
          //표준 시로 저장.
          $scope.user_obj.birthday = new Date(Date.UTC(Number($scope.user_obj.birth.year),Number($scope.user_obj.birth.month)-1,Number($scope.user_obj.birth.day)));
          //console.log($scope.user_obj.birthday);
        },
        init : function(){
          $scope.user_func.birth_option.years = new Array(100);
          for(var i=0; i < 100; i++){
            $scope.user_func.birth_option.years[i] = (new Date()).getFullYear()-i;
          }
        }
      },
      categoryCheck : function(){
        $scope.user_obj.category = [];
        for(var i=0; i<$scope.user_obj.category_list.length; i++){
          if($scope.user_obj.category_list[i].checked){
            $scope.user_obj.category.push($scope.user_obj.category_list[i].name);
          }
        }
      },
      methodCheck : function(){
        $scope.user_obj.method = [];
        var method_price_arr = [];
        for(var i=0; i<$scope.user_obj.method_list.length; i++){
          if($scope.user_obj.method_list[i].checked){
            $scope.user_obj.method.push($scope.user_obj.method_list[i].name);
            method_price_arr.push($scope.user_obj.method_list[i].price);
            //console.log(method_price_arr+""); // +"" 안하면 기존 출력된 녀석들도 바뀜.
          }
        }
        method_price_arr.sort(function(a, b){return a-b}); //function()... 안 하면 string 기준으로 소팅함.
        //console.log(method_price_arr);
        $scope.user_obj.method_price_min = method_price_arr[0];
        $scope.user_obj.method_price_max = method_price_arr[method_price_arr.length-1];
      },
      profileBgImgUpload : function(){
        $('#bntBgImgSave').attr('disabeld',true);
        var bgCanvas = $('#profile_bg_img').cropper('getCroppedCanvas');
        //console.log(bgCanvas.toDataURL());

        //이미지 640x320 으로 리사이즈
        var finalImageResize  = "";
        var tmp_canvas = document.getElementById('tmp_canvas');
        tmp_canvas.width= 640;
        tmp_canvas.height = 320;
        var context2 = tmp_canvas.getContext("2d");
        var tmp_image = document.getElementById("tmp_image");
        tmp_image.src = bgCanvas.toDataURL();
        tmp_image.onload = function() {
          context2.drawImage(tmp_image, 0, 0, 640, 320);
          finalImageResize = tmp_canvas.toDataURL("image/jpeg", 0.8);
          var photoData = {
            photo : finalImageResize,
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
        };
      }
    };

    //사용자 저장 후 처리.
    socket.on('insertExpertRes',function(data){
      toastr.success('사용자 정보가 저장되었습니다.', '저장 완료');
      append_user_obj(data);
      if($scope.user_obj.signin_step === ($scope.user_obj.signin_step_text.length-1)){
        //마지막 단계인 경우. login_id, passwd 임시저장 했으면 로그인 진행.
        if($scope.user_func.temp_id !== "" && $scope.user_func.temp_passwd !== ""){
          $scope.login_obj.id = $scope.user_func.temp_id;
          $scope.login_obj.passwd = $scope.user_func.temp_passwd;
          $scope.user_func.login();
        }
        $('#signinModal').modal('hide');
      } else {
        $scope.user_obj.signin_step++;
      }
      //console.log(data);
    });

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

    //ID 존재하는지 확인. $scope.user_obj.id_check_val 값을 true / false 로 셋팅.
    socket.on('idExists', function(data){
      //console.log(data);
      $scope.user_obj.id_check_val = data;
    });

    //메타데이타 생성
    socket.on('metaData', function(data){
      //console.log(data);
      $scope.metadata = data;
      //보유자격
      if($scope.user_obj.expert_type === null || $scope.user_obj.expert_type === "" ){
        $scope.user_obj.expert_type = $scope.metadata.expert_type[0];
      }
      //활동지역
      if($scope.user_obj.location === null || $scope.user_obj.location === "" ){
        $scope.user_obj.location = $scope.metadata.location[0];
      }
      //전문분야
      if($scope.user_obj.category_list === null || $scope.user_obj.category_list === "" || $scope.user_obj.category_list.length === 0){
        $scope.user_obj.category_list = [];
        var cate_temp = data.category;
        for(var i=0; i<cate_temp.length; i++ ){
          $scope.user_obj.category_list.push(cate_temp[i]);
        }
      }
      //서비스 비용
      if($scope.user_obj.method_list === null || $scope.user_obj.method_list === "" || $scope.user_obj.method_list.length === 0){
        $scope.user_obj.method_list = [];
        var method_temp = data.method;
        for(var i=0; i<method_temp.length; i++ ){
          $scope.user_obj.method_list.push(method_temp[i]);
        }
        $scope.user_func.methodCheck();
      }
    });

    //로그인
    socket.on('login', function(data){
      //console.log(data);
      if(!data.idExist){
        toastr.error('존재하지 않는 아이디입니다.', '로그인 실패');
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
          //login_obj 세션에 저장.
          sessionStorage["maum_login_obj"] = JSON.stringify($scope.login_obj);
          $state.go('main_page'); //로그인 후 첫 화면
        }
      }
    });
    //세션 체크해서 로그인.
    if(sessionStorage["maum_login_obj"]){
      //console.log(sessionStorage["maum_login_obj"]);
      var login_session = JSON.parse(sessionStorage["maum_login_obj"]);
      //console.log(login_session);
      $scope.login_obj = login_session;
      $scope.user_func.login();
    }

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

    //최초 로딩 후 실행.
    socket.emit('getMetaData'); //메타데이타 호출.
    $scope.user_func.birth_option.init(); //생년월일 입력 폼 초기화.
    $scope.user_func.birth_option.onChange(); //생년월일 입력 폼 초기값 적용.
    user_init = JSON.stringify($scope.user_obj);  // 로그인 사용자 객체 초기 상태 저장.

  });

  ctrls.controller('menuCtrl', function($scope,socket,$state){
    $scope.menu_val = '';
    $scope.goto = function(menu_1,menu_2){
      if(menu_2){
        $state.go(menu_1+"/"+menu_2,menu_1);
      } else {
        $state.go(menu_1,menu_1);
      }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      // console.log(event);
      // console.log(toState);
      // console.log(toParams);
      // console.log(fromState);
      // console.log(fromParams);
      $scope.menu_val = toState.name.split('/')[0];
    });

  });

})();
