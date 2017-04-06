angular.module('CommonServices')
.factory('ApiRequestService', ['$q','Units','Users','ReviewNotes','Customers',function ($q, Units, Users, ReviewNotes, Customers) {
  var ApiRequestService = {};
  
  ApiRequestService.Units = function (obj) {
    var defer = $q.defer();
    Units.query(obj,function (res) {
      return defer.resolve(res);
    },function (err) {
      return defer.reject(err);
    });
    return defer.promise;
  };
  
  ApiRequestService.Users = function (obj) {
    var defer = $q.defer();
    Users.query(obj,function (res) {
      return defer.resolve(res);
    },function (err) {
      return defer.reject(err);
    });
    return defer.promise;
  };
  
  // usage. send {id: 'ABC001'}
  ApiRequestService.getUser = function (obj) {
    var defer = $q.defer();
    Users.get(obj, function (res) {
      return defer.resolve(res);
    }, function (err) {
      return defer.reject(err);
    });
    return defer.promise;
  };
  
  ApiRequestService.ReviewNotes = function (obj) {
    var defer = $q.defer();
    ReviewNotes.query(obj,function (res) {
      return defer.resolve(res);
    },function (err) {
      return defer.reject(err);
    });
    return defer.promise;
  };
  
  ApiRequestService.Customers = function (obj) {
    var defer = $q.defer();
    Customers.query(obj,function (res) {
      return defer.resolve(res);
    },function (err) {
      return defer.reject(err);
    });
    return defer.promise;
  };
  
  return ApiRequestService;
}]);
