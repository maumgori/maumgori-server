(function(){
  var directives = angular.module('directives',[]);

  directives.directive('loginForm', function(){
    return {
      restrict: 'E',
      templateUrl: 'partials/loginForm',
      controller: 'loginFormCtrl'
    }
  });

  directives.directive('main', function(){
    return {
      restrict: 'E',
      templateUrl: 'partials/main',
      controller: 'mainCtrl'
    }
  });

})()
