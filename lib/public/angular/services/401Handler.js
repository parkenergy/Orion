/**
 * This service handles server side error responses for the whole app.
 * If a route has needsLogin: true, this will ensure the user is logged in.
 */

angular.module('CommonServices')
.factory('Handler401', ['$q', '$cookies', '$window', '$injector', '$location',
function ($q, $cookies, $window, $injector, $location) {

  // Make them log in again.
  function logInAgain() {
    var url = $window.location.toString().split('#'),
        returnUrl = url[0],
        fragment = url[1];

    $location
    .search('returnUrl', returnUrl)
    .search('fragment', fragment)
    .path('/login');
  }

  // Pass an $http and $route.current.
  // Set the cookies if the user is logged in!
  function checkAuthorization(httpService, currentRoute) {
    var deferred = $q.defer();

    if ($cookies.get('userId') !== null &&
        $cookies.get('userId') !== undefined &&
        $cookies.get('userId') !== 0 &&
        $cookies.get('userId') !== "undefined") {
          deferred.resolve($cookies.get('userId'));
    } else {

      httpService.get('/authorized').success(function (user) {
        if (user !== '0' && user !== undefined && user !== null && user !== "undefined") {
          $cookies.put('userId', user._id);
          $cookies.put('userName', user.userName);
          deferred.resolve($cookies.get('userId'));
        } else {
          $cookies.remove('userId');
          $cookies.remove('user');
          deferred.reject("Unauthorized");
        }
      }).error(function (err) {
        $cookies.remove('userId');
        $cookies.remove('user');
        deferred.reject(err);
      });

    }

    return deferred.promise;

  }

  return {

    // Cool hax, bro.
    // Inject $http and $route to get around circular dependencies.
    // On each request, we want to check the user's cookie is set.
    request: function (config) {
      return $injector.invoke(function ($http, $route) {
        if ($route.current.needsLogin === true) {

          $route.current.needsLogin = false; //prevent infinite callback loop.

          checkAuthorization($http, $route.current)
          .then(function (resolveValue) {
            console.log("Resolve Value: ", resolveValue);
          }, function (rejectionReason) {
            console.log("Rejection Reason: ", rejectionReason);
            logInAgain();
          });
        }

        return config || $q.when(config);

      });
    },

    requestError: function (rejection) {
      logInAgain();
      return $q.reject(rejection);
    },

    response: function (response) {
      return response || $q.when(response);
    },

    // If the user is not logged in on the server side,
    // we're returning a 401 error code, so this will catch that.
    responseError: function (rejection) {
      if (rejection.status === 401) { logInAgain(); }
      return $q.reject(rejection);
    }
  };
}]);
