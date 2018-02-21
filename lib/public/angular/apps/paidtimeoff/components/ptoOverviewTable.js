angular.module('PaidTimeOffApp.Components')
  .component('ptoOverviewTable', {
    templateUrl: '/lib/public/angular/apps/paidtimeoff/views/component-views/ptoOverviewTable.html',
    bindings: {
      paidtimeoffs: '<',
      scrollContentSearch: '&',
      getPaidTimeOffReport: '&',
      contentSearch: '&'
    },
    controller: ['$window', '$cookies', 'DateService', class PoOverviewCtrl {
      constructor ($window, $cookies, DateService) {
        this.$window = $window;
        this.$cookies = $cookies;
        this.DS = DateService;

        this.sortType = 'epoch';
        this.sortReverse = false;
        this.searchFilter = '';
        this.isLoaded = false;

        // query params
        this.username = '';
        this.type = '';
        this.approved = false;
        this.rejected = false;
        this.adminReviewed = false;

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
        this.role = this.$cookies.get('role');
        if (this.role === 'admin') {
          this.approved = true;
          this.rejected = true;
        }
        if (this.role === 'manager') {
          this.approved = false;
          this.rejected = false;
        }

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
      ptostartOfDay(input) {
        this.dates.fromInput = input;
        if (typeof input === 'object') {
          this.dates.from = new Date(new Date(input).setHours(0,0,0,0));
        }
      };

      ptoendOfDay(input) {
        this.dates.toInput = input;
        if (typeof input === 'object') {
          this.dates.to = new Date(new Date(input).setHours(23,59,59,999));
        }
      };
      // -------------------------------------------------

      stringForType(pto) {
        if (pto.approved) {
          return 'approved';
        }
        if (pto.rejected) {
          return 'rejected';
        }
        if (!pto.rejected && !pto.approved) {
          return 'not reviewed';
        }
      }

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
          query.username = this.username.toUpperCase();
        }
        if (this.type) {
          query.type = this.type;
        }
        query.approved = this.approved;
        query.rejected = this.rejected;
        query.adminReviewed = this.adminReviewed;

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

        this.getPaidTimeOffReport({ query });
      };
      // -------------------------------------------------

      // clear -------------------------------------------
      clearText(selected) {
        switch (selected) {
          case 'username':
            this.username = null;
            break;
          case 'type':
            this.type = null;
            break;
        }
      }
      // -------------------------------------------------

      // Routing -----------------------------------------
      routeToPaidTimeOff(pto) {
        this.$window.open('#/paidtimeoff/review/' + pto._id);
      };
      // -------------------------------------------------

    }]
  });
