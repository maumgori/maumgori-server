(function(){
  var app = angular.module('app', ['controllers','ui.router']);

  app.config(function($stateProvider, $urlRouterProvider){

    var appSocket = io();  //socket.io 생성.
    appSocket.on('renderMenu',function(data){
      //console.log(data.expert_menu);
      var menu_lv_1 = data.expert_menu;

      for(var i=0; i< menu_lv_1.length; i++){
        if( !(typeof(menu_lv_1[i].sub_menues) === "undefined" || menu_lv_1[i].sub_menues === null) ){
          var menu_lv_2 = menu_lv_1[i].sub_menues;
          for(var j=0; j< menu_lv_2.length; j++){
            //console.log("/"+menu_lv_1[i].id+"/"+menu_lv_2[j].id);
            if(menu_lv_2[j].id !== 'devider'){
              $stateProvider.state(menu_lv_1[i].id+"/"+menu_lv_2[j].id, {
                url: "/"+menu_lv_1[i].id+"/"+menu_lv_2[j].id,
                views : {
                  "nav" : {
                    templateUrl: "nav/navbar",
                    controller: "menuCtrl"
                  },
                  "profile" : {
                    templateUrl: "partials/profile",
                    controller: 'profileCtrl'
                  },
                  "page" : {
                    templateUrl: "pages/"+menu_lv_1[i].id+"/"+menu_lv_2[j].id
                  }
                }
              });
            }
          }
        } else {
          //console.log("/"+menu_lv_1[i].id);
          $stateProvider.state(menu_lv_1[i].id, {
            url: "/"+menu_lv_1[i].id,
            views : {
              "nav" : {
                templateUrl: "nav/navbar",
                controller: "menuCtrl"
              },
              "profile" : { templateUrl: "partials/profile",
                controller: 'profileCtrl'
              },
              "page" : {
                templateUrl: "pages/"+menu_lv_1[i].id
              }
            }
          });
        }
      }

    });

    $stateProvider.state("login", {
      url: "/login",
      views : {
        "init" : {
          templateUrl: "partials/init",
          controller: "indexCtrl"
        }
      }
    });

    $stateProvider.state("signin", {
      url: "/signin",
      views : {
        "init" : {
          templateUrl: "signin/signin",
          controller: "signinCtrl"
        }
      }
    });

    $stateProvider.state("error", {
      url: "/error",
      views : {
        "error" : { templateUrl: "partials/error" }
      }
    });

    $urlRouterProvider.otherwise("login");


  });


})();
