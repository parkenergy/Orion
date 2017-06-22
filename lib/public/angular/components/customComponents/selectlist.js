angular.module('CommonComponents')
.component('selectList', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/selectlist.html',
  bindings: {
    labelText: '@',
    selectField: '@',
    modelName: '@',
    displayField: '@',
    onDataChange: '&',
    arrayList: '<',
    data: '<',
    disabled: '<'
  },
  controller: SelectListCtrl
});

function SelectListCtrl () {
  var self = this;

  // Pass back the Changed Item to Parent -----------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName});
  };
  // ------------------------------------------------
}
