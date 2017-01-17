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
  self.otherStatus = false;
  self.otherAppType = false;
  self.otherUnitType = false;
  self.objItemArray = [];
  // ----------------------------------------------------

  // Init functions and tasks ---------------------------
  self.$onInit = function () {
    
    // Populate the customer names into an array for typeahead
    self.customers.map(function (obj) {
      self.objItemArray.push(ObjectService.getNestedObjectValue(obj,'name'));
    });
  };
  // ----------------------------------------------------
  
  // Pass back Changes ----------------------------------
  self.selectFieldChange = function (changedData, selected) {
    if(changedData !== 'Other'){
      self.onSelectChange({ changedData: changedData, selected: selected});
    } else {
      switch(selected) {
        case "status":
          self.otherStatus = true;
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "applicationType":
          self.otherAppType = true;
          self.onSelectChange({ changedData: '', selected: selected });
          break;
        case "unitType":
          self.otherUnitType = true;
          self.onSelectChange({ changedData: '', selected: selected });
          break;
      }
    }
  };

  self.textFieldChange = function (changedData, selected) {
    if(changedData === '*' && changedData.length < 2){
      switch(selected) {
        case "status":
          self.otherStatus = false;
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "applicationType":
          self.otherAppType = false;
          self.onTextChange({ changedData: '', selected: selected });
          break;
        case "unitType":
          self.otherUnitType = false;
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

