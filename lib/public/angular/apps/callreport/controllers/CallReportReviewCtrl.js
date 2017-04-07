/**
 *            CallReportReviewCtrl
 *
 * Created by marcuswhelan on 1/17/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportReviewCtrl',['$scope', 'ApiRequestService', 'callreport',
function ($scope, ApiRequestService, callreport) {
  
  // Variables -------------------------------------
  var ARS = ApiRequestService;
  $scope.callreport = callreport;
  $scope.userRealName = '';
  // -----------------------------------------------
  
  // Load User first + last name for display -------
  ARS.getUser({id: callreport.username})
    .then(function (user) {
      $scope.userRealName = user.firstName.concat(' ').concat(user.lastName);
    }, function (err) {
      console.log(err);
    })
  // -----------------------------------------------
}]);
