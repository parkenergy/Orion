/**
 *            poOverviewTable
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoOverviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
  bindings: {
    partorders: '<',
    contentSwitch: '&'
  },
  controller: ['$location', '$cookies', '$http', OverviewCtrl]
});

function OverviewCtrl ($location, $cookies, $http) {
  var self = this;
  // Variable Declarations ---------------------------
  self.sortType = 'epoch';
  self.sortReverse = false;
  self.loaded = false;
  self.searchFilter = '';
  self.displayOrders = [];
  // -------------------------------------------------

  // Sorting for Table -------------------------------
  self.resort = function (by) {
    self.sortType = by;
    self.sortReverse = !self.sortReverse;
  };

  _.forEach(self.partorders, function (po) {
    po.epoch = new Date(po.timeCreated).getTime();
    return po;
  });
  // -------------------------------------------------

  // Set Display Type --------------------------------     **
  /*if ( self.panelType === 'incomplete' ) {
    _.forEach(self.partorders, function (obj) {
      if ( obj.status !== 'complete' ) {
        self.displayOrders.push(obj);
      }
    });
  }
  if ( self.panelType === 'completed' ) {
    _.forEach(self.partorders, function (obj) {
      if ( obj.status === 'complete' ) {
        self.displayOrders.push(obj);
      }
    });
  }*/
  // --------------------------------------------------     **

  // Search Table Content Switch ----------------------     **
  /*self.changeTable = function () {
    self.contentSwitch({ type: self.panelType });
  };*/
  // --------------------------------------------------     **

  // Routing ------------------------------------------
  self.routeToPartOrder = function (po) {
    $location.url('#/partorder/edit/' + po._id);
  };
  // --------------------------------------------------
}

// Infinite Scroll Settings ---------------------------
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
// ----------------------------------------------------
