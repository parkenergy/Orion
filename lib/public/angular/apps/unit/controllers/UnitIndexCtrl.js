angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', 'ApiRequestService',
function ($scope, ApiRequestService) {
  
  // Variables ------------------------------------------
  const ARS = ApiRequestService;               // local
  $scope.title = "Units Map";                  // local
  $scope.units = [];                           // to UnitMap
  $scope.displayUnitsFromController = [];      // to UnitSearch
  $scope.displayUsersFromController = [];      // to UnitSearch
  $scope.displayCustomersFromController = [];  // to UnitSearch
  $scope.bounds = {};                          // to UnitMap
  // ----------------------------------------------------
  
  // Component methods ----------------------------------
  $scope.typeaheadChange = function (changedData, selected) {
    if(selected === 'unitNumber'){
      ARS.Units({regexN: changedData})
        .then((units) => {
          $scope.displayUnitsFromController = units;
        }, (err) => console.log(err))
    } else if( selected === 'supervisor' || selected === 'tech'){
      const name = changedData.toUpperCase();
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
        }, (err) => console.log(err))
    } else if( selected === 'customer'){
      ARS.Customers({ regexName: changedData })
        .then((customers) => {
          $scope.displayCustomersFromController = customers;
        }, (err) => console.log(err))
    }
  }
  // ----------------------------------------------------
}]);
