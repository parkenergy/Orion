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

  },
  controller: [CrCreateOpportunityInfoCtrl]
});

function CrCreateOpportunityInfoCtrl () {
  // Variables ------------------------------------------
  var self = this;
  // ----------------------------------------------------
  self.WORKS = "crCreateOpportunityInfo Works";
}
