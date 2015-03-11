(function(){
  var app = angular.module('controllers',[]);

  app.controller('loginFormCtrl', function($scope,$http){
    /**
    사용자 정보 담는 객체.
    */
    $scope.user_obj = {
      signin_step : 1,
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
      type : 'expert',
      passwd : '',
      passwd_re : '',
      step_0_chk : function() {
        var data = {
          class : 'text-danger',
          text : '',
          id_class : 'text-danger',
          id_txt : '',
          lengthtxt : '',
          id_confirmed : false,
          passwd_confirmed : false,
          confirmed : false
        }

        // 아이디 검증.
        if($scope.user_obj.id === ''){
          data.id_class = "";
          data.id_txt = ""
          data.id_confirmed = false;
        } else {
          var ck_validation = /^[a-z0-9_]{0,20}$/;
          if(!ck_validation.test($scope.user_obj.id)){
            data.id_class = "text-danger";
            data.id_txt = "영어 소문자, 숫자, '_' 만 입력 가능합니다."
            data.id_confirmed = false;
          } else {
            if($scope.user_obj.id.length < 4){
              data.id_class = "text-danger";
              data.id_txt = "4자리 이상 입력하세요."
              data.id_confirmed = false;
            } else {
              if($scope.user_obj.id_check_val){
                data.id_class = "text-danger";
                data.id_txt = "이미 존재하는 아이디 입니다."
                data.id_confirmed = false;
              } else {
                data.id_class = "text-primary";
                data.id_txt = "사용 가능한 아이디 입니다."
                data.id_confirmed = true;
              }
            }
          }
        }

        // 비밀번호 검증.
        if($scope.user_obj.passwd === ''){
          data.class = "";
          data.lengthtxt = "";
          data.text = "";
          data.passwd_confirmed = false;
        } else {
          if($scope.user_obj.passwd.length < 6){
            data.lengthtxt = "비밀번호는 6자리 이상 입력하세요.";
            data.passwd_confirmed = false;
          } else {
            if($scope.user_obj.passwd_re === ''){
              data.class = "";
              data.text = "";
              data.passwd_confirmed = false;
            } else {
              if($scope.user_obj.passwd === $scope.user_obj.passwd_re){
                data.class = "text-primary";
                data.text = "비밀번호가 확인되었습니다.";
                data.passwd_confirmed = true;
              } else {
                data.class = "text-danger";
                data.text = "비밀번호가 동일하지 않습니다.";
                data.passwd_confirmed = false;
              }
            }
          }
        }

        data.confirmed = data.id_confirmed && data.passwd_confirmed;
        return data;
      },
      signin_before : function() {
        $scope.user_obj.signin_step--;
      },
      signin_next : function() {
        // /signin 에 POST 로 user_obj 데이터 전달.
        $http.post('/signin',$scope.user_obj).success(function(data){
          $scope.user_obj.signin_step++;
          console.log("result : "+data);
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      signin_step_text : function(){
        if($scope.user_obj.signin_step === 0){
          return "아이디 생성"
        } else if($scope.user_obj.signin_step === 1){
          return "개인정보 입력"
        }
      },
      user_photo : null,
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

    }
  });

  app.controller('mainCtrl', function($scope) {

  });

})()
