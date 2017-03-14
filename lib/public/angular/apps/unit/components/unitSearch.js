angular.module('UnitApp.Components', ['leaflet-directive'])
  .component('unitSearch', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSearch.html',
    controller: ['$location', class UnitSearchCtrl {
      constructor($location) {
        this.$location = $location;

        this.params = {
          number: null, //Unit Number
          supervisor: null, //Supervisor techID
          tech: null, //TechID unit is assigned to
          customer: null,
          from: null,
          to: null
        };
      }

      search() {
        this.$location.search(_.compact(this.params));
      }

      static get $inject() {
        return [
          '$location'
        ];
      }
    }]
  });


