angular.module('UnitApp.Components', ['uiGmapgoogle-maps'])
  .component('unitBirdsEye', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitBirdsEye.html',
    bindings: {
      unit: '<'
    },
    controller: class UnitBirdsEyeCtrl {
      constructor() {
        this.map = {
          center: this.unit.geo,
          zoom: 18,
          bounds: {}
        };

        this.options = {scrollwheel: true};
      }

      static get $inject() {
        return [];
      }
    }
  });
