angular.module('CallReportApp.Components')
.component('crCreateOpportunityInfo',{
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crCreateOpportunityInfo.html',
  bindings: {
    onSelectChange: '&',
    onTextChange: '&',
    onCheckboxChange: '&',
    onTypeaheadChange: '&',
    onManualChange: '&',
    customers: '<',
    statustypes: '<',
    opptypes: '<',
    applicationtypes: '<',
    opportunitysizes: '<',
    unittypes: '<',
    callreport: '<',
    crOppInfo: '<'
  },
  controller: ['ObjectService', class CrCreateOpportunityInfoCtrl {
    constructor (ObjectService) {
      this.ObjectService = ObjectService;
    }
  
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      if(changedData !== 'Other'){
        this.onSelectChange({ changedData, selected});
      } else {
        switch(selected) {
          case "status":
            this.onManualChange({ changedData: true, selected: 'isManualStatus' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "applicationType":
            this.onManualChange({ changedData: true, selected: 'isManualAppType' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "unitType":
            this.onManualChange({ changedData: true, selected: 'isManualUnitType' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "oppType":
            this.onManualChange({ changedData: true, selected: 'isManualOppType' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      }
    };
  
    textFieldChange(changedData, selected) {
      if(changedData === '*' && changedData.length < 2){
        switch(selected) {
          case "status":
            this.onManualChange({ changedData: false, selected: 'isManualStatus' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "applicationType":
            this.onManualChange({ changedData: false, selected: 'isManualAppType' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "unitType":
            this.onManualChange({ changedData: false, selected: 'isManualUnitType' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "oppType":
            this.onManualChange({ changedData: false, selected: 'isManualOppType' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      } else {
        this.onTextChange({ changedData, selected });
      }
    };
  
    checkboxChange(changedData, selected) {
      this.onCheckboxChange({ changedData, selected });
    };
  
    typeaheadChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    };
    // ----------------------------------------------------
    
  }]
});
