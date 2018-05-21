angular.module('PartOrderApp.Components')
    .component('posEditTable', {
        templateUrl: '/lib/public/angular/apps/partorder/views/component-views/posEditTable.html',
        bindings: {
            onTextChagne: '&',
            disabled: '<',
            partorders: '<',   // one way data binding for partorder
        },
        controller: class EditTableCtrl {
            constructor() {
                this.status = [
                    {type: 'ordered', value: false},
                    {type: 'backorder', value: false},
                    {type: 'canceled', value: false},
                    {type: 'completed', value: false}
                ];
            }

            // Disable check boxes based on Part Order State ------
            checkDisabled(box) {
                if (box !== 'complete') {
                    if (this.partorder.timeShipped) {
                        return true;
                    }
                }
                return false;
            };

            // ----------------------------------------------------

        }
    });
