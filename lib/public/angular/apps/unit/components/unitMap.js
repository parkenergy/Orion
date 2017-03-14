angular.module('UnitApp.Components', ['uiGmapgoogle-maps'])
  .component('unitMap', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitMap.html',
    bindings: {
      units: '<'
    },
    controller: class UnitMapCtrl {
      constructor() {
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 4,
          bounds: {}
        };

        this.options = {scrollwheel: true};

        this.markers = this.units.map(unit => {
          return {
            id: unit.number,
            geo: unit.geo,
            show: false,
            productSeries: unit.productSeries,
            locationName: unit.locationName,
            customerName: unit.customerName,
            assignedTo: unit.assignedTo,
            nextPmDate: unit.pmReport.nextPmDate
          }
        });
      }

      static onClick(marker, eventName, model) {
        model.show = !model.show;
      }

      static get $inject() {
        return [];
      }
    }
  });

