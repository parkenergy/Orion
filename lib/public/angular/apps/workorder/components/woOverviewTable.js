angular.module('WorkOrderApp.Components')
.component('woOverviewTable', {
  templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woOverviewTable.html',
  bindings: {
    scrollContentSearch: '&',
    contentReport: '&',
    woDumpReport: '&',
    woPartsDumpReport: '&',
    contentSearch: '&',
    onTextFieldChange: '&',
    onCheckBoxChange: '&',
    woSearchCount: '<',
    reportDisabled: '<',
    workorders: '<',
    startTime: '<',
    endTime: '<',
    woType: '<',
    techId: '<',
  },
  controller: ['$window','$cookies','SessionService','TimeDisplayService', class WorkOrderOverviewTableCCtrl {
    constructor($window,$cookies,SessionService,TimeDisplayService) {
      // Initialize all variables on component
      this.$window = $window;
      this.$cookies = $cookies;
      this.TDS = TimeDisplayService;
      this.SS = SessionService;

      this.orderByField = 'epoch';
      this.reverseSort = true;
      this.unitNumber = this.SS.get("unitNumber") ? this.SS.get("unitNumber") : null;
      this.techName = null;
      this.leaseName = null;
      this.customerName = null;
      this.billable = null;
      this.billed = null;
      this.billParts = null;
      this.unapproved = false;
      this.approved = false;
      this.synced = false;
      this.limit = 50;
      this.skip = 0;
      this.pad = this.TDS.pad;
      this.searchSupervisor = null;
      this.role = 'admin';
      this.dates = {
        from: null,
        to: null,
        fromInput: null,
        toInput: null,
      };
    }
    // -------------------------------------------------


    // Initialize original state -----------------------
    $onInit() {
      this.role = this.$cookies.get('role');
      if(!this.SS.get("unitNumber")){
        if(this.role === "admin"){
          this.approved = true;
          this.reverseSort = true;
        }
        if(this.role === "manager"){
          this.unapproved = true;
          this.reverseSort = false;
        }
      }

      this.submit();
    };
    // -------------------------------------------------

    // Search Changes ----------------------------------
    changeTextField(changedData, selected) {
      this.onTextFieldChange({ changedData, selected });
    }
    changeCheckBox(changedData, selected) {
      this.onCheckBoxChange({ changedData, selected });
    }
    // -------------------------------------------------


    // Get start and end of Day ------------------------
    startOfDay(input) {
      this.dates.fromInput = input;
      if (typeof input === 'object') {
        this.dates.from = new Date(new Date(input).setHours(0,0,0,0));
      }
    };

    endOfDay(input) {
      this.dates.toInput = input;
      if (typeof input === 'object') {
        this.dates.to = new Date(new Date(input).setHours(23,59,59,999));
      }
    };
    // -------------------------------------------------

    // Load content on scroll from parent controller ---
    loadOnScroll() {
      console.log("Scrolling..");
      this.skip += this.limit;

      const query = {
        limit: this.limit,
        skip: this.skip
      };

      if(this.dates.from && this.dates.to) {
        query.from = this.dates.from;
        query.to = this.dates.to;
      }

      if (this.endTime || this.startTime) {
        query.from = this.startTime ? new Date(this.startTime) : this.dates.from;
        query.to = this.endTime ? new Date(this.endTime) : (this.dates.to ? this.dates.to : new Date());
      }
      if(this.unitNumber) {
        query.unit = this.unitNumber;
      }
      if(this.techName || this.techId) {
        query.tech = this.techId ? this.techId : this.techName;
      }
      if(this.leaseName) {
        query.loc = this.leaseName;
      }
      if (this.searchSupervisor) {
        query.searchSupervisor = this.searchSupervisor.toUpperCase();
      }
      if(this.customerName) {
        query.cust = this.customerName;
      }
      if(this.billed){
        query.billed = this.billed;
      }
      if(this.billable) {
        query.billable = this.billable;
      }
      if(this.billParts) {
        query.billParts = this.billParts;
      }
      if(this.unapproved || this.techId){
        query.unapproved = this.techId ? true : this.unapproved;
      }
      if(this.approved || this.techId){
        query.approved = this.techId ? true : this.approved;
      }
      if(this.synced || this.techId){
        query.synced = this.techId ? true :  this.synced;
      }
      if(this.woType) {
        query.type = this.woType;
      }

      this.scrollContentSearch({query});
    };
    // -------------------------------------------------

    // Submit query to parent controller ---------------
    submit() {
      console.log("submit");
      this.limit = 50;
      this.skip = 0;

      const query = {
        limit: this.limit,
        skip: this.skip
      };


      if(this.dates.from && this.dates.to) {
        query.from = this.dates.from;
        query.to = this.dates.to;
      }
      if (this.endTime || this.startTime) {
        query.from = this.startTime ? new Date(this.startTime) : this.dates.from;
        query.to = this.endTime ? new Date(this.endTime) : (this.dates.to ? this.dates.to : new Date());
      }

      if(this.unitNumber && (this.unitNumber === this.SS.get("unitNumber"))) {
        query.unit = this.unitNumber;
      } else if(this.unitNumber !== this.SS.get("unitNumber")){
        query.unit = this.unitNumber;
        this.SS.drop("unitNumber");
      } else {
        this.SS.drop("unitNumber");
      }
      if(this.techId || this.techName) {
        this.techName = this.techId ? this.techId : this.techName.toUpperCase();
        query.tech = this.techName;
      }
      if(this.leaseName) {
        query.loc = this.leaseName;
      }
      if (this.searchSupervisor) {
        query.searchSupervisor = this.searchSupervisor.toUpperCase();
      }
      if(this.customerName) {
        query.cust = this.customerName;
      }
      if(this.billed){
        query.billed = this.billed;
      }
      if(this.billable) {
        query.billable = this.billable
      }
      if(this.billParts) {
        query.billParts = this.billParts
      }
      if(this.unapproved || this.techId){
        query.unapproved = this.techId ? true : this.unapproved;
      }
      if(this.approved || this.techId){
        query.approved = this.techId ? true : this.approved;
      }
      if(this.synced || this.techId){
        query.synced = this.techId ? true :  this.synced;
      }
      if(this.woType) {
        query.type = this.woType;
      }

      console.log(query)
      this.contentSearch({query});
    };
    // -------------------------------------------------

    // Get Time Report of searched users ---------------
    report(type) {
      this.reportText = "Loading...";
      this.reportDisabled = true;

      const query = {};

      if(this.dates.from && this.dates.to) {
        query.from = this.dates.from;
        query.to = this.dates.to;
      }
      if (this.endTime || this.startTime) {
        query.from = this.startTime ? new Date(this.startTime) : this.dates.from;
        query.to = this.endTime ? new Date(this.endTime) : (this.dates.to ? this.dates.to : new Date());
      }
    /*
      if(this.unitNumber) {
        query.unit = this.unitNumber.toString();
      }
      if(this.techName) {
        query.tech = this.techName.toUpperCase();
      }*/
      if(this.unitNumber && (this.unitNumber === this.SS.get("unitNumber"))) {
        query.unit = this.unitNumber;
      } else if(this.unitNumber !== this.SS.get("unitNumber")){
        query.unit = this.unitNumber;
        this.SS.drop("unitNumber");
      } else {
        this.SS.drop("unitNumber");
      }
      if(this.techId || this.techName) {
        this.techName = this.techId ? this.techId : this.techName.toUpperCase();
        query.tech = this.techName;
      }
      if(this.leaseName) {
        query.loc = this.leaseName.toString();
      }
      if(this.customerName) {
        query.cust = this.customerName.toString();
      }
      if (this.searchSupervisor) {
        query.searchSupervisor = this.searchSupervisor.toUpperCase();
      }
      if(this.billed){
        query.billed = this.billed;
      }
      if(this.billable) {
        query.billable = this.billable
      }
      if(this.billParts) {
        query.billParts = this.billParts
      }
      if(this.unapproved || this.techId){
        query.unapproved = this.techId ? true : this.unapproved;
      }
      if(this.approved || this.techId){
        query.approved = this.techId ? true : this.approved;
      }
      if(this.synced || this.techId){
        query.synced = this.techId ? true :  this.synced;
      }
      if(this.woType) {
        query.type = this.woType;
      }
      query.report = 'true';

      if (type === 'timeReport') {
        this.contentReport({query});
      } else if (type === 'woDump') {
        this.woDumpReport({query});
      } else if (type === 'woPartsDump') {
        this.woPartsDumpReport({query});
      }
    };
    // -------------------------------------------------

    // Sorting for Table -------------------------------
    resort(by) {
      this.orderByField = by;
      this.reverseSort = !this.reverseSort;
    };
    // -------------------------------------------------


    // Set billable background color for workorders
    setBillableBackgroundColor(wo) {
      if(wo.parts.length > 0){
        const partBillable = wo.isPartBillable.color;
        if(wo.billingInfo.billableToCustomer || (partBillable === '#a4cf80')) return '#a4cf80';
      } else {
        if(wo.billingInfo.billableToCustomer) return '#a4cf80';
      }
    };
    // -------------------------------------------------

    clearText(selected) {
      switch (selected) {
        case 'unitNumber':
          this.unitNumber = null;
          break;
        case 'leaseName':
          this.leaseName = null;
          break;
        case 'techName':
          this.techName = null;
          break;
        case 'customerName':
          this.customerName = null;
          break;
        case 'searchSupervisor':
          this.searchSupervisor = null;
          break;
      }
    }

    // Routing to work order ---------------------------
    clickWorkOrder(wo) {
      this.$window.open('#/workorder/review/' + wo._id);
    };
    // -------------------------------------------------


  }]
});




/*
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

function clearSearch() {

  //let elements = [] ;
  const elements = document.getElementsByClassName("search");

  for(let i=0; i<elements.length ; i++){
    elements[i].value = "" ;
  }
}
*/
