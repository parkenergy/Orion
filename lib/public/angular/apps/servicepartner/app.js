angular.module('ServicePartnerApp.Controllers', []);
angular.module('ServicePartnerApp.Directives', []);
angular.module('ServicePartnerApp.Services', ['ngResource', 'ngCookies']);

angular.module('ServicePartnerApp', [
  'ServicePartnerApp.Controllers',
  'ServicePartnerApp.Directives',
  'ServicePartnerApp.Services',
]);


angular.module('ServicePartnerApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/servicepartner/edit/:id?', {
    controller: 'ServicePartnerEditCtrl',
    templateUrl: '/lib/public/angular/apps/servicepartner/views/edit.html',
    resolve: {
      servicePartner: function ($route, $q, ServicePartners) {
        //determine if we're creating or editing a servicePartner.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          ServicePartners.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/servicepartner', {
    controller: 'ServicePartnerIndexCtrl',
    templateUrl: '/lib/public/angular/apps/servicepartner/views/index.html',
    resolve: {
      servicePartners: function ($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
