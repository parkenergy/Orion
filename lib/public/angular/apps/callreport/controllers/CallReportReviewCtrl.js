/**
 *            CallReportReviewCtrl
 *
 * Created by marcuswhelan on 1/17/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportReviewCtrl',['$scope','callreport',
function ($scope, callreport) {
  
  // Variables -------------------------------------
  $scope.callreport = callreport;
  // -----------------------------------------------
}]);
