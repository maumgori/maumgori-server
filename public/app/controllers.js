(function(){
  var app = angular.module('controllers',[]);

  app.controller('loginFormCtrl', function($scope,$http){
    /**
    사용자 정보 담는 객체.
    */
    $scope.user_obj = {
      id : '',
      type : 'user',
      passwd : '',
      passwd_re : '',
      passwd_chk : function() {
        var data = {
          class : 'text-danger',
          text : '',
          id_txt : '',
          lengthtxt : '',
          id_confirmed : false,
          passwd_confirmed : false,
          confirmed : false
        }
        if($scope.user_obj.id !== '' && $scope.user_obj.id.length < 4){
          data.id_txt = "아이디는 4자리 이상 입력하세요."
        }
        // To-Do ID중복 메시지.
        if($scope.user_obj.passwd !== '' && $scope.user_obj.passwd.length < 6){
          data.lengthtxt = "비밀번호는 6자리 이상 입력하세요.";
        } else {
          data.lengthtxt = "";
        }
        if($scope.user_obj.passwd_re !== ''){
          if($scope.user_obj.passwd === $scope.user_obj.passwd_re){
            data.class = "text-primary";
            data.text = "비밀번호가 확인되었습니다.";
          } else {
            data.class = "text-danger";
            data.text = "비밀번호가 동일하지 않습니다.";
          }
        }
        // 아이디 검증. 중복 검증도 추가할 것.
        data.id_confirmed = (
          ($scope.user_obj.id.length >= 4)
        );
        // 비밀번호 검증.
        data.passwd_confirmed = (
          ($scope.user_obj.passwd.length >= 6) &&
          ($scope.user_obj.passwd_re !== '') &&
          ($scope.user_obj.passwd === $scope.user_obj.passwd_re)
        );

        data.confirmed = data.id_confirmed && data.passwd_confirmed;
        return data;
      },
      signin_step : 0,
      signin_next : function(step) {
        $scope.user_obj.signin_step = step;
        // signin 에 POST 로 데이터 전달.
        $http.post('/signin',$scope.user_obj).success(function(data){
          console.log("result : "+data);
        }).error(function(error){
          console.log("error : "+error);
        });
      },
      signin_step_text : function(){
        if($scope.user_obj.signin_step === 0){
          return "아이디 생성"
        } else if($scope.user_obj.signin_step === 1){
          return "전문가 정보 등록"
        }
      }
    }
  });

  app.controller('mainCtrl', function($scope) {

  });

})()
