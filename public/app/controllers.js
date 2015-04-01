(function(){

  var socket = io();  //socket.io 생성.

  var app = angular.module('controllers',['ngImgCrop']);

  app.controller('loginFormCtrl', function($scope,$http){

    //로그인 id, pw 객체
    $scope.login_obj = {
      id : '',
      passwd : '',
      login : function(){
        //사용자 로그인
        $http.post('/login',$scope.login_obj).success(function(data){
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
            }
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      passwd_pre : '',
      checkPasswd : function(){
        $http.post('/encpasswd',$scope.login_obj).success(function(data){
          //console.log(data);
          if(!data.passwd_pre_enc){
            $scope.login_obj.passwd_pre_correct = false;
          } else {
            if(data.passwd_pre_enc === $scope.user_obj.passwd_enc){
              //console.log("패스워드 일치.")
              $scope.login_obj.passwd_pre_correct = true;
            } else {
              $scope.login_obj.passwd_pre_correct = false;
            }
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      passwd_pre_correct : false
    }

    // 서버에서 가져온 사용자 정보를 user_obj에 대입.
    var append_user_obj = function(data){
//      console.log(data);
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
      if(data.category !== null){
        $("input[name=category]").each(function (index) {
          if(data.category.indexOf($(this).val()) > -1)
            $(this).attr("checked", true);
        });
        $scope.user_obj.checkChecked();
      }
      var search_data = {};
      socket.emit('getExpertList',search_data);
    }

    /**
    user_obj : 가입/로그인 사용자 정보 담는 객체.
    */
    $scope.user_obj = {
      is_loggedin : false,
      signin_step : 0,
      id : '',
      id_created : false,
      id_check : function(){
        if($scope.user_obj.id.length > 0){
          $http.get('/users/'+$scope.user_obj.id).success(function(data){
            $scope.user_obj.id_check_val = data;
          }).error(function(error){
            console.log("error : "+error);
          });
        }
      },
      id_check_val : false,
      type : 'expert',
      passwd : '',
      passwd_re : '',
      passwd_enc : '',
      passwd_pre : '',
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
      signin_next : function() {
        // /signin 에 POST 로 user_obj 데이터 전달.
        $http.post('/signin',$scope.user_obj).success(function(data){
          toastr.success('사용자 정보가 저장되었습니다.', '저장 완료');
          append_user_obj(data);
          if($scope.user_obj.signin_step === ($scope.user_obj.signin_step_text.length-1)){
            $scope.user_obj.is_loggedin = true;
            $('#signinModal').modal('hide');
          } else {
            $scope.user_obj.signin_step++;
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      signin_step_text : ["아이디 생성","개인 정보","전문 분야","소개","비용 입력"],
      user_photo : '/images/blank-user.jpg',
      user_photo_data : '',
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
      name : '',
      gender : 'male',
      birthday : {
        year : ((new Date()).getFullYear()-25),
        month : 1,
        day : 1
      },
      age : 0,
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
      category: null,
      category_ischecked: null,
      checkChecked : function(){
        $scope.user_obj.category = [];
        $scope.user_obj.category_ischecked = [];
        $("input[name=category]:checked").each(function (index) {
          $scope.user_obj.category.push($(this).val());
        });
        //3개까지만 체크하기 위해 체크여부 담겨있는 배열 생성.
        $("input[name=category]").each(function (index) {
          $scope.user_obj.category_ischecked.push($(this).is(":checked"));
        });
      },
      expert_type : '',
      location : '',
      career : '',
      activity: '',
      profile_title : '',
      profile_text : '',
      proflie_txt_color : false,
      proflie_txt_location : 'top',
      profile_bg_img : '/images/profile_background.jpg',
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
      },
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

    //메타데이타 생성
    $scope.metadata = {};
    socket.on('metaData', function(data){
      console.log(data);
      $scope.user_obj.expert_type = data.expert_type[0];
      $scope.user_obj.location = data.location[0];
      $scope.metadata = data;
      $scope.$apply();  //그냥은 반영 되는데 웹소켓은 바로 반영 안되서 $apply 해줘야함.
    });
    socket.emit('getMetaData');
    
    /*
    var getMeta = function(){
      $http.get('/metadata').success(function(data){
        //console.log(data);
        //전문자격 값 설정.
        $scope.user_obj.expert_type = data.expert_type[0];
        $scope.user_obj.location = data.location[0];
        $scope.metadata = data;
      }).error(function(error){
        console.log("error : "+error);
      });
    };
    */

    // 로그인 사용자 객체 초기화.
    var user_init = {};   //$scope.user_obj의 초기 상태를 저장 해 놓기 위한 객체.
    angular.copy($scope.user_obj, user_init);

    // 로그아웃.
    $scope.clear_user = function(){
      $scope.login_obj.id='';
      $scope.login_obj.passwd='';
      angular.copy(user_init,$scope.user_obj);
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

  app.controller('mainCtrl', function($scope,$http) {
    $scope.expertList = [];

    socket.on('expertList', function(data){
      //console.log(data);
      $scope.expertList = data;
      $scope.$apply();  //그냥은 반영 되는데 웹소켓은 바로 반영 안되서 $apply 해줘야함.
    });

    var search_data = {}; //나중에 Elastcisearch 검색 쿼리 입력.
    socket.emit('getExpertList',search_data);

  });

})()
