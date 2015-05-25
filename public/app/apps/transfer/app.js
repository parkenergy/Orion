angular.module('TransferApp.Controllers', []);
angular.module('TransferApp.Directives', []);
angular.module('TransferApp.Services', ['ngResource', 'ngCookies']);

angular.module('TransferApp', [
  'TransferApp.Controllers',
  'TransferApp.Directives',
  'TransferApp.Services',
]);


angular.module('TransferApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/transfer/edit/:id?', {
    needsLogin: true,
    controller: 'TransferEditCtrl',
    templateUrl: '/app/apps/transfer/views/edit.html',
    resolve: {
      transfer: function($route, $q, Transfers) {
        //determine if we're creating or editing a transfer.
        var id = $route.current.params._id || 0;
        if (id) {
          var deffered = $q.defer();
          Transfers.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) {return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      users: function($route, $q, Users) {
        var deffered = $q.defer();
        Users.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
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
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/transfer', {
    needsLogin: true,
    controller: 'TransferIndexCtrl',
    templateUrl: '/app/apps/transfer/views/index.html',
    resolve: {
      transfers: function($route, $q, Transfers) {
        var deffered = $q.defer();
        Transfers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
