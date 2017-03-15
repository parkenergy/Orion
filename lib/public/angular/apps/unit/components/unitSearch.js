angular.module('UnitApp.Components')
  .component('unitSearch', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSearch.html',
    bindings: {
      units: '='
    },
    controller: ['$location', 'Units', 'AlertService', class UnitSearchCtrl {
      constructor($location, Units, AlertService) {
        this.$location = $location;
        this.Units = Units;
        this.AlertService = AlertService;

        this.params = {
          number: null, //Unit Number
          supervisor: null, //Supervisor techID
          tech: null, //TechID unit is assigned to
          customer: null,
          from: null,
          to: null,
          size: 100
        };
      }

      search() {
        const params = _.omitBy(this.params, _.isEmpty);
        console.log(params);
        this.Units.query(params).$promise
          .then(units => {
            this.units = units.map(unit => {
              return {
                id: unit.number,
                geo: unit.geo,
                show: false,
                productSeries: unit.productSeries,
                locationName: unit.locationName,
                customerName: unit.customerName,
                assignedTo: unit.assignedTo
              }
            });

            console.log(this.units);
          })
          .catch(err => {
            this.AlertService.add("danger", "Failed to load", 2000);
            console.log(err);
          });
      }

      static get $inject() {
        return [
          '$location',
          'Units',
          'AlertService'
        ];
      }
    }]
  });


