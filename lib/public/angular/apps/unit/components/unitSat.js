angular.module('UnitApp.Components')
  .component('unitSat', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSat.html',
    bindings: {
      unit: '<'
    },
    controller: class UnitSatCtrl {
      constructor() {

        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 10,
          bounds: {}
        };

        this.options = {scrollwheel: false, mapTypeId: google.maps.MapTypeId.SATELLITE};
      }

      $onInit() {
        this.map = {
          center: _.cloneDeep(this.unit.geo),
          zoom: 10,
          bounds: {}
        };

        let now = new Date();
        let sevenDaysAgo= moment().subtract(7, 'days');
        let pmDate = this.unit.pmReport ? new Date(this.unit.pmReport.nextPmDate) : null;

        let icon = 'lib/public/images/marker_grey.png';
        if(pmDate) {
          //If pmDate has passed, icon is red
          if (moment(now).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_red.png';
          }
          //If pmDate is under 7 days away, icon is yellow
          else if(moment(sevenDaysAgo).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_yellow.png';
          }
          //pmDate hasn't passed and is more than 7 days away
          else {
            icon = 'lib/public/images/marker_green.png';
          }
        }

        this.marker = {
          id: 0,
          geo: this.unit.geo,
          options: {
            icon
          }
        }
      }

      static get $inject() {
        return [];
      }
    }
  });