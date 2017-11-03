angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', 'AlertService', 'ApiRequestService',
function ($scope, AlertService, ApiRequestService) {
  
  // Variables ------------------------------------------
  const ARS = ApiRequestService;               // local
  $scope.title = "Units Map";                  // local
  $scope.units = [];                           // to UnitMap
  $scope.bounds = {};                          // to UnitMap
  $scope.displayUnitsFromController = [];      // to UnitSearch
  $scope.displayUsersFromController = [];      // to UnitSearch
  $scope.displayCustomersFromController = [];  // to UnitSearch
  // ----------------------------------------------------
  
  // Get Units on Search --------------------------------
  $scope.setUnits = (params) => {
    if(params.hasOwnProperty("numbers")) {
      params.numbers = params.numbers.replace(/\s/g,'').split(",");
    }
    if(params.hasOwnProperty("techs")) {
      params.techs = params.techs.replace(/\s/g,'').split(",");
    }
    ARS.Units(params)
      .then((units) => {
        $scope.units = units.map((unit) => {
          let now = new Date();
          let inSevenDays = moment().add(7, 'days');
          let pmDate = unit.nextPmDate ? new Date(unit.nextPmDate) : null;
          
          let icon = 'lib/public/images/marker_grey.png';
          if(pmDate) {
            //If pmDate has passed, icon is red
            if (moment(now).isAfter(pmDate, 'day')) {
              icon = 'lib/public/images/marker_red.png';
            }
            //If pmDate is under 7 days away, icon is yellow
            else if(moment(inSevenDays).isAfter(pmDate, 'day')) {
              icon = 'lib/public/images/marker_yellow.png';
            }
            //pmDate hasn't passed and is more than 7 days away
            else {
              icon = 'lib/public/images/marker_green.png';
            }
          }
  
          return {
            id: unit.number,
            geo: unit.geo,
            show: false,
            productSeries: unit.productSeries,
            locationName: unit.locationName,
            customerName: unit.customerName,
            assignedTo: unit.assignedTo,
            pmDate,
            icon
          }
        })
      })
      .catch( (err) => {
        AlertService.add('danger', "Failed to load", 2000);
        console.log(err);
      });
  };
  // ----------------------------------------------------
  
  // Component methods ----------------------------------
  $scope.typeaheadChange = function (changedData, selected) {
    if(selected === 'unitNumber'){
      ARS.Units({regexN: changedData})
        .then((units) => {
          $scope.displayUnitsFromController = units;
        })
        .catch((err) => console.log(err))
    } else if( selected === 'supervisor' || selected === 'tech'){
      //const name = changedData.toUpperCase();
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
    } else if( selected === 'customer'){
      ARS.Customers({ regexName: changedData })
        .then((customers) => {
          $scope.displayCustomersFromController = customers;
        })
        .catch((err) => console.log(err));
    }
  }
  // ----------------------------------------------------
}]);
