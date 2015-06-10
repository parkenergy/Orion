angular.module('CommonServices')
.factory('role', ['$q', '$http', function ($q, $http) {

  var role = {};

  role.get = function () {
    var deferred = $q.defer();

    var url = '/api/role';

    $http.get(url)
    .success(function (response) {
      deferred.resolve(response);
    })
    .error(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  return role;

}]);
