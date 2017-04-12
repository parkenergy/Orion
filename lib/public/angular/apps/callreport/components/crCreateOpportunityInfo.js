/**
 *            crCreateOpportunityInfo
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
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
  controller: ['ObjectService',CrCreateOpportunityInfoCtrl]
});

function CrCreateOpportunityInfoCtrl (ObjectService) {
  // Variables ------------------------------------------
  var self = this;
  self.objItemArray = [];
  // ----------------------------------------------------
  
  // Pass back Changes ----------------------------------
  self.selectFieldChange = function (changedData, selected) {
    if(changedData !== 'Other'){
      self.onSelectChange({ changedData: changedData, selected: selected});
    } else {
      switch(selected) {
        case "status":
          self.onManualChange({ changedData: true, selected: 'isManualStatus' });
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "applicationType":
          self.onManualChange({ changedData: true, selected: 'isManualAppType' });
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "unitType":
          self.onManualChange({ changedData: true, selected: 'isManualUnitType' });
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "oppType":
          self.onManualChange({ changedData: true, selected: 'isManualOppType' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
      }
    }
  };

  self.textFieldChange = function (changedData, selected) {
    if(changedData === '*' && changedData.length < 2){
      switch(selected) {
        case "status":
          self.onManualChange({ changedData: false, selected: 'isManualStatus' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "applicationType":
          self.onManualChange({ changedData: false, selected: 'isManualAppType' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "unitType":
          self.onManualChange({ changedData: false, selected: 'isManualUnitType' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "oppType":
          self.onManualChange({ changedData: false, selected: 'isManualOppType' });
          self.onTextChange({ changedData: '', selected: selected });
          break;
      }
    } else {
      self.onTextChange({ changedData: changedData, selected: selected });
    }
  };

  self.checkboxChange = function (changedData, selected) {
    self.onCheckboxChange({ changedData: changedData, selected: selected });
  };

  self.typeaheadChange = function (changedData, selected) {
    self.onTypeaheadChange({ changedData: changedData, selected: selected });
  };
  // ----------------------------------------------------
}

