angular.module('CommonComponents')
.component('dateField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/datefield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    placeholderText: '@',
    onDataChange: '&',
    data: '<',
    weeks: '<'
  },
  controller: DateFieldCtrl
});

function DateFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item) {
    console.log(item);
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // -----------------------------------------------------
}
