angular.module('CommonControllers').controller('UserPMReportCtrl',
['$window', '$scope', 'users', 'ApiRequestService', 'AlertService',
function ($window, $scope, users, ApiRequestService, AlertService) {
  // Variables ------------------------------------
  $scope.user = users[0];             // to component
  const ARS = ApiRequestService;      // local
  const hour = 3600000;               // local
  const day = hour * 24;              // local
  //-----------------------------------------------
  
  // Search work orders with units and day limit --
  $scope.getWorkOrders = (days) => {
    const now = new Date().getTime();
    const query = {};
    query.tech = $scope.user.username;
    query.noSplitInfo = true; // do not split info because of role.
    if(days === 0) {
      // only get work orders from today.
      const todayHours = now.getHours() * hour;
      query.from = now - todayHours;
      query.to = now;
    } else {
      const minusDays = day * days;
      query.from = new Date(now - minusDays);
      query.to = new Date(now);
    }
    query.limit = 100000;
    // Get units assigned to user
    ARS.Units({tech: $scope.user.username, size: 500})
      .then((res) => $scope.units = res)
      .catch((err) => console.log(err));
    // get all work orders done by user.
    ARS.WorkOrders(query)
      .then((res) => {
        const units = [];
        if(res.length > 0) {
          $scope.workorders = res;
        } else {
          AlertService.add("info",`No work orders found from ${days} days ago`);
        }
      })
      .catch((err) => console.log(err));
  };
  //-----------------------------------------------
  
  // Initiate a search of at least 150 days prior -
  $scope.getWorkOrders(90);
  // ----------------------------------------------
}]);
