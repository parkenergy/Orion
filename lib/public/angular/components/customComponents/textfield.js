angular.module('CommonComponents')
.component('textField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/textfield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    inputStyling: '@',
    fieldStyling: '@',
    placeholderText: '@',
    onDataChange: '&',
    data: '<',
    disabled: '<'
  },
  controller: TextFieldCtrl
});

function TextFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // -----------------------------------------------------
}
