/**
 *            crOverviewTable
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Components')
.component('crOverviewTable', {
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crOverviewTable.html',
  bindings: {
    callreports: '<',
    loadOnScroll: '&',
    scrollContentSearch: '&',
    contentSearch: '&'
  },
  controller: ['$window', CrOverviewCtrl]
});

function CrOverviewCtrl ($window) {
  var self = this;
  // Variable Declarations ---------------------------
  self.sortType = 'epoch';
  self.sortReverse = false;
  self.searchFilter = '';

  // query params
  self.limit = 50;
  self.skp = 0;
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
    self.dates.from = new Date(self.dates.from.setUTCHours(0,0,0,0));
  };

  self.endOfDay = function () {
    self.dates.to = new Date(self.dates.to.setUTCHours(23,59,59,999));
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
  self.routeToCallReport = function (cr) {
    $window.open('#/callreport/review/' + cr._id);
  };
  // -------------------------------------------------
}
