/**
 *            poEditHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoEditHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditHeading.html',
  bindings: {
    onTextChange: '&',
    partorder: '<'
  },
  controller: PartOrderHeadingCtrl
});

function PartOrderHeadingCtrl () {
  // Variables ------------------------------------------
  var self = this;
  // ----------------------------------------------------

  // Pass back Changes ----------------------------------
  self.textFieldChange = function (changedData, selected) {
    self.onTextChange({ changedData: changedData, selected: selected })
  };
  // ----------------------------------------------------
}
