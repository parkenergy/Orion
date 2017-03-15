angular.module('UnitApp.Components')
  .component('unitInfo', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitInfo.html',
    bindings: {
      unit: '<',
      user: '<',
      supervisor: '<'
    }
  });
