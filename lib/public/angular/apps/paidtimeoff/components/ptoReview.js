angular.module('PaidTimeOffApp.Components')
.component('ptoReview', {
  templateUrl  : '/lib/public/angular/apps/paidtimeoff/views/component-views/ptoReview.html',
  bindings: {
    paidtimeoff: '<',
    approvalStatusChange: '&',
    setManagerReviewed: '&',
    setAdminReviewed: '&',
    textAreaChange: '&',
  },
  controller: [ class PaidTimeOffReviewCtrl {
    constructor () {
      this.status = {
        approved: false,
        rejected: false,
      };
    }

    // Send Back Changed Data and Type --------------------
    thisBoxDataChange(changedData, selected) {
      this.approvalStatusChange({changedData, selected});
    }
    managerCommentChange(changedData, selected) {
      this.textAreaChange({changedData, selected});
    }
    // ----------------------------------------------------

    checkDisabled(type) {
      if (this.paidtimeoff.approvedBy !== '') {
        return true;
      } else {
        return false;
      }
    }
  }]
});
