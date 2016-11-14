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
    partorder: '<',   // one way data binding for partorder
    onSelection: '&'
  },
  controller: ReviewTableCtrl
});

function ReviewTableCtrl () {
  var self = this;

  self.thisBoxDataChange = function (changedData, selected) {
    self.onSelection({ changedData: changedData, selected: selected });
  }

}
