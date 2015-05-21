angular.module('Orion.Controllers', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies']);

angular.module('Orion', [
  'Orion.Controllers',
  'Orion.Directives',
  'Orion.Services',
  'CustomerApp',
  'LocationApp',
  'PartApp',
  'ServicePartnerApp',
  'TransferApp',
  'UnitApp',
  'UserApp',
  'VendorApp',
  'VendorPartApp',
  'WorkOrderApp',
  'ui.bootstrap',
  'ui.utils'
]);

angular.module('Orion').config(['$routeProvider',
function ($routeProvider) {
  $routeProvider
  .when('/login', {
    controller: 'SessionCtrl',
    templateUrl: '/app/views/redirecting.html',
  })
  .when('/myaccount', {
    needsLogin: true,
    controller: 'MyAccountCtrl',
    templateUrl: '/app/views/myaccount.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        var now = new Date();
        var DaysAgo30 = now.setDate(now.getDate()-30);
        var temp;
        WorkOrders.query({limit: 50, where: {status: "SUBMITTED"}},
          function (response) {
            return deffered.resolve(response);
            //temp = response;
            // WorkOrders.query({limit: 200, where: { updatedAt: {gte: DaysAgo30}, status: "APPROVED" } },
            //   function (response) {
            //     temp = temp.concat(response);
            //     return deffered.resolve(temp);
            //   },
            //   function (err) { return deffered.reject(err); }
            // );
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
  .when('/example', {
    controller: 'ExampleCtrl',
    templateUrl: '/app/views/example.html'
  })
  .when('/', {
    controller: 'HomepageCtrl',
    templateUrl: '/app/views/homepage.html'
  });
}]);


/* Handle errors from the server side
----------------------------------------------------------------------------- */
angular.module('Orion').config(['$httpProvider',
function ($httpProvider) {
  $httpProvider.interceptors.push('Handler401');
}]);
