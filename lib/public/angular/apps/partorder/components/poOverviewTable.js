angular.module('PartOrderApp.Components')
.component('poOverviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
  bindings: {
    partorders: '<',
    locations: '<',
    listIt: '&',
    scrollContentSearch: '&',
    getPartOrderReport: '&',
    contentSearch: '&'
  },
  controller: ['$window', 'LocationItemService', 'DateService', class PoOverviewCtrl {
    constructor ($window, LocationItemService, DateService) {
      this.$window = $window;
      this.LIS = LocationItemService;
      this.DS = DateService;

      this.sortType = 'epoch';
      this.sortReverse = false;
      this.searchFilter = '';
      this.isLoaded = false;

      // query params
      this.username = null;
      this.destination = null;
      this.pending = true;
      this.backorder  = true;
      this.ordered = true;
      this.completed = false;
      this.canceled = false;
      this.size = 50;
      this.page = 0;

      this.dates = {
        from: null,
        fromInput: null,
        to: null,
        toInput: null,
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
    postartOfDay(input) {
      this.dates.fromInput = input;
      if (typeof input === 'object') {
        this.dates.from = new Date(new Date(input).setHours(0,0,0,0));
      }
    };

    poendOfDay(input) {
      this.dates.toInput = input;
      if (typeof input === 'object') {
        this.dates.to = new Date(new Date(input).setHours(23,59,59,999));
      }
    };
    // -------------------------------------------------

    changeThisCheckbox(selected) {
        this.listIt({po: selected});
    };


    // Query Constructor -------------------------------
    queryConstruct(size, page) {
      const query = {
        size: size,
        page: page
      };

      // gather query params
      if ( this.dates.from && this.dates.to ) {
        query.from = this.DS.saveToOrion(this.dates.from);
        query.to = this.DS.saveToOrion(this.dates.to);
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
      if (this.ordered) {
        query.ordered = this.ordered;
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
      if (!po.inList) {
        if ( po.status !== 'canceled' && po.status !== 'completed' ){
          this.$window.open('#/partorder/edit/' + po.orderId);
        } else {
          this.$window.open('#/partorder/review/' + po.orderId);
        }
      } else {
        const pos = [];
        this.partorders.forEach((p) => {
          if (p.inList) {
            pos.push(p._id);
          }
        });
        if (po.inList) {
          this.$window.open('#/partorder/editMany/' + JSON.stringify(pos));
        }
      }
    };
    // -------------------------------------------------

  }]
});
