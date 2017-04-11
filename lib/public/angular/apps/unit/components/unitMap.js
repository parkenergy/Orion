angular.module('UnitApp.Components')
  .component('unitMap', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitMap.html',
    bindings: {
      units: '<',
      bounds: '<'
    },
    controller: ['$window',class UnitMapCtrl {
      constructor($window) {
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 4,
          markerEvents: {
            click: (marker, eventName, model) => {
              this.map.window.model = model;
              this.map.window.show = true;
            }
          },
          window: {
            marker: {},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          },
          options: {
            pixelOffset: {
              width: -1,
              height: -45
            }
          }
        };

        this.options = {scrollwheel: false};
      }
    }]
  });

