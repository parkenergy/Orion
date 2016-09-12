angular.module('WorkOrderApp.Controllers', []);
angular.module('WorkOrderApp.Directives', []);
angular.module('WorkOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('WorkOrderApp', [
  'WorkOrderApp.Controllers',
  'WorkOrderApp.Directives',
  'WorkOrderApp.Services'
]);


angular.module('WorkOrderApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/workorder/resumeorcreate', {
    needsLogin: true,
    controller: 'WorkOrderResumeOrCreateCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        WorkOrders.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        //determine if we're creating or editing a workorder.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          WorkOrders.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id || 0;
        if(id){
          var deferred = $q.defer();
          ReviewNotes.query(
            {workOrder: id},
            function (response){return deferred.resolve(response);},
            function (err){return deferred.reject(err);}
          );
          return deferred.promise;
        }else{
          return null;
        }
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      me: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.get({id: 'me'},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      states: function($route, $q, States){
        var deferred = $q.defer();
        States.query({},
          function (response){ return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        var deferred = $q.defer();
        ApplicationTypes.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      jsas: function ($route, $q, Jsas) {
        var deferred = $q.defer();
        Jsas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder/review/:id?', {
    needsLogin: true,
    controller: 'WorkOrderReviewCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/review.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders){
        var id = $route.current.params.id;
        var deferred = $q.defer();
        WorkOrders.get({id: id},
          function (response){return deferred.resolve(response);},
          function (err){return deferred.reject(err);}
        );
        return deferred.promise;
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id;
        var deferred = $q.defer();
        ReviewNotes.query(
          {workOrder: id},
          function (response){return deferred.resolve(response);},
          function (err){return deferred.reject(err);}
        );
        return deferred.promise;
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      customers: function ($route, $q, Customers) {
        var deferred = $q.defer();
        Customers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      me: function ($route, $q, Users) {
        var deferred = $q.defer();
        Users.get({id: 'me'},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      counties: function ($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        var deferred = $q.defer();
        ApplicationTypes.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      jsas: function ($route, $q, Jsas) {
        var deferred = $q.defer();
        Jsas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/workorder', {
    needsLogin: true,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        var deferred = $q.defer();
        WorkOrders.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('WorkOrderApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);
