angular.module('CustomerApp.Controllers', []);
angular.module('CustomerApp.Directives', []);
angular.module('CustomerApp.Services', ['ngResource', 'ngCookies']);

angular.module('CustomerApp', [
  'CustomerApp.Controllers',
  'CustomerApp.Directives',
  'CustomerApp.Services',
]);


angular.module('CustomerApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/customer/edit/:id?', {
    controller: 'CustomerEditCtrl',
    templateUrl: '/app/apps/customer/views/edit.html',
    resolve: {
      customer: function($route, $q, Customers) {
        //determine if we're creating or editing a customer.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Customers.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      locations: function($route, $q, Locations) {
        //determine if we're creating or editing a customer.
        //if editing show the locations; otherwise, nothing.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Locations.query({where: {CustomerId: id}},
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

  .when('/customer', {
    controller: 'CustomerIndexCtrl',
    templateUrl: '/app/apps/customer/views/index.html',
    resolve: {
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
