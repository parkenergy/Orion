angular.module('CompressorApp.Controllers', []);
angular.module('CompressorApp.Directives', []);
angular.module('CompressorApp.Services', ['ngResource', 'ngCookies']);

angular.module('CompressorApp', [
  'CompressorApp.Controllers',
  'CompressorApp.Directives',
  'CompressorApp.Services',
]);


angular.module('CompressorApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/compressor/edit/:id?', {
    controller: 'CompressorEditCtrl',
    templateUrl: '/lib/public/angular/apps/compressor/views/edit.html',
    resolve: {
      compressor: function ($route, $q, Compressors) {
        //determine if we're creating or editing a compressor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Compressors.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      units: function ($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/compressor', {
    controller: 'CompressorIndexCtrl',
    templateUrl: '/lib/public/angular/apps/compressor/views/index.html',
    resolve: {
      compressors: function ($route, $q, Compressors) {
        var deferred = $q.defer();
        Compressors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
