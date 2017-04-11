angular.module('UnitApp.Components')
  .component('unitWorkorders', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitWorkorders.html',
    bindings: {
      unit: '<'
    },
    controller: ['$http', '$window', class UnitWorkordersCtrl {
      constructor($http, $window) {
        this.$http = $http;
        this.$window = $window;
      }

      $onInit() {
        const url = `/api/units/${this.unit.number}/workorders`;

        this.$http.get(url)
          .then(res => {
            this.workorders = res.data;
          })
          .catch(res => {
            console.log("Failed to fetch WorkOrders");
            console.log(res.status);
            console.log(res.data);
          });
      }

      onClick(id) {
        this.$window.open('#/workorder/review/' + id);
      }
    }]
  });
