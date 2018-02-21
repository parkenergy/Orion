angular.module('CallReportApp.Controllers')
.controller('CallReportReviewCtrl',['$scope', 'ApiRequestService', 'callreport', 'DateService',
function ($scope, ApiRequestService, callreport, DateService) {

  // Variables -------------------------------------
  const ARS = ApiRequestService;
  const DS = DateService;
  $scope.callreport = callreport;
  $scope.userRealName = '';
  // -----------------------------------------------

  // init
  $scope.callreport.callTime = DS.displayLocal(new Date($scope.callreport.callTime));

  // Load User first + last name for display -------
  ARS.getUser({id: callreport.username})
    .then((user) => {
      if (user.hasOwnProperty('firstName')) {
        $scope.userRealName = user.firstName.concat(' ').concat(user.lastName);
      } else {
        $scope.userRealName = callreport.username;
      }
    })
    .catch((err) => console.log(err));
  // -----------------------------------------------
}]);
