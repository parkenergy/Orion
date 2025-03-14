class woComments {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope;
        this.timeout = $timeout;
        this.utils = Utils;
        this.OS = ObjectService;
        this.timeAdjustment = false;
        this.changeThisTextAreaField = this.changeThisTextAreaField.bind(this);
    }

    $onChanges(changes) {
        if (!this.utils.isEmpty(changes.workorder)) {
            if (
                this.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
                this.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.minutes > 0
            ) {
                this.timeAdjustment = true;
            } else {
                this.timeAdjustment = false;
            }
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state);
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({ cb: this.dynamicCB(cb) });
    }

    changeThisTextAreaField(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select);
            });
        });
    }
}

angular.module("WorkOrderApp.Components").component("woComments", {
    templateUrl:
        "/lib/public/angular/apps/workorder/views/component.views/woComments.html",
    bindings: {
        callBack: "&",
        workorder: "<",
        disabled: "<"
    },
    controller: ["$scope", "$timeout", "Utils", "ObjectService", woComments]
});
