angular.module('CommonServices')
.factory('SessionService', ['$window', function ($window) {
  const SS = {};
  const sessionStorage = $window.sessionStorage;
  
  SS.add = (key, value) => {
    sessionStorage.setItem(JSON.stringify(key), JSON.stringify(value));
  };
  
  SS.get = (key) => JSON.parse(sessionStorage.getItem(JSON.stringify(key)));
  
  SS.drop = (key) => sessionStorage.removeItem(JSON.stringify(key));
  
  SS.clear = () => sessionStorage.clear();
  
  return SS;
}]);
