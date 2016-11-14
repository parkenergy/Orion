angular.module('CommonComponents')
.component('checkBox', {
  templateUrl: '/lib/public/angular/views/customElements/checkbox.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    boxStyling: '@',
    inputStyling: '@',
    onDataChange: '&',
    data: '<',
    disabled: '<'
  },
  controller: CheckBoxCtrl
});

function CheckBoxCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back changes -----------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName });
  }
}
