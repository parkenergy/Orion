class woUserInfo {
    constructor() {}
}
angular
    .module('WorkOrderApp.Components')
    .component('woUserInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woUserInfo.html',
        bindings: {
            workorder: '<',
        },
        controller: [woUserInfo]
    })
