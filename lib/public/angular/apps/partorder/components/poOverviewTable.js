/**
 *            poOverviewTable
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('poOverviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
  bindings: {
    partorders: '<',
    loadOnScroll: '&',
    scrollContentSearch: '&',
    contentSearch: '&'
  },
  controller: ['$location', OverviewCtrl]
});

function OverviewCtrl ($location) {
  var self = this;
  // Variable Declarations ---------------------------
  self.sortType = 'epoch';
  self.sortReverse = false;
  self.searchFilter = '';

  // query params
  self.pending = true;
  self.backorder  = true;
  self.shipped = true;
  self.completed = false;
  self.canceled = false;
  self.limit = 50;
  self.skip = 0;

  self.dates = {
    from: null,
    to: null
  };
  // -------------------------------------------------

  // Initializes original search ---------------------
  self.$onInit = function () {
    self.submit();
  };
  // -------------------------------------------------

  // Sorting for Table -------------------------------
  self.resort = function (by) {
    self.sortType = by;
    self.sortReverse = !self.sortReverse;
  };
  // -------------------------------------------------

  // Get start and end of Day ------------------------
  self.startOfDay = function () {
    self.dates.from = new Date(self.dates.from.setHours(0,0,0,0));
  };

  self.endOfDay = function () {
    self.dates.to = new Date(self.dates.to.setHours(23,59,59,999));
  };
  // -------------------------------------------------

  // Query Constructor -------------------------------
  self.queryConstruct = function (limit, skip) {
    var query = {
      limit: limit,
      skip: skip
    };

    // gather query params
    if ( self.dates.from && self.dates.to ) {
      query.from = encodeURIComponent(self.dates.from.toISOString());
      query.to = encodeURIComponent(self.dates.to.toISOString());
    }
    if (self.pending) {
      query.pending = self.pending;
    }
    if (self.shipped) {
      query.shipped = self.shipped;
    }
    if (self.backorder) {
      query.backorder = self.backorder;
    }
    if (self.canceled) {
      query.canceled = self.canceled;
    }
    if (self.completed) {
      query.completed = self.completed;
    }

    return query;
  };
  // -------------------------------------------------

  // Load content on scroll from Parent Controller ---
  self.loadOnScroll = function () {
    console.log("Scrolling...");
    self.skip += self.limit;

    var query = self.queryConstruct(self.limit, self.skip);

    self.scrollContentSearch({ query: query });
  };
  // -------------------------------------------------

  // Submit Query to Parent Controller ---------------
  self.submit = function () {
    self.limit = 50;
    self.skip = 0;

    var query = self.queryConstruct(self.limit, self.skip);

    self.contentSearch({ query: query });
  };
  // -------------------------------------------------

  // Routing -----------------------------------------
  self.routeToPartOrder = function (po) {
    if ( po.status !== 'canceled' && po.status !== 'completed' ){
      $location.url('/partorder/edit/' + po._id);
    } else {
      $location.url('/partorder/review/' + po._id);
    }
  };
  // -------------------------------------------------
}
