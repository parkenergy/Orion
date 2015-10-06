angular.module('UserApp.Controllers', []);
angular.module('UserApp.Directives', []);
angular.module('UserApp.Services', ['ngResource', 'ngCookies']);

angular.module('UserApp', [
  'UserApp.Controllers',
  'UserApp.Directives',
  'UserApp.Services',
]);


angular.module('UserApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/user/edit/:id?', {
    controller: 'UserEditCtrl',
    templateUrl: '/lib/public/angular/apps/user/views/edit.html',
    resolve: {
      user: function($route, $q, Users) {
        //determine if we're creating or editing a user.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Users.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      servicePartners: function ($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/user', {
    controller: 'SuperIndexCtrl',
    templateUrl: '/lib/public/angular/views/superIndex.html',
    resolve: {
      // Required Attributes for SuperIndex
      title: function () { return "Users"; },
      model: function () { return "user"; },
      objectList: function ($route, $q, Users) {
        var deferred = $q.defer();
        var select = ['id', 'firstName', 'lastName', 'username'];
        Users.query({attributes: select},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      displayColumns: function () {
        return [
          { title: "First Name", objKey: 'firstName' },
          { title: "Last Name", objKey: 'lastName' },
          { title: "Username", objKey: 'username' }
        ];
      },
      //not required
      sort: function () {
        return { column: ["firstName"], descending: [false] };
      },
      rowClickAction: function () { return; }, // default behavior
      rowButtons: function () { return; }, // default behavior
      headerButtons: function () { return; } // default behavior
    }
  });
}]);
