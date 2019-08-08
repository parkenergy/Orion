angular.module('CommonComponents')
.component('timeField', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/timefield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    onDataChange: '&',
    data: '<',
    hours: '<',
    minutes: '<',
    show: '<',
    disabled: '<'
  },
  controller: class TimeFieldCtrl {
      constructor() {}

      $onChanges(ch) {}

      onUpdate(item) {
          this.onDataChange({changedData: item, selected: this.modelName})
      }
  }
});
