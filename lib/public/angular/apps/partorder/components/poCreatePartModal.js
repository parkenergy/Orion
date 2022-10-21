angular
    .module("PartOrderApp.Components")
    .controller("AddPartPOModalCtrl", [
        "$scope",
        "$uibModalInstance",
        function($scope, $uibModalInstance) {
            $scope.addPart = () => {
                $uibModalInstance.close($scope.part);
            };

            $scope.cancel = () => {
                $uibModalInstance.dismiss("cancel");
            };
        }
    ])
    .component("poCreatePart", {
        templateUrl:
            "/lib/public/angular/apps/partorder/views/component-views/poCreatePart.html",
        bindings: {
            onManualAdd: "&",
            onDelete: "&",
            partSet: "<"
        },
        controller: [
            "$uibModal",
            class CreatePart {
                constructor($uibModal) {
                    this.$uibModal = $uibModal;
                }
                // -----------------------------------------------
                deletePart (index) {
                    this.onDelete({ partIndex: index })
                }

                // Call the Modal for Manual Part Add ------------
                openManualPartModal() {
                    const modalInstance = this.$uibModal.open({
                        templateUrl:
                            "/lib/public/angular/views/modals/manualAddPartModal.html",
                        controller: "AddPartPOModalCtrl"
                    });

                    // Modal Instance Result Calls Parent Function -
                    modalInstance.result.then(part => {
                        const thispart = part;
                        thispart.quantity = 0;
                        thispart.isManual = true;
                        this.onManualAdd({ part: thispart });
                    });
                }
                // -----------------------------------------------
            }
        ]
    });
