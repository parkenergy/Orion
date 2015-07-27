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
    templateUrl: '/_common_packaged/public/angular/apps/servicepartner/views/edit.html',
    resolve: {
      servicePartner: function($route, $q, ServicePartners) {
        //determine if we're creating or editing a servicePartner.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          ServicePartners.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/servicepartner', {
    controller: 'ServicePartnerIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/servicepartner/views/index.html',
    resolve: {
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
