angular.module('UnitApp.Components', ['leaflet-directive'])
  .component('unitBirdsEye', {
    templateUrl: '/lib/public/angular/apps/unit/components/unitMap.js',
    bindings: {
      unit: '<'
    },
    controller: UnitMapCtrl
  });

class UnitMapCtrl {
  constructor() {
    this.lat = this.unit.geo.coordinates[1];
    this.lng = this.unit.geo.coordinates[0];

    this.center = {
      lat: this.lat,
      lng: this.lng,
      zoom: 18
    };

    this.layers = {
      baselayers: {
        googleHybrid: {
          name: 'Google Hybrid',
          layerType: 'HYBRID',
          type: 'google'
        }
      }
    };

    this.defaults = {
      scrollWheelZoom: false
    };

    this.markers = {};

    const msg = `Latitude: ${this.lat}\nLongitude: ${this.lng}`;

    markers[this.unit.number] = {
      lat: unit.geo.coordinates[1],
      lng: unit.geo.coordinates[0],
      message: msg,
      focus: true,
      draggable: false
    };
  }

  static get $inject() {
    return [];
  }
}
