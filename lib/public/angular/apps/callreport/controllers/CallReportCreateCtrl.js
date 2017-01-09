/**
 *            CallReportCreateCtrl
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService','CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes) {

  // Variables -------------------------------------
  $scope.callReport = newCallReport();
  $scope.unittypes = unittypes;
  $scope.titles = titles;
  $scope.statustypes = statustypes;
  $scope.opportunitysizes = opportunitysizes;
  $scope.opptypes = opptypes;
  $scope.activitytypes = activitytypes;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  // -----------------------------------------------

  // Make shift call report ------------------------
  function newCallReport () {
    return {
      customer: '',
      title: '',
      activityType: '',
      applicationType: '',
      unitType: '',
      size: '',
      oppType: '',
      status: '',

      phoneNumber: '',
      contactName: '',
      officeLocation: '',
      email: '',
      callTime: null,
      newCustomer: false,
      decisionMaker: '',
      currentSpend: '',

      username: $scope.techId
    }
  }
  // -----------------------------------------------
}]);
