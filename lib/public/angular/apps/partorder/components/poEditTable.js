angular.module('PartOrderApp.Components')
.component('poEditTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditTable.html',
  bindings: {
    partorder: '<',   // one way data binding for partorder
    onSelection: '&'
  },
  controller: class EditTableCtrl {
    constructor () {
      this.status = [
        { type: 'shipped', value: false },
        { type: 'backorder', value: false },
        { type: 'canceled', value: false },
        { type: 'completed', value: false }
      ];
    }
  
    // Change Selected Check box --------------------------
    changeCheckBoxes(data, selected) {
      _.map(this.status,(obj) => {
        if ( obj.type === selected ){
          obj.value = true;
          this.status.forEach((x) => {
            if( x.type !== selected ){
              x.value = false;
            }
          });
        }
      });
    };
    // ----------------------------------------------------
  
    // Disable check boxes based on Part Order State ------
    checkDisabled(box) {
      if(box !== 'complete'){
        if(this.partorder.timeShipped){
          return true;
        }
      }
      return false;
    };
    // ----------------------------------------------------
  
    // Send Back Changed Data and Type --------------------
    thisBoxDataChange(changedData, selected) {
      if ( selected !== 'canceled' ){
        this.partorder.comment = '';
      }
      if( changedData === true ) {
        this.changeCheckBoxes(changedData, selected);
        this.onSelection({ changedData, selected });
      }
    };
    // ----------------------------------------------------
    
  }
});
