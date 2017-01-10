/**
 *            CallReportCreateCtrl
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService','CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes','customers','applicationtypes','users',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes, customers, applicationtypes, users) {

  // Variables -------------------------------------
  $scope.unittypes = unittypes;
  $scope.titles = titles;
  $scope.statustypes = statustypes;
  $scope.opportunitysizes = opportunitysizes;
  $scope.opptypes = opptypes;
  $scope.activitytypes = activitytypes;
  $scope.customers = customers;
  $scope.applicationtypes = applicationtypes;
  $scope.users = users;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  $scope.callreport = newCallReport();
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
      callTime: new Date(),
      newCustomer: false,
      decisionMaker: '',
      currentSpend: '',

      username: $scope.techId
    }
  }
  // -----------------------------------------------

  // Passed Functions To Child Components ----------
  $scope.selectFieldChange = function (changedData, selected) {
    console.log(changedData, selected, 'selectlist');
    ObjectService.updateNonNestedObjectValue($scope.callreport,changedData, selected);
    console.log($scope.callreport);
  };

  $scope.textFieldChange = function (changedData, selected) {
    console.log(changedData, selected, 'textfield');
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
    console.log($scope.callreport);
  };
  // -----------------------------------------------
}]);
