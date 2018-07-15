angular.module('PaidTimeOffApp.Components')
.component('ptoReview', {
  templateUrl  : '/lib/public/angular/apps/paidtimeoff/views/component-views/ptoReview.html',
    bindings:    {
        paidtimeoff:          '<',
        setAdminChanges:      '&',
        approvalStatusChange: '&',
        setManagerReviewed:   '&',
        textAreaChange:       '&',
  },
    controller:  ['$cookies', '$timeout', class PaidTimeOffReviewCtrl {
        constructor ($cookies, $timeout) {
            this.role = $cookies.get('role');
            this.$timeout = $timeout;
            this.edit = false;
      this.status = {
        approved: false,
        rejected: false,
      };
    }

        $onInit () {
            if (this.paidtimeoff.status === 'Approved') {
                this.status.approved = true;
                this.status.rejected = false;
            }
            if (this.paidtimeoff.status === 'Rejected') {
                this.status.rejected = true;
                this.status.approved = false;
            }
        }

        $doCheck () {
            if (this.paidtimeoff.status === 'Approved') {
                this.status.approved = true;
                this.status.rejected = false;
            }
            if (this.paidtimeoff.status === 'Rejected') {
                this.status.rejected = true;
                this.status.approved = false;
            }
        }

    // Send Back Changed Data and Type --------------------
    thisBoxDataChange(changedData, selected) {
        this.approvalStatusChange({selected});
    }
    managerCommentChange(changedData, selected) {
      this.textAreaChange({changedData, selected});
    }
    // ----------------------------------------------------

        editPTO () {
            this.$timeout(() => this.edit = !this.edit);
        }

  }]
});
