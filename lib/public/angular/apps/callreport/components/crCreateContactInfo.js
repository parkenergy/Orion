/**
 *            crCreateContactInfo
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
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
  controller: [CrCreateContactInfoCtrl]
});

function CrCreateContactInfoCtrl () {
  // Variables ------------------------------------------
  var self = this;
  
  self.phoneNumber= /^\d{3}-\d{3}-\d{4}$/;
  self.testEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // ----------------------------------------------------
  
  // Obj for array for Decision Maker -------------------
  self.decisionMakerObjArray = [
    { type: 'Yes' },
    { type: 'No' },
    { type: 'Maybe' }
  ];
  // ----------------------------------------------------
  
  // Pass back Changes ----------------------------------
  self.selectFieldChange = function (changedData, selected) {
    if(changedData !== 'Other'){
      self.onSelectChange({ changedData: changedData, selected: selected});
    } else {
      switch(selected) {
        case "activityType":
          self.onManualChange({ changedData: true, selected: 'isManualActivity' });
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "title":
          self.onManualChange({ changedData: true, selected: 'isManualTitle' });
          self.onSelectChange({ changedData: '', selected: selected });
          break;
      }
    }
  };

  self.textFieldChange = function (changedData, selected) {
    if (changedData === '*' && changedData.length < 2) {
      switch(selected) {
        case "activityType":
          self.onManualChange({ changedData: false, selected: 'isManualActivity' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "title":
          self.onManualChange({ changedData: false, selected: 'isManualTitle' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
      }
    } else {
      self.onTextChange({ changedData: changedData, selected: selected });
    }
  };
  // ----------------------------------------------------
}
