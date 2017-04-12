angular.module('CallReportApp.Components')
.component('crCreateContactInfo',{
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crCreateContactInfo.html',
  bindings: {
    onSelectChange: '&',
    onTextChange: '&',
    onManualChange: '&',
    activitytypes: '<',
    titles: '<',
    callreport: '<',
    crContactInfo: '<'
  },
  controller: [class CrCreateContactInfoCtrl {
    constructor (){
      this.phoneNumber= /^\d{3}-\d{3}-\d{4}$/;
      this.testEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      
      // Obj for array for Decision Maker -------------------
      this.decisionMakerObjArray = [
        { type: 'Yes' },
        { type: 'No' },
        { type: 'Maybe' }
      ];
      // ----------------------------------------------------
    }
    
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      if(changedData !== 'Other'){
        this.onSelectChange({ changedData, selected});
      } else {
        switch(selected) {
          case "activityType":
            this.onManualChange({ changedData: true, selected: 'isManualActivity' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "title":
            this.onManualChange({ changedData: true, selected: 'isManualTitle' });
            this.onSelectChange({ changedData: '', selected });
            break;
        }
      }
    };
  
    textFieldChange(changedData, selected) {
      if (changedData === '*' && changedData.length < 2) {
        switch(selected) {
          case "activityType":
            this.onManualChange({ changedData: false, selected: 'isManualActivity' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "title":
            this.onManualChange({ changedData: false, selected: 'isManualTitle' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      } else {
        this.onTextChange({ changedData, selected });
      }
    };
    // ----------------------------------------------------
    
  }]
});
