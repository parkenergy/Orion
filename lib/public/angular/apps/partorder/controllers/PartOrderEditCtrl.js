/**
 *            PartOrderEditCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderEditCtrl',
  ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'PartOrders', 'partorder', 'locations',
function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, PartOrders, partorder, locations) {
  // Variables ----------------------------------------
  $scope.locations = locations;
  $scope.partorder = partorder;
  // --------------------------------------------------

  // Passed Functions to Edit  ------------------------
  $scope.headerSelectFieldChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.headerTextFieldChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.changeThisTextAreaField = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // --------------------------------------------------

  // Passed function to Edit Table --------------------
  $scope.changeStatus = function (changedData, selected) {
    $scope.partorder.status = selected;
  };
  // --------------------------------------------------

  // Submit Changes to Part Order ---------------------
  $scope.submit = function (status) {
    var ableToSubmit = true;
    if ( (status == 'canceled') && !$scope.partorder.comment ) {
      AlertService.add('danger', 'Please fill out the comment box if canceling a part order.');
      ableToSubmit = false;
    }
    if ( (status == 'shipped') && !$scope.partorder.trackingNumber ) {
      AlertService.add('danger', 'Please fill out the tracking number.');
      ableToSubmit = false;
    }

    if ( ableToSubmit ) {
      if ( status == 'shipped' ) {
        $scope.partorder.approvedBy = $cookies.get('tech');
      }
      if ( status == 'completed' || status == 'canceled' ) {
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      PartOrders.update({ id: $scope.partorder.orderId}, $scope.partorder,
        function (res) {
          AlertService.add('success', "Update was successful.");
          $scope.completeForm();
        },
        function (err) {
          console.log(err);
          AlertService.add('danger', 'An error Occurred while attempting to update part order.');
        }
      );
    }
  };
  // --------------------------------------------------

  // Route back ---------------------------------------
  $scope.completeForm = function () {
    $location.url('/partorder')
  };
  // --------------------------------------------------
}]);
