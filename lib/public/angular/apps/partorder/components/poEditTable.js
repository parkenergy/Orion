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
  controller: EditTableCtrl
});

function EditTableCtrl () {
  // Variables ------------------------------------------
  var self = this;
  self.status = [
    { type: 'shipped', value: false },
    { type: 'backorder', value: false },
    { type: 'canceled', value: false },
    { type: 'completed', value: false }
  ];
  // ----------------------------------------------------

  // Change Selected Check box --------------------------
  self.changeCheckBoxes = function (data, selected) {
    _.map(self.status, function (obj) {
      if ( obj.type === selected ){
        obj.value = true;
        self.status.forEach(function (x) {
          if( x.type !== selected ){
            x.value = false;
          }
        });
      }
    });
  };
  // ----------------------------------------------------

  // Disable check boxes based on Part Order State ------
  self.checkDisabled = function (box) {
    if(box !== 'complete'){
      if(self.partorder.timeShipped){
        return true;
      }
    }
    return false;
  };
  // ----------------------------------------------------

  // Send Back Changed Data and Type --------------------
  self.thisBoxDataChange = function (changedData, selected) {
    console.log(changedData, selected);
    if( changedData === true ) {
      self.changeCheckBoxes(changedData, selected);
      self.onSelection({ changedData: changedData, selected: selected });
    }
  };
  // ----------------------------------------------------
}
