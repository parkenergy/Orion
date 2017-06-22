angular.module('CommonComponents')
.component('textAreaField', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/textareafield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    placeholderText: '@',
    rows: '@',
    onDataChange: '&',
    data: '<',
    disabled: '<'
  },
  controller: TextAreaFieldCtrl
});

function TextAreaFieldCtrl () {
  // Variables -----------------------------------------
  var self = this;
  // ---------------------------------------------------

  // Pass back Changes ---------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // ---------------------------------------------------
}
