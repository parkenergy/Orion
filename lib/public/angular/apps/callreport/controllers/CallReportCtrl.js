angular.module('CallReportApp.Controllers')
.controller('CallReportCtrl',
  ['$scope', '$http', '$timeout', '$location', '$q', 'ApiRequestService', 'DateService',
function ($scope, $http, $timeout, $location, $q, ApiRequestService, DateService) {
  // Variables-----------------------------------------
  const ARS = ApiRequestService;              // local
  const DS = DateService;                     // local
  $scope.loaded = false;                      // local
  $scope.spinner = true;                      // local
  $scope.displayUsersFromController = [];     // to OverviewTable
  $scope.displayCustomersFromController = []; // to OverviewTable
  // --------------------------------------------------

  // Turn Spinner Off ---------------------------------
  $scope.spinnerOff = () => {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Passed to Component ------------------------------
  // Function called any time Page loads or user scrolls past 50 units
  $scope.lookup = (query) => {
    $scope.loaded = false;
    ARS.CallReports(query)
      .then((callreports) => {
        $scope.callreports = callreports.map(mapCallReports);
        $scope.loaded = true;
        $scope.spinnerOff();
      })
      .catch((err) => console.log("Failed to load: ", err));
  };

  $scope.CallReportScrollLookup = (query) => {
    console.log("Looking up Call Reports...");
    ARS.CallReports(query)
      .then((callreports) => {
        console.log("Call Reports Loaded.");
        const cr = callreports.map(mapCallReports);
        $scope.callreports = $scope.callreports.concat(cr);
      })
      .catch((err) => console.log("Failed to load call reports on scroll: ",err));
  };
  $scope.typeaheadChange = (changedData, selected) => {
    if(selected === 'user'){

      ARS.Users({ regexName: name })
      .then((users) => {
        const userArray = [];
        if(users.length > 0){
          for(let user in users){
            if(users.hasOwnProperty(user)){
              if(users[user].hasOwnProperty('firstName')){
                const fullName = users[user].firstName.concat(" ").concat(users[user].lastName);
                const thisUser = users[user];
                thisUser.fullName = fullName;
                userArray.push(thisUser);
              }
            }
          }
          $scope.displayUsersFromController = userArray;
        }
      })
      .catch((err) => console.log(err));
    } else if(selected === 'customer'){
      ARS.Customers({ regexName: changedData })
      .then((customers) => {
        $scope.displayCustomersFromController = customers;
      })
      .catch((err) => console.log(err));
    }
  };
  // --------------------------------------------------

  // Create Sorting parameters ------------------------
  function mapCallReports (cr) {
    // map and set times to local times
    cr.callTime = DS.displayLocal(new Date(cr.callTime));
    cr.epoch = new Date(cr.callTime).getTime();

    return cr;
  }
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createCallReport = function () {
    $location.url('/callreport/create');
  };
  // --------------------------------------------------
}]);
