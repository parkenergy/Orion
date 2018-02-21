angular.module('PaidTimeOffApp.Controllers')
.controller('PaidTimeOffReviewCtrl', ['$scope', '$location', '$cookies', 'paidtimeoff', 'PaidTimeOffs', 'AlertService', 'DateService',
function ($scope, $location, $cookies, paidtimeoff, PaidTimeOffs, AlertService, DateService) {
  const DS = DateService;

  $scope.paidtimeoff = paidtimeoff;

  // init
  const preLoad = () => {
    $scope.paidtimeoff.DateFrom = DS.displayLocal(new Date($scope.paidtimeoff.DateFrom));
    $scope.paidtimeoff.DateTo = DS.displayLocal(new Date($scope.paidtimeoff.DateTo));
    $scope.paidtimeoff.created = DS.displayLocal(new Date($scope.paidtimeoff.created));
    if ($scope.paidtimeoff.timeApproved) {
      $scope.paidtimeoff.timeApproved = DS.displayLocal(new Date($scope.paidtimeoff.timeApproved));
    }
  };
  preLoad();

  const preSave = () => {
    $scope.paidtimeoff.DateFrom = DS.saveToOrion(new Date($scope.paidtimeoff.DateFrom));
    $scope.paidtimeoff.DateTo = DS.saveToOrion(new Date($scope.paidtimeoff.DateTo));
    $scope.paidtimeoff.created = DS.saveToOrion(new Date($scope.paidtimeoff.created));
    if ($scope.paidtimeoff.timeApproved) {
      $scope.paidtimeoff.timeApproved = DS.saveToOrion(new Date($scope.paidtimeoff.timeApproved));
    }
  };

  $scope.approvalStatusChange = (changedData, selected) => {
    if (selected === 'approved') {
      $scope.paidtimeoff.approved = changedData;
      if ($scope.paidtimeoff.rejected) {
        $scope.paidtimeoff.rejected = false;
      }
    }
    if (selected === 'rejected') {
      $scope.paidtimeoff.rejected = changedData;
      if ($scope.paidtimeoff.approved) {
        $scope.paidtimeoff.approved = false;
      }
    }
  };

  $scope.changeManagerComment = (changedData, selected) => {
    $scope.paidtimeoff.managerComment = changedData;
  };

  $scope.update = (doc) => {
    PaidTimeOffs.update({id: doc._id}, doc,
      (res) => {
        AlertService.add('success', "Update was successful.");
        $location.url('/paidtimeoff');
      }, (err) => {
        console.log(err);
        // if error reset back to display times
        preLoad();
        AlertService.add('danger', 'An error occurred while attempting to update this PTO.');
      })
  };

  $scope.setManagerReviewed = () => {
    $scope.paidtimeoff.approvedBy = $cookies.get('tech');
    $scope.paidtimeoff.timeApproved = DS.saveToOrion(new Date());
    preSave();
    $scope.update($scope.paidtimeoff);
  };

  $scope.setAdminReviewed = () => {
    $scope.paidtimeoff.adminReviewed = true;
    preSave();
    $scope.update($scope.paidtimeoff);
  };
}]);
