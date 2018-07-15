angular.module('PaidTimeOffApp.Controllers')
    .controller('PaidTimeOffReviewCtrl', ['$scope',
        '$timeout',
        '$location',
        '$cookies',
        'paidtimeoff',
        'PaidTimeOffs',
        'AlertService',
        'DateService',
        function ($scope, $timeout, $location, $cookies, paidtimeoff, PaidTimeOffs, AlertService,
            DateService) {
  const DS = DateService;

  $scope.paidtimeoff = paidtimeoff;
  // init
  const preLoad = () => {
    $scope.paidtimeoff.DateFrom = DS.displayLocal(new Date($scope.paidtimeoff.DateFrom));
    $scope.paidtimeoff.DateTo = DS.displayLocal(new Date($scope.paidtimeoff.DateTo));
      $scope.paidtimeoff.ptoDays.forEach((day) => {
          day.dateOf = DS.displayLocal(new Date(day.dateOf));
      });
      if ($scope.paidtimeoff.timeReviewed) {
          $scope.paidtimeoff.timeReviewed = DS.displayLocal(
              new Date($scope.paidtimeoff.timeReviewed));
      }
  };
  preLoad();

            const preSave = () => {
                $scope.paidtimeoff.DateFrom = DS.saveToOrion(new Date($scope.paidtimeoff.DateFrom))
                    .toISOString();
                $scope.paidtimeoff.DateTo = DS.saveToOrion(new Date($scope.paidtimeoff.DateTo))
                    .toISOString();
                $scope.paidtimeoff.ptoDays.forEach((day) => {
                    day.dateOf = DS.saveToOrion(new Date(day.dateOf)).toISOString();
                });
                if ($scope.paidtimeoff.timeReviewed) {
                    $scope.paidtimeoff.timeReviewed = DS.saveToOrion(
                        new Date($scope.paidtimeoff.timeReviewed)).toISOString();
                }
  };
            $scope.approvalStatusChange = (selected) => {
                $timeout(() => {
                    if (selected === 'approved') {
                        $scope.paidtimeoff.status = 'Approved';
                    }
                    if (selected === 'rejected') {
                        $scope.paidtimeoff.status = 'Rejected';
                    }
                });
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
        });
  };

            $scope.setAdminChanges = () => {
                if ($scope.paidtimeoff.status !== 'Pending' && $scope.paidtimeoff.reviewedBy ===
                    '') {
                    $scope.paidtimeoff.reviewedBy = $cookies.get('tech');
                    $scope.paidtimeoff.timeReviewed = new Date();
                }
                preSave();
                $scope.update($scope.paidtimeoff);
            };
  $scope.setManagerReviewed = () => {
      $scope.paidtimeoff.reviewedBy = $cookies.get('tech');
      $scope.paidtimeoff.timeReviewed = new Date();
    preSave();
    $scope.update($scope.paidtimeoff);
  };

}]);
