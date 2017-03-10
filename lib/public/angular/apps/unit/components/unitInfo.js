angular.module('UnitApp.Components', ['leaflet-directive'])
  .component('unitInfo', {
    templateUrl: '/lib/public/angular/apps/unit/components/unitMap.js',
    bindings: {
      unit: '<',
      user: '<',
      supervisor: '<'
    },
    controller: UnitMapCtrl
  });

class UnitMapCtrl {
  constructor() {

  }

  static get $inject() {
    return [];
  }
}
