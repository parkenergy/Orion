angular.module('PartOrderApp.Components')
.component('poReviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewTable.html',
  bindings: {
    partorder: '<'
  }
});
