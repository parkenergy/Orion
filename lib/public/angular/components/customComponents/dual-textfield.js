angular.module('CommonComponents')
.component('dualTextField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/dual-textfield.html',
  bindings: {
    labelText: '@',
    modelNameOne: '@',
    modelNameTwo: '@',
    inputStyling: '<',
    fieldStyling: '@',
    placeholderTextOne: '@',
    placeholderTextTwo: '@',
    onDataChange: '&',
    dataone: '<',
    datatwo: '<',
    disabled: '<'
  },
  controller: DualTextFieldCtrl
});

function DualTextFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item, modelName) {
    self.onDataChange({ changedData: item, selected: modelName });
  };
  // -----------------------------------------------------
}
