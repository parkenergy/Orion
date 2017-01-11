angular.module('CommonComponents')
.component('typeAhead',{
  templateUrl: '/lib/public/angular/views/customComponents/typeahead.html',
  bindings: {
    labelText: '@',
    itemPath: '@',
    modelName: '@',
    placeholderText: '@',
    onDataChange: '&',
    arrayList: '<',
    data: '<',
    limit: '<',
    disabled: '<'
  },
  controller: ['ObjectService', TypeAheadCtrl]
});

function TypeAheadCtrl (ObjectService) {
  var self = this;
  self.objItemArray = [];

  // Make array list display field ------------------
  self.$onInit = function () {
    self.arrayList.map(function (obj) {
      self.objItemArray.push(ObjectService.getNestedObjectValue(obj,self.itemPath));
    });
  };
  // ------------------------------------------------

  // Pass back the Changed Item to Parent -----------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName});
  };
  // ------------------------------------------------
}
