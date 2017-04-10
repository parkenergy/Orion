angular.module('UnitApp.Components')
  .component('unitMap', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitMap.html',
    bindings: {
      units: '<',
      bounds: '<'
    },
    controller: class UnitMapCtrl {
      constructor() {
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 4
        };

        this.options = {scrollwheel: false};
      }

      static onClick(marker, eventName, model) {
        model.show = !model.show;
      }
    }
  });

