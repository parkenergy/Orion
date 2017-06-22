angular.module('CommonComponents')
.controller('AddPartModalCtrl',['$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }])
.component('generalPartsList', {
  templateUrl: 'lib/public/angular/views/customComponents/GeneralPartsList.html',
  bindings: {
    ccData: '<',
    ccPanelTitle: '@',
    ccTableClass: '@',
    ccOnManualAdd: '&',
    ccOnDelete: '&'
  },
  controller: ['$uibModal',GeneralPartsListCtrl]
});

function GeneralPartsListCtrl ($uibModal) {
  // Variables ----------------------------------------------------------
  var self = this;
  // --------------------------------------------------------------------

  // This Calls the Manual Part Modal Ctrl Above ------------------------
  self.openManualPartModal = function(){
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/views/modals/manualAddPartModal.html',
      controller: 'AddPartModalCtrl'
    });

    // Take Results of Modal Instance and Push into Parts Array ---------
    modalInstance.result.then(function (part){
      var thisPart = part;
      thisPart.quantity = 0;
      thisPart.isManual = true;
      self.ccOnManualAdd({part: thisPart});
    });
  };
  // --------------------------------------------------------------------
}
