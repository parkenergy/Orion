angular.module('CommonServices')
.factory('ApiRequestService', ['$q','Units','Users','ReviewNotes','Customers',function ($q, Units, Users, ReviewNotes, Customers) {
  const ApiRequestService = {};
  
  ApiRequestService.Units = (obj) => Units.query(obj).$promise;
  
  ApiRequestService.Users = (obj) => Users.query(obj).$promise;
  
  // usage. send {id: 'ABC001'}
  ApiRequestService.getUser = (obj) => Users.get(obj).$promise;
  
  ApiRequestService.ReviewNotes = (obj) => ReviewNotes.query(obj).$promise;
  
  ApiRequestService.Customers = (obj) => Customers.query(obj).$promise;
  
  return ApiRequestService;
}]);
