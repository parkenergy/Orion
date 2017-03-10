angular.module('UnitApp.Components', ['leaflet-directive'])
  .component('unitInfo', {
    templateUrl: '/lib/public/angular/apps/unit/components/unitMap.js',
    bindings: {
      unit: '<',
      user: '<',
      supervisor: '<'
    }
  });
