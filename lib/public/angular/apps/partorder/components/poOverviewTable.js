angular.module('PartOrderApp.Components')
.component('poOverviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
  bindings: {
    partorders: '<',
    locations: '<',
    scrollContentSearch: '&',
    getPartOrderReport: '&',
    contentSearch: '&'
  },
  controller: ['$window', 'LocationItemService',class PoOverviewCtrl {
    constructor ($window, LocationItemService) {
      this.$window = $window;
      this.LIS = LocationItemService;
  
      this.sortType = 'epoch';
      this.sortReverse = false;
      this.searchFilter = '';
      this.isLoaded = false;
  
      // query params
      this.username = null;
      this.destination = null;
      this.pending = true;
      this.backorder  = true;
      this.shipped = true;
      this.completed = false;
      this.canceled = false;
      this.size = 50;
      this.page = 0;
  
      this.dates = {
        from: null,
        to: null
      };
    }
  
    // Initializes original search ---------------------
    $onInit() {
      this.submit();
    };
    // -------------------------------------------------
  
    // Sorting for Table -------------------------------
    resort(by) {
      this.sortType = by;
      this.sortReverse = !this.sortReverse;
    };
    // -------------------------------------------------
  
    // Get start and end of Day ------------------------
    startOfDay() {
      this.dates.from = new Date(this.dates.from.setHours(0,0,0,0));
    };
  
    endOfDay() {
      this.dates.to = new Date(this.dates.to.setHours(23,59,59,999));
    };
    // -------------------------------------------------
  
    // Query Constructor -------------------------------
    queryConstruct(size, page) {
      const query = {
        size: size,
        page: page
      };
    
      // gather query params
      if ( this.dates.from && this.dates.to ) {
        query.from = this.dates.from;
        query.to = this.dates.to;
      }
      if (this.username) {
        query.techId = this.username.toUpperCase();
      }
      if (this.destination) {
        query.destination = this.LIS.getTruckFromString(this.destination, this.locations).netsuiteId;
      }
      if (this.pending) {
        query.pending = this.pending;
      }
      if (this.shipped) {
        query.shipped = this.shipped;
      }
      if (this.backorder) {
        query.backorder = this.backorder;
      }
      if (this.canceled) {
        query.canceled = this.canceled;
      }
      if (this.completed) {
        query.completed = this.completed;
      }
    
      return query;
    };
    // -------------------------------------------------
  
    // Load content on scroll from Parent Controller ---
    loadOnScroll() {
      console.log("Scrolling...");
      this.page += this.size;
    
      const query = this.queryConstruct(this.size, this.page);
      this.scrollContentSearch({ query });
    };
    // -------------------------------------------------
  
    // Submit Query to Parent Controller ---------------
    submit() {
      this.size = 50;
      this.page = 0;
    
      const query = this.queryConstruct(this.size, this.page);
      this.contentSearch({ query });
    };
    // -------------------------------------------------
  
    // Submit Query to get Report to Parent Controller -
    getReport() {
      const query = this.queryConstruct(this.size, this.page);
    
      query.report = true;
    
      this.getPartOrderReport({ query });
    };
    // -------------------------------------------------
  
    // clear -------------------------------------------
    clearText(selected) {
      switch (selected) {
        case 'username':
          this.username = null;
          break;
        case 'destination':
          this.destination = null;
          break;
      }
    }
    // -------------------------------------------------
    
    // Routing -----------------------------------------
    routeToPartOrder(po) {
      if ( po.status !== 'canceled' && po.status !== 'completed' ){
        this.$window.open('#/partorder/edit/' + po.orderId);
      } else {
        this.$window.open('#/partorder/review/' + po.orderId);
      }
    };
    // -------------------------------------------------
    
  }]
});
