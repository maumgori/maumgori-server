(function(){
  var app = angular.module('controllers',[]);

  app.controller('loginFormCtrl', function($scope,$http){
    /**
    사용자 정보 담는 객체.
    */
    $scope.user_obj = {
      signin_step : 0,
      id : '',
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
      type : 'user',
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
          var ck_validation = /^[a-z0-9_]{0,20}$/;
          if(!ck_validation.test($scope.user_obj.id)){
            data.id_class = "text-danger";
            data.id_form_class = "has-error";
            data.id_txt = "영어 소문자, 숫자, '_' 만 입력 가능합니다."
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
          console.log("result : "+data);
          $scope.user_obj.signin_step++;
          if($scope.user_obj.signin_step > 2){
            $('#signinModal').modal('hide');
          }
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      signin_step_text : function(){
        if($scope.user_obj.signin_step === 0){
          return "아이디 생성"
        } else if($scope.user_obj.signin_step === 1){
          return "개인정보 입력"
        } else if($scope.user_obj.signin_step === 2){
          return "전문분야 및 대상"
        }
      },
      user_photo : '/images/blank-user.jpg',
      upload_photo : function(){
        var form = document.getElementsByName('user_photo_frm')[0];
        var formData = new FormData(form);
        $.ajax({
           url: '/fileupload/photo',
           processData: false,
           contentType: false,
           data: formData,
           type: 'POST',
           success: function(result){
//             console.log("result: "+result);
             $scope.user_obj.user_photo = result;
             $scope.$apply();   //안하면 이미지 릴로드 안됨.
           },
           error:function(e){
            console.log(e.responseText);
          }
        });
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
      career : '',
      qualification : '',
      metadata : {},
      getMeta : function(){
        $http.get('/metadata').success(function(data){
          //console.log(data);
          $scope.user_obj.metadata = data;
        }).error(function(error){
          console.log("error : "+error);
        });
      }(),
      specialized: [],
      target: [],
      checkChecked : function(){
        $scope.user_obj.specialized = [];
        $("input[name=specialized]:checked").each(function (index) {
          $scope.user_obj.specialized.push($(this).val());
        });

        $scope.user_obj.target = [];
        $("input[name=target]:checked").each(function (index) {
          $scope.user_obj.target.push($(this).val());
        });
      },
      keyword: ''
    }

  });

  app.controller('mainCtrl', function($scope,$http) {
    $scope.expertList = [];

    $scope.getExpertList = function(){
      $http.get('/expertlist').success(function(data){
        console.log(data);
        $scope.expertList = data;
      }).error(function(error){
        console.log("error : "+error);
      });
    }();

  });

})()
