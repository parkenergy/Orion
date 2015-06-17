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
    templateUrl: '/_common_packaged/public/angular/apps/compressor/views/edit.html',
    resolve: {
      compressor: function($route, $q, Compressors) {
        //determine if we're creating or editing a compressor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Compressors.get({id: id},
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
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/compressor', {
    controller: 'CompressorIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/compressor/views/index.html',
    resolve: {
      compressors: function($route, $q, Compressors) {
        var deffered = $q.defer();
        Compressors.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
