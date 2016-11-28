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
    loaded: '<',
    isLoaded: '&',
    contentSearch: '&'
  },
  controller: ['$location', '$cookies', '$http', OverviewCtrl]
});

function OverviewCtrl ($location, $cookies, $http) {
  var self = this;
  // Variable Declarations ---------------------------
  self.sortType = 'epoch';
  self.sortReverse = false;
  self.searchFilter = '';
  self.displayOrders = [];

  // query params
  self.pending = false;
  self.backordered  = false;
  self.shipped = false;
  self.completed = false;
  self.canceled = false;
  self.limit = 50;
  self.skip = 0;
  // -------------------------------------------------

  // Initialize --------------------------------------
  self.$onInit = function () {
    self.changeLoadedState(false);
  };
  // -------------------------------------------------


  // is Loaded switch --------------------------------
  self.changeLoadedState = function (state) {
    self.isLoaded({ bool: state });
  };
  // -------------------------------------------------

  self.lookupPos = function (obj) {
    self.loaded = false;
  };

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

  // Routing ------------------------------------------
  self.routeToPartOrder = function (po) {
    $location.url('#/partorder/edit/' + po._id);
  };
  // --------------------------------------------------
}

// Infinite Scroll Settings ---------------------------
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
// ----------------------------------------------------
