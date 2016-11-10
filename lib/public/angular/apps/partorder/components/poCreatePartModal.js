/**
 *            poCreatePartModal
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.controller('AddPartModalCtrl', [ '$scope', '$uibModalInstance',
function ($scope, $uibModalInstance) {
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}])
.component('pesPoCreatePart', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poCreatePart.html',
  bindings: {
    part: '<',
    onManualAdd: '&',
    onDelete: '&'
  },
  controller: [ '$uibModal', CreatePart]
});

function CreatePart ($uibModal) {
  // Variables -----------------------------------------------
  var self = this;
  // ---------------------------------------------------------

  // Show Table of parts if Part Isn't Empty -----------------
  self.isEmpty = function () {
    if(_.isEmpty(self.part)){ return false; }
    return true;
  };
  // ---------------------------------------------------------

  // Call the Modal for Manual Part Add ----------------------
  self.openManualPartModal = function () {
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/views/modals/manualAddPartModal.html',
      controller: 'AddPartModalCtrl'
    });

    // Modal Instance Result Calls Parent Function -------
    modalInstance.result.then( function (part) {
      var thispart = part;
      thispart.quantity = 0;
      thispart.isManual = true;
      self.onManualAdd({part: thispart});
    });
  };
  // ---------------------------------------------------------
}
