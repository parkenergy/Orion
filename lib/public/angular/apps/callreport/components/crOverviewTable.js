angular.module('CallReportApp.Components')
.component('crOverviewTable', {
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crOverviewTable.html',
  bindings: {
    scrollContentSearch: '&',
    contentSearch: '&',
    onTypeaheadChange: '&',
    users: '<',
    customers: '<',
    callreports: '<'
  },
  controller: ['$window', class CrOverviewCtrl {
    constructor($window){
      this.$window = $window;
      this.sortType = 'epoch';
      this.sortReverse = false;
      this.searchFilter = '';
  
      // query params
      this.limit = 50;
      this.skip = 0;
      this.customerName = null;
      this.userName = null;
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
  
    // Search Changes ----------------------------------
    customerChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    }
    userChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    }
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
    queryConstruct(limit, skip) {
      const query = {
        limit: limit,
        skip: skip
      };
    
      // gather query params
      if ( this.dates.from && this.dates.to ) {
        query.from = this.dates.from;
        query.to = this.dates.to;
      }
      
      if( this.userName ){
        query.username = this.userName;
      }
      
      if( this.customerName ) {
        query.customer = this.customerName;
      }
      
      return query;
    };
    // -------------------------------------------------
  
    // Load content on scroll from Parent Controller ---
    loadOnScroll() {
      console.log("Scrolling...");
      this.skip += this.limit;
    
      const query = this.queryConstruct(this.limit, this.skip);
    
      this.scrollContentSearch({ query });
    };
    // -------------------------------------------------
  
    // Submit Query to Parent Controller ---------------
    submit() {
      this.limit = 50;
      this.skip = 0;
    
      const query = this.queryConstruct(this.limit, this.skip);
      
      this.contentSearch({ query });
    };
    // -------------------------------------------------
  
    clearText(selected) {
      switch (selected) {
        case 'customer':
          this.customerName = null;
          break;
        case 'user':
          this.userName = null;
          break;
      }
    }
    
    // Routing -----------------------------------------
    routeToCallReport(cr) {
      this.$window.open('#/callreport/review/' + cr._id);
    };
    // -------------------------------------------------
  }]
});
