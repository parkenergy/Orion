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

  .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/app/apps/workorder/views/edit.html',
    resolve: {
      workorder: function($route, $q, WorkOrders) {
        //determine if we're creating or editing a workorder.
        var id = $route.current.params._id || 0;
        if (id) {
          var deffered = $q.defer();
          WorkOrders.get({id: id},
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
          function (response) {
            response.push({
              id: null,
              vendorPartNumber: "Other",
              concatenateName: "Other"
            });
            return deffered.resolve(response);
          },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/workorder', {
    needsLogin: true,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/app/apps/workorder/views/index.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        WorkOrders.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
