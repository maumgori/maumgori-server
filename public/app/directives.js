(function(){
  var app = angular.module('directives',[]);

  app.directive('main',function(){
    return {
      restrict: 'E',
      templateUrl: '/partials/main',
      controller: 'mainCtrl'
    }
  });
  
})()
