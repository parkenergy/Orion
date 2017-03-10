angular.module('UnitApp.Components', ['leaflet-directive'])
.component('unitMap', {
  templateUrl: '/lib/public/angular/apps/unit/components/unitMap.js',
  bindings: {
    units: '<'
  },
  controller: UnitMapCtrl
});

class UnitMapCtrl {
  constructor() {
    this.center = {
      lat: 37.996162679728116,
      lng: -98.0419921875,
      zoom: 4
    };

    this.layers = {
      OpenStreetMap: {
        xyz: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        }
      }
    };

    this.defaults = {
      scrollWheelZoom: true
    };

    this.markers = {};

    this.units.forEach(unit => {
      let html = `Unit Number: <a href="/#/unit/view/${unit.number}">${unit.number}</a>\n`;
      html += `Unit Type: ${unit.productSeries}\n`;
      html += `Lease: ${unit.locationName}\n`;
      html += `Customer: ${unit.customerName}\n`;
      html += `Tech: ${unit.assignedTo}\n`;
      html += `Netsuite ID: ${unit.netsuiteId}\n`;
      html += `Next PM Date: ${unit.pmReport.nextPmDate}`;

      markers[unit.number] = {
        lat: unit.geo.coordinates[1],
        lng: unit.geo.coordinates[0],
        message: html,
        focus: false,
        draggable: false
      }
    });
  }

  static get $inject() {
    return [];
  }
}
