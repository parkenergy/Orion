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

  },
  controller: [CrCreateContactInfoCtrl]
});

function CrCreateContactInfoCtrl () {
  // Variables ------------------------------------------
  var self = this;
  // ----------------------------------------------------
  self.WORKS = "crCreateContactInfo Works";
}
