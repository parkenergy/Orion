/**
 *            poReviewTable
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('poReviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewTable.html',
  bindings: {
    partorder: '<'
  }
});
