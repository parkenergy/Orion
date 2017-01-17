/**
 *            CallReportCreateCtrl
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService','CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes','customers','applicationtypes',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes, customers, applicationtypes) {

  // Variables -------------------------------------
  $scope.unittypes = unittypes;
  $scope.titles = titles;
  $scope.statustypes = statustypes;
  $scope.opportunitysizes = opportunitysizes;
  $scope.opptypes = opptypes;
  $scope.activitytypes = activitytypes;
  $scope.customers = customers;
  $scope.applicationtypes = applicationtypes;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  $scope.callreport = newCallReport();
  $scope.oppFormValid = false;
  // -----------------------------------------------

  // Make shift call report ------------------------
  function newCallReport () {
    return {
      customer: '',
      
      title: '',
      isManualTitle: false,
      activityType: '',
      isManualActivity: false,
      applicationType: '',
      isManualAppType: false,
      unitType: '',
      isManualUnitType: false,
      status: '',
      isManualStatus: false,
      oppType: '',
      isManualOppType: false,
      
      size: '',
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
    ObjectService.updateNonNestedObjectValue($scope.callreport,changedData, selected);
  };

  $scope.typeaheadChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };

  $scope.textFieldChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };

  $scope.checkboxChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData,selected);
  };
  
  $scope.isManualChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };
  // -----------------------------------------------
  
  // Save Call Report ------------------------------
  $scope.save = function () {
    CallReports.save({},$scope.callreport,
      function (res) {
        AlertService.add('success', "Successfully created Call Report.");
        $location.url('/callreport');
      },
      function (err) {
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      }
    );
  };
  // -----------------------------------------------
}]);
