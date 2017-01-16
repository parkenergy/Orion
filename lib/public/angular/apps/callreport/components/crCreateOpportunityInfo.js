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
    activitytypes: '<',
    opportunitysizes: '<',
    unittypes: '<',
    callreport: '<'
  },
  controller: [CrCreateOpportunityInfoCtrl]
});

function CrCreateOpportunityInfoCtrl () {
  // Variables ------------------------------------------
  var self = this;
  // ----------------------------------------------------

  // Pass back Changes ----------------------------------
  self.selectFieldChange = function (changedData, selected) {
    self.onSelectChange({ changedData: changedData, selected: selected});
  };

  self.textFieldChange = function (changedData, selected) {
    self.onTextChange({ changedData: changedData, selected: selected });
  };

  self.checkboxChange = function (changedData, selected) {
    self.onCheckboxChange({ changedData: changedData, selected: selected });
  };

  self.typeaheadChange = function (changedData, selected) {
    self.onTypeaheadChange({ changedData: changedData, selected: selected });
  };
  // ----------------------------------------------------
}

