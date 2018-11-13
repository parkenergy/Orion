angular.module('CommonComponents')
.component('tripleTextField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/triple-textfield.html',
  bindings: {
    labelText: '@',
    modelNameOne: '@',
    modelNameTwo: '@',
    modelNameThree: '@',
    inputStyling: '<',
    fieldStyling: '@',
    placeholderTextOne: '@',
    placeholderTextTwo: '@',
    placeholderTextThree: '@',
    onDataChange: '&',
    dataone: '<',
    datatwo: '<',
    datathree: '<',
    disabled: '<'
  },
  controller: TripleTextFieldCtrl
});

function TripleTextFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item, modelName) {
    self.onDataChange({ changedData: item, selected: modelName });
  };
  // -----------------------------------------------------
}
