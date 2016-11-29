/**
 *            app
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers', []);
angular.module('PartOrderApp.Components', []);
angular.module('PartOrderApp.Directives', []);
angular.module('PartOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('PartOrderApp', [
  'PartOrderApp.Controllers',
  'PartOrderApp.Components',
  'PartOrderApp.Directives',
  'PartOrderApp.Services'
]);

angular.module('PartOrderApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider

    .when('/partorder', {
      needsLogin: true,
      controller: 'PartOrderCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poOverview.html'/*,
      resolve: {
        partorders: function($route, $q, PartOrders){
         var deferred = $q.defer();
         PartOrders.query({},
           function (response){ return deferred.resolve(response); },
           function (err) { return deferred.reject(err); }
         );
         return deferred.promise;
         }
      }*/
    })
    .when('/partorder/review/:id',{
      needsLogin: true,
      controller: 'PartOrderReviewCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poReview.html',
      resolve: {
        /*partorder: function ($route, $q, PartOrders) {
          var id = $route.current.params.id || 0;
          var deferred = $q.defer();
          if (id) {
            PartOrders.get({id: id},
              function (res) { return deferred.resolve(res); },
              function (err) { return deferred.reject(err); });
          } else { return null; }
          return deferred.promise;
        },*/
        locations: function($route, $q, Locations){
          var deferred = $q.defer();
          Locations.query({},
            function (response){ return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
      }
    })
    .when('/partorder/edit/:id',{
      needsLogin: true,
      controller: 'PartOrderEditCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poEdit.html',
      resolve: {
        /*partorder: function ($route, $q, PartOrders) {
         var id = $route.current.params.id || 0;
         var deferred = $q.defer();
         if (id) {
           PartOrders.get({id: id},
             function (res) { return deferred.resolve(res); },
             function (err) { return deferred.reject(err); });
         } else { return null; }
          return deferred.promise;
         },
        locations: function($route, $q, Locations){
          var deferred = $q.defer();
          Locations.query({},
            function (res){ return deferred.resolve(res); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }*/
      }
    })
    .when('/partorder/create',{
      needsLogin: true,
      controller: 'PartOrderCreateCtrl',
      templateUrl: '/lib/public/angular/apps/partorder/views/poCreate.html',
      resolve: {
        partorders: function($route, $q, PartOrders){
           var deferred = $q.defer();
           PartOrders.query({},
             function (response){ return deferred.resolve(response); },
             function (err) { return deferred.reject(err); }
           );
           return deferred.promise;
         },
        parts: function ($route, $q, Parts) {
          var deferred = $q.defer();
          Parts.query({},
            function (response){ return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        },
        locations: function($route, $q, Locations){
          var deferred = $q.defer();
          Locations.query({},
            function (response){ return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
      }
    })
  }
]);

angular.module('PartOrderApp')
.run(['$route', '$rootScope', '$location',
  function($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function(path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function() {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };
  }
]);

