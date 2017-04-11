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

        //Add bounds to query params(if bounds exist)
        /*if(this.bounds) {
          params.ne = `${this.bounds.northeast.longitude}:${this.bounds.northeast.latitude}`;
          params.sw = `${this.bounds.southwest.longitude}:${this.bounds.southwest.latitude}`;
        }*/

        console.log(params);
        this.Units.query(params).$promise
          .then(units => {
            this.units = units.map(unit => {
              let now = new Date();
              let sevenDaysAgo= moment().subtract(7, 'days');
              let pmDate = unit.pmReport ? new Date(unit.pmReport.nextPmDate) : null;

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

              return {
                id: unit.number,
                geo: unit.geo,
                show: false,
                productSeries: unit.productSeries,
                locationName: unit.locationName,
                customerName: unit.customerName,
                assignedTo: unit.assignedTo,
                pmDate,
                icon
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


