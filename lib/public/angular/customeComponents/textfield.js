angular.module('CommonComponents')
.component('textField',{
  templateUrl: '/lib/public/angular/views/customComponents/textfield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    inputStyling: '@',
    fieldStyling: '@',
    onDataChange: '&',
    selectDebounce: '<',
    data: '<',
    disabled: '<'
  },
  controller: [ 'DebounceService', TextFieldCtrl]
});

function TextFieldCtrl (DebounceService) {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  if(self.selectDebounce){
    self.onUpdate = DebounceService.debounce(function (item) {
      self.onDataChange({ changedData: item, selected: self.modelName });
    }, self.selectDebounce);
  } else {
    self.onUpdate = function (item) {
      self.onDataChange({ changedData: item, selected: self.modelName });
    };
  }
  // -----------------------------------------------------
}
