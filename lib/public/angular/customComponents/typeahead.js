angular.module('CommonComponents')
.component('typeAhead',{
  templateUrl: '/lib/public/angular/views/customComponents/typeahead.html',
  bindings: {
    labelText: '@',
    itemPath: '@',
    modelName: '@',
    placeholderText: '@',
    onDataChange: '&',
    wait: '<',
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
  self.$onChanges = function (changes) {
    if ( !self.disabled ){
      if(self.arrayList.length > 0){
        if (typeof self.arrayList[0] === 'object') {
          self.arrayList.map(function (obj) {
            self.objItemArray.push(ObjectService.getNestedObjectValue(obj,self.itemPath));
          });
        } else if (
          (typeof self.arrayList[0] === 'string') ||
          (typeof self.arrayList[0] === 'number') ||
          (typeof self.arrayList[0] === 'boolean')) {
          self.objItemArray = self.arrayList;
        } else {
          console.error({arrayList: self.arrayList}, "An Error occurred while attempting to display typeahead item: " + self.labelText +".");
        }
      }
      
    }
  };
  // ------------------------------------------------

  // Pass back the Changed Item to Parent -----------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName});
  };
  // ------------------------------------------------
}
