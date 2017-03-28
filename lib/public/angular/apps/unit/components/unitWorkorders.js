angular.module('UnitApp.Components')
  .component('unitWorkorders', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitWorkorders.html',
    bindings: {
      unitNumber: '<'
    },
    controller: ['$http', class UnitWorkordersCtrl {
      constructor($http) {
        this.$http = $http;
      }

      $onInit() {
        const url = `api/units/${this.unitNumber}/workorders`;

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

      static get $inject() {
        return [
          '$http'
        ];
      }
    }]
  });
