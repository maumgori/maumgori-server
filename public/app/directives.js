(function(){
  var app = angular.module('directives',[]);

  app.directive('loginForm', function(){
    return {
      restrict: 'E',
      templateUrl: 'partials/loginForm',
      controller: 'loginFormCtrl'
    }
  });

  app.directive('main', function(){
    return {
      restrict: 'E',
      templateUrl: 'partials/main',
      controller: 'mainCtrl'
    }
  });

})()
