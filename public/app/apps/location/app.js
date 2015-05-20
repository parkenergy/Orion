angular.module('LocationApp.Controllers', []);
angular.module('LocationApp.Directives', []);
angular.module('LocationApp.Services', ['ngResource', 'ngCookies']);

angular.module('LocationApp', [
  'LocationApp.Controllers',
  'LocationApp.Directives',
  'LocationApp.Services',
]);


angular.module('LocationApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/location/edit/:id?', {
    controller: 'LocationEditCtrl',
    templateUrl: '/app/apps/location/views/edit.html',
    resolve: {
      location: function($route, $q, Locations) {
        //determine if we're creating or editing a location.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Locations.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/location', {
    controller: 'LocationIndexCtrl',
    templateUrl: '/app/apps/location/views/index.html',
    resolve: {
      locations: function($route, $q, Locations) {
        var deffered = $q.defer();
        Locations.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
