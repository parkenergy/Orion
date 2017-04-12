angular.module('CommonServices')
.factory('ApiRequestService', ['$http','Units','Users','ReviewNotes','Customers', 'CallReports', 'PartOrders', function ($http, Units, Users, ReviewNotes, Customers, CallReports, PartOrders) {
  const ApiRequestService = {};
  ApiRequestService.http = {};
  
  // CallReports -----------------------------------
  ApiRequestService.CallReports = (obj) => CallReports.query(obj).$promise;
  // -----------------------------------------------
  
  // Customers -------------------------------------
  ApiRequestService.Customers = (obj) => Customers.query(obj).$promise;
  // -----------------------------------------------
  
  // PartOrders ------------------------------------
  ApiRequestService.PartOrders = (obj) => PartOrders.query(obj).$promise;
  // -----------------------------------------------
  
  // ReviewNotes -----------------------------------
  ApiRequestService.ReviewNotes = (obj) => ReviewNotes.query(obj).$promise;
  // -----------------------------------------------
  
  // Units -----------------------------------------
  ApiRequestService.Units = (obj) => Units.query(obj).$promise;
  // -----------------------------------------------
  
  // Users -----------------------------------------
  ApiRequestService.Users = (obj) => Users.query(obj).$promise;
  // getUser usage: send {id: 'ABC001'}
  ApiRequestService.getUser = (obj) => Users.get(obj).$promise;
  // -----------------------------------------------
  
  return ApiRequestService;
}]);
