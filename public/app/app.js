(function(){
  var app = angular.module('app', []);

  app.directive('main',function(){
    return {
      restrict: 'E',
      templateUrl: '/conts/main',
      controller: 'mainCtrl'
    }
  });

  app.controller('mainCtrl', function($scope) {
    $scope.myVar = "Hello Angular";
  });
  
})();
