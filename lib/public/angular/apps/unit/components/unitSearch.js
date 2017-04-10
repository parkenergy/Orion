angular.module('UnitApp.Components')
  .component('unitSearch', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSearch.html',
    bindings: {
      onTypeaheadChange: '&',
      displayUnits: '<',
      users: '<',
      customers: '<',
      units: '='
    },
    controller: ['Units', 'AlertService', class UnitSearchCtrl {
      constructor( Units, AlertService) {
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
      
      // Search Changes -------------------------------------
      unitChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      supervisorChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      techChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      customerChange(changedData, selected){
        this.onTypeaheadChange({ changedData, selected });
      }
      // ----------------------------------------------------
  
      search() {
        const params = _.omitBy(this.params, _.isEmpty);
        
        params.size = 99999;
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
          })
          .catch(err => {
            this.AlertService.add("danger", "Failed to load", 2000);
            console.log(err);
          });
      }
      
    }]
  });


