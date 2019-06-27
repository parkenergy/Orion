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
      constructor() {
          this.doShow = this.show
      }

      $onChanges(ch) {
          if (ch.show !== undefined && ch.show.previousValue !== undefined) {
              if (ch.show.previousValue !== ch.show.currentValue) {
                  this.doShow = this.show
              }
          }
      }
    onUpdate(item) {
      this.onDataChange({ changedData: item, selected: this.modelName})
    }
  }
});
