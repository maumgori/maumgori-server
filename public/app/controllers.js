(function(){
  var app = angular.module('controllers',['ngImgCrop']);

  app.controller('loginFormCtrl', function($scope,$http){

    $scope.login_obj = {
      id : '',
      passwd : '',
      login : function(){
        //사용자 로그인
        $http.post('/login',$scope.login_obj).success(function(data){
          if(!data.idExist){
            alert("존재하지 않는 아이디입니다.");
          } else {
            if(!data.correctPasswd){
              alert("패스워드가 일치하지 않습니다.");
            } else {
              var obj_keys = ["signin_step","id","type","passwd","user_photo","name","gender","age","phone","email","homepage"];
              for(var i=0; i < obj_keys.length; i++){
                $scope.user_obj[obj_keys[i]] = data.user_obj[obj_keys[i]];
              }
              //생년월일도 추가해야 하는데, 좀 고민해볼것.
              //console.log(data);
              //console.log($scope.user_obj);
              $scope.user_obj.passwd_re = data.user_obj.passwd;
              $scope.user_obj.id_created = true;
              $scope.user_obj.is_loggedin = true;
            }
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      }
    }

    /**
    user_obj : 회원 가입 정보 담는 객체.
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
          if($scope.user_obj.signin_step > 2){
            $('#signinModal').modal('hide');
          } else {
            if($scope.user_obj.id !== ''){
              $scope.user_obj.id_created = true;
            }
            $scope.user_obj.signin_step++;
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      signin_step_text : function(){
        if($scope.user_obj.signin_step === 0){
          return "아이디 생성"
        } else if($scope.user_obj.signin_step === 1){
          return "개인 정보"
        } else if($scope.user_obj.signin_step === 2){
          return "전문 분야"
        }
      },
      user_photo : '/images/blank-user.jpg',
      user_photo_data : '',
      upload_photo : function(){
//        console.log($scope.user_obj.user_photo_data);
        var photoData = {
          photo : $scope.user_obj.user_photo_data,
          id : $scope.user_obj.id
        };
        $http.post('/fileupload/photo',photoData).success(function(data){
          console.log("result : "+data);
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
      metadata : {},
      getMeta : function(){
        $http.get('/metadata').success(function(data){
          //console.log(data);
          //전문자격 값 설정.
          $scope.user_obj.expert_type = data.expert_type[0];
          $scope.user_obj.location = data.location[0];
          $scope.user_obj.metadata = data;
        }).error(function(error){
          console.log("error : "+error);
        });
      },
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
      activity: ''
    };
    //생성 이후에 실행 해야 실행되는 것들도 있음.
    $scope.user_obj.getMeta();

    // 로그인 사용자 객체 초기화.
    angular.copy($scope.user_obj,$scope.user_init);
    var clear_user = function(){
      $scope.user_obj = $scope.user_init;
    };

    // 이미지 크롭
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

    $scope.getExpertList = function(){
      $http.get('/expertlist').success(function(data){
        //console.log(data);
        $scope.expertList = data;
      }).error(function(error){
        console.log("error : "+error);
      });
    }();

  });

})()
