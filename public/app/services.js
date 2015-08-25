(function(){

  var services = angular.module('services', []);

  services.factory('socket', function socket($rootScope) {
    //var socket = io.connect('http://'+config_obj.host + ":" +config_obj.port);
    var socket = io();  //socket.io 생성.
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        // console.log("eventName : " + eventName);
        // console.log("data : " + data);
        // console.log("callback : " + callback);
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });

})();
