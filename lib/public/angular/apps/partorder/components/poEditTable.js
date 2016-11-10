/**
 *            poEditTable
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoEditTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditTable.html',
  bindings: {
    partorder: '<'   // one way data binding for partorder
  },
  controller: ['$location', ReviewTableCtrl]
});

function ReviewTableCtrl ($location) {
  this.completeForm = function () {
    $location.url('/partorder')
  };
}
