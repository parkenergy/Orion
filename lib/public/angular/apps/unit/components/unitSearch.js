angular.module('UnitApp.Components')
  .component('unitSearch', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSearch.html',
    bindings: {
      populateUnits: '&',
      onTypeaheadChange: '&',
      displayUnits: '<',
      users: '<',
      customers: '<',
    },
    controller: [ class UnitSearchCtrl {
      constructor() {
        this.params = {
          numbers: null, //Unit Numbers
          supervisor: null, //Supervisor techID
          techs: null, //TechID unit is assigned to
          customer: null,
          from: null,
          to: null,
          size: 99999
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
      
      // Clear search terms ---------------------------------
      clearText(selected){
        switch (selected) {
          case 'unitNumber':
            this.params.numbers = null;
            break;
          case 'supervisor':
            this.params.supervisor = null;
            break;
          case 'tech':
            this.params.techs = null;
            break;
          case 'customer':
            this.params.customer = null;
            break;
        }
      }
      // ----------------------------------------------------
  
      // Send search to Parent to populate Units ------------
      search() {
        const params = _.omitBy(this.params, _.isNull);
        this.populateUnits({params});
      }
      // ----------------------------------------------------
    }]
  });


