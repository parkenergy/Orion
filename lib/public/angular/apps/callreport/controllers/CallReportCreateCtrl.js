/**
 *            CallReportCreateCtrl
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService', 'ApiRequestService', 'CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes','applicationtypes',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, ApiRequestService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes, applicationtypes) {

  // Variables -------------------------------------
  const ARS = ApiRequestService;
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
