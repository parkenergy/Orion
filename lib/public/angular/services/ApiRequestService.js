angular.module('CommonServices')
.factory('ApiRequestService', ['$q','$http','Units','Users','ReviewNotes','Customers', 'CallReports', 'PartOrders', 'WorkOrders', function ($q,$http, Units, Users, ReviewNotes, Customers, CallReports, PartOrders, WorkOrders) {
  const ARS = {};
  ARS.http = {
    get: {}
  };
  
  // CallReports -----------------------------------
  ARS.CallReports = (obj) => CallReports.query(obj).$promise;
  // -----------------------------------------------
  
  // Customers -------------------------------------
  ARS.Customers = (obj) => Customers.query(obj).$promise;
  // -----------------------------------------------
  
  // PartOrders ------------------------------------
  ARS.PartOrders = (obj) => PartOrders.query(obj).$promise;
  // -----------------------------------------------
  
  // ReviewNotes -----------------------------------
  ARS.ReviewNotes = (obj) => ReviewNotes.query(obj).$promise;
  // -----------------------------------------------
  
  // Units -----------------------------------------
  ARS.Units = (obj) => Units.query(obj).$promise;
  // -----------------------------------------------
  
  // Users -----------------------------------------
  ARS.Users = (obj) => Users.query(obj).$promise;
  // getUser usage: send {id: 'ABC001'}
  ARS.getUser = (obj) => Users.get(obj).$promise;
  // -----------------------------------------------
  
  // WorkOrders ------------------------------------
  ARS.WorkOrders = (obj) => WorkOrders.query(obj).$promise;
  // -----------------------------------------------
  
  // HTTP Unit WorkOrders --------------------------
  ARS.http.get.UnitWorkOrders = (obj) => $http({
    url: '/api/Unit/Workorders',
    method: 'GET',
    params: obj
  });
  // ------------------------------------------------
  
  // HTTP WorkOrders Count --------------------------
  ARS.http.get.WorkOrderCount = (obj) => $http({
    url: '/api/workorderscount',
    method: 'GET',
    params: obj
  });
  // ------------------------------------------------
  
  // HTTP no Auth WorkOrders Count ------------------
  ARS.http.get.WorkOrdersNoIdentityCount = (obj) => $http({
    url: '/api/workordersnoidentitycount',
    method: 'GET',
    params: obj
  });
  // ------------------------------------------------
  
  // HTTP unapproved by area WorkOrders -------------
  ARS.http.get.WorkOrdersUnapprovedArea = (obj) => $http({
    url: '/api/workordersunapprovedarea',
    method: 'GET',
    params: obj
  });
  // ------------------------------------------------
  
  // HTTP no Auth Unit Count ------------------------
  ARS.http.get.UnitsNoIdentityCount = (obj) => $http({
    url: '/api/unitnoidentitycount',
    method: 'GET',
    params: obj
  });
  // ------------------------------------------------
  
  
  return ARS;
}]);
