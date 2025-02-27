angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService', 'ApiRequestService', 'CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes','applicationtypes', 'DateService',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, ApiRequestService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes, applicationtypes, DateService) {

  // Variables -------------------------------------
  const ARS = ApiRequestService;
  const DS = DateService;
  $scope.unittypes = unittypes;
  $scope.titles = titles;
  $scope.statustypes = statustypes;
  $scope.opportunitysizes = opportunitysizes;
  $scope.opptypes = opptypes;
  $scope.activitytypes = activitytypes;
  $scope.customers = [];
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

      username: $scope.techId,
      extension: '',
      comment: ''
    }
  }
  // -----------------------------------------------

  // Passed Functions To Child Components ----------
  $scope.selectFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport,changedData, selected);
  };

  $scope.typeaheadChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
    if(selected === 'customer'){
      ARS.Customers({regexName: changedData})
        .then((customers) => {
          $scope.customers = customers;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  $scope.textFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };

  $scope.checkboxChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData,selected);
  };

  $scope.isManualChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };
  // -----------------------------------------------

  // Save Call Report ------------------------------
  $scope.save = () => {
    // before saving format all times to be server time
    if ($scope.callreport.callTime) {
      $scope.callreport.callTime = DS.saveToOrion($scope.callreport.callTime);
    }
    CallReports.save({},$scope.callreport,
      (res) => {
        AlertService.add('success', "Successfully created Call Report.");
        $location.url('/callreport');
      },
      (err) => {
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      }
    );
  };
  // -----------------------------------------------
}]);
