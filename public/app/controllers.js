(function(){

  var ctrls = angular.module('controllers',['ngImgCrop','services']);

  //메인 화면 사용자 정보 컨트롤러.
  ctrls.controller('profileCtrl', function($rootScope,$scope,$state,socket){

    //정상적으로 로그인 되었는지 체크. 정상적이지 않으면 오류 화면으로 이동.
    if(sessionStorage["maum_login_signin_obj"]){
      $rootScope.user_obj = JSON.parse(sessionStorage["maum_login_signin_obj"]);
      $rootScope.user_obj.passwd_enc = $rootScope.user_obj.passwd;
    } else {
      $state.go('error');
    }


    $scope.user_func = {
      logout : function(){
        delete sessionStorage["maum_login_signin_obj"];
        delete sessionStorage["maum_login_id"];
        delete sessionStorage["maum_login_passwd"];
        $state.go('login');
      }
    }

  });

  //처음 화면 컨트롤러.
  ctrls.controller('indexCtrl', function($rootScope,$scope,$state,socket){
    $rootScope.login_obj = {
      id : '',
      passwd : ''
    }

    //console.log("id : "+sessionStorage["maum_login_id"]);
    //console.log("passwd : "+sessionStorage["maum_login_passwd"]);
    if(localStorage["maum_login_id_cookie"]){
      $rootScope.login_obj.id = localStorage["maum_login_id_cookie"];
      $rootScope.local_id_cookie = true;
    }

    //세션 존재하면 자동 로그인.
    delete sessionStorage["maum_login_signin_obj"];
    if(sessionStorage["maum_login_id"] && sessionStorage["maum_login_passwd"]){
      $rootScope.login_obj.id=sessionStorage["maum_login_id"];
      $rootScope.login_obj.passwd=sessionStorage["maum_login_passwd"];

      var login_s_obj = {
        index : "experts",
        type : "expert",
        id : $rootScope.login_obj.id,
        passwd : $rootScope.login_obj.passwd,
        emit : "login"
      }
      socket.emit('login',login_s_obj);
    }

    $scope.login = function(){
      var login_s_obj = {
        index : "experts",
        type : "expert",
        id : $rootScope.login_obj.id,
        passwd : $rootScope.login_obj.passwd,
        emit : "login"
      }
      //console.log(login_s_obj);
      socket.emit('login',login_s_obj);
    }


  });

  //회원가입 화면 컨트롤러.
  ctrls.controller('signinCtrl', function($rootScope,$scope,$http,$state,socket){

    //회원 정보 객체. 원래 common 에 놓아야 하는데 여기가 사용 제일 많이 하니까 여기에 놓음.
    $rootScope.user_obj = {
      signin_step : 0,
      type : 'expert',
      id : '',
      passwd : '',
      passwd_enc : '',
      user_photo : '/images/blank-user.jpg',
      name : '',
      gender : 'male',
      birthday : null,
      phone : ["",""],
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
    }

    //회원가입 완료 되지 않았으면 추가정보 입력 화면으로 이동.
    if(sessionStorage["maum_login_signin_obj"]){
      $scope.user_obj = JSON.parse(sessionStorage["maum_login_signin_obj"]);
      $scope.user_obj.passwd_enc = $scope.user_obj.passwd;
      //세션값들 삭제.
      delete sessionStorage["maum_login_id"];
      delete sessionStorage["maum_login_passwd"];
    }

    //회원가입 시 검증 플래그들 모음 객체.
    $rootScope.signin_params = {
      is_loggedin : false,
      register_done : false,
      id_check_val : false,
      id_validate_text : "",
      passwd_check_val : false,
      passwd_re_check_val : false,
      passwd_re : '',
      email_check_val : false,
      user_photo_data : '',
    }

    //회원가입 함수 모음 객체.
    $rootScope.signin_func = {
      go_next : function(){
        $('html,body').scrollTop(0);
        $scope.user_obj.signin_step++;
      },
      id_check : function(){
        //아이디 존재하는지 체크.
        if(!$scope.user_obj.id || $scope.user_obj.id.length === 0 ){
          $scope.signin_params.id_validate_text = "";
          $scope.signin_params.id_check_val = false;
        } else {
          if($scope.user_obj.id.length > 3){
            var ck_validation = /^[A-Za-z0-9_]{0,20}$/;
            if(ck_validation.test($scope.user_obj.id)){
              var id_check_obj = {
                index : "experts",
                type : "expert",
                id : $scope.user_obj.id,
                element : "found",
                emit : "idExists"
              }
              socket.emit('getDocument',id_check_obj);
            } else {
              $scope.signin_params.id_validate_text = "영어, 숫자, '_' 만 입력 가능합니다.";
              $scope.signin_params.id_check_val = false;
            }
          } else {
            if($scope.user_obj.id.length > 0){
              $scope.signin_params.id_validate_text = "4자리 이상 입력하세요.";
            }
            $scope.signin_params.id_check_val = false;
          }
        }
      },
      passwd_check : function(){
        if($scope.user_obj.passwd.length > 5){
          $scope.signin_params.passwd_check_val = true;
        } else {
          $scope.signin_params.passwd_check_val = false;
        }

        if($scope.user_obj.passwd === $scope.signin_params.passwd_re){
          $scope.signin_params.passwd_re_check_val = true;
        } else {
          $scope.signin_params.passwd_re_check_val = false;
        }
      },
      form_save : function(){
        var req_data = {
          index : "experts",
          type : "expert",
          emit: "insertExpertRes",
          user_obj : $scope.user_obj
        }
        socket.emit('insertExpert',req_data);
      },
      login_init : function(){
        if($scope.user_obj.id && $scope.user_obj.passwd){
          sessionStorage["maum_login_id"] = $scope.user_obj.id;
          sessionStorage["maum_login_passwd"] = $scope.user_obj.passwd;
        }
        //location.replace("/");
        $state.go('login');
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
      categoryCheck : function(){
        $scope.user_obj.category = [];
        for(var i=0; i<$scope.user_obj.category_list.length; i++){
          if($scope.user_obj.category_list[i].checked){
            $scope.user_obj.category.push($scope.user_obj.category_list[i].name);
          }
        }
      },
      add_save_temp : function(){
        var req_data = {
          index : "experts",
          type : "expert",
          emit: "insertExpertAddRes",
          user_obj : $scope.user_obj
        }
        socket.emit('insertExpert',req_data);
      },
      add_save : function(){
        if(confirm("추가 정보 입력을 완료하시겠습니까? 승인이 완료 될 때 까지 정보를 수정할 수 없습니다.")){
          $scope.user_obj.signin_step++;
          $scope.signin_func.add_save_temp();
        }
      },
      add_logout : function(){
        if(confirm("로그아웃 하시겠습니까? 작성중인 내용은 지워집니다.")){
          //location.replace("/");
          $state.go('login');
        }
      },
      add_complete_logout : function(){
        //location.replace("/");
        $state.go('login');
      },
      upload_photo : function(){
        //console.log($scope.user_obj.user_photo_data);
        var photoData = {
          photo : $scope.signin_params.user_photo_data,
          id : $scope.user_obj.id
        };
        $http.post('/fileupload/photo',photoData).success(function(data){
          //console.log("result : "+data);
          $scope.user_obj.user_photo = data+"?"+new Date().getTime(); //뒤에 이런식으로 파라메터 붙여놔야 이미지 리프레시 됨.
          $('#imgUploadModal').modal('hide');
        }).error(function(error){
          console.log("error : "+error);
        });
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

    //user_obj 출력.
    $scope.print_obj = function(){
      console.log($scope.user_obj);
    };
    //롤백
    $scope.obj_rollback = function(){
      $scope.user_obj.signin_step--;
      var req_data = {
        index : "experts",
        type : "expert",
        emit: "insertExpertAddRes",
        user_obj : $scope.user_obj
      }
      socket.emit('insertExpert',req_data);
    };
    //승인
    $scope.obj_approve = function(){
      $scope.user_obj.signin_step++;
      var req_data = {
        index : "experts",
        type : "expert",
        emit: "insertExpertAddRes",
        user_obj : $scope.user_obj
      }
      socket.emit('insertExpert',req_data);
    };

    //메타데이터 셋팅.
    socket.emit('getMetaData');

    //사용자 프로필 이미지 크롭 기능.
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

  //공통 변수 및 소켓들 여기에 넣기. 안그러면 소켓 emit 중복 실행됨.
  ctrls.controller('commonCtrl', function($rootScope,$state,socket){

    //소켓 오류 출력.
    socket.on('error',function(error){
      console.log(error);
    });

    //로그인
    socket.on('login', function(data){
      //console.log(data);
      if($rootScope.local_id_cookie){
        localStorage["maum_login_id_cookie"] = $rootScope.login_obj.id;
      } else {
        delete localStorage["maum_login_id_cookie"];
      }

      if(!data.idExist){
        toastr.error('존재하지 않는 아이디입니다.', '로그인 실패');
        delete sessionStorage["maum_login_id"];
        delete sessionStorage["maum_login_passwd"];
      } else {
        if(!data.correctPasswd){
          toastr.error('패스워드가 일치하지 않습니다.', '로그인 실패');
          delete sessionStorage["maum_login_id"];
          delete sessionStorage["maum_login_passwd"];
        } else {
          //console.log(data.user_obj);
          sessionStorage["maum_login_id"] = $rootScope.login_obj.id;
          sessionStorage["maum_login_passwd"] = $rootScope.login_obj.passwd;

          //console.log(data.user_obj.signin_step);

          if(data.user_obj.signin_step > 4){
            sessionStorage["maum_login_signin_obj"] = JSON.stringify(data.user_obj);
            //location.replace("/main");
            $state.go('main_page');
          } else {
            if(data.user_obj.signin_step < 3 ){
              data.user_obj.signin_step = 3;
            }
            sessionStorage["maum_login_signin_obj"] = JSON.stringify(data.user_obj);
            //location.replace("/signin");
            $state.go('signin');
          }
        }
      }
    });

    //아이디 체크.
    socket.on('idExists', function(data){
      //console.log(data);
      if(data){
        $rootScope.signin_params.id_validate_text = "이미 존재하는 아이디 입니다.";
        $rootScope.signin_params.id_check_val = false;
        //return false;
      } else {
        $rootScope.signin_params.id_validate_text = "사용 가능한 아이디 입니다.";
        $rootScope.signin_params.id_check_val = true;
        //return true;
      }
    });

    //회원가입 정보 저장.
    socket.on('insertExpertRes',function(data){
      toastr.success('사용자 정보가 저장되었습니다.', '저장 완료');
      $rootScope.signin_func.go_next();
      //console.log(data);
    });

    //회원가입 추가정보 저장.
    socket.on('insertExpertAddRes',function(data){
      toastr.success('사용자 정보가 저장되었습니다.', '저장 완료');
      sessionStorage["maum_login_signin_obj"] = JSON.stringify($rootScope.user_obj);
      //console.log(data);
    });

    //회원가입 추가정보 입력 화면 : 메타데이터 셋팅.
    socket.on('metaData', function(data){
      //console.log(data);
      $rootScope.metadata = data;
      //보유자격
      if($rootScope.user_obj.expert_type === null || $rootScope.user_obj.expert_type === "" ){
        $rootScope.user_obj.expert_type = $rootScope.metadata.expert_type[0];
      }
      //활동지역
      if($rootScope.user_obj.location === null || $rootScope.user_obj.location === "" ){
        $rootScope.user_obj.location = $rootScope.metadata.location[0];
      }
      //전문분야
      if($rootScope.user_obj.category_list === null || $rootScope.user_obj.category_list === "" || $rootScope.user_obj.category_list.length === 0){
        $rootScope.user_obj.category_list = [];
        var cate_temp = data.category;
        for(var i=0; i<cate_temp.length; i++ ){
          $rootScope.user_obj.category_list.push(cate_temp[i]);
        }
      }
      //서비스 비용
      if($rootScope.user_obj.method_list === null || $rootScope.user_obj.method_list === "" || $rootScope.user_obj.method_list.length === 0){
        $rootScope.user_obj.method_list = [];
        var method_temp = data.method;
        for(var i=0; i<method_temp.length; i++ ){
          $rootScope.user_obj.method_list.push(method_temp[i]);
        }
        $rootScope.signin_func.methodCheck();
      }
    });

  });

})();
