function WorkOrderCreateCtrlFunc(
    $scope,
    $location,
    AlertService,
    ApiRequestService,
    GeneralPartSearchService,
    CommonWOfunctions,
    Utils,
    me
) {
    const { debounce, isEmpty } = Utils;
    // set variables on scope to be passed down
    const ARS = ApiRequestService;
    $scope.locations = [];
    $scope.woInputMatrix = [];
    $scope.frameModels = [];
    $scope.engineModels = [];
    $scope.assetTypes = [];
    $scope.parts = [];
    $scope.states = [];
    $scope.counties = [];
    $scope.applicationTypes = [];
    $scope.killCodes = [];
    $scope.customers = [];
    $scope.users = [];
    $scope.me = me;
    $scope.workorder = CommonWOfunctions.defaultWO();
    $scope.displayUnit = null;
    $scope.headerUnit = null;
    $scope.disabled = false;
    console.log($scope.workorder);

    // page state -> passed in cb for manipulation
    $scope.state = {
        typeSelectionChangeHeader: false, // set in type selection, unset in HeaderInfo
        laborCodeTimeChange: false, // set in labor codes, unset in timeSubmittedView
        laborCodeSelectionChange: false, // set in labor codes, unset in parts view
        laborCodeReplaceEngine: false, // set in labor codes, unset in dynamic unit readings
        laborCodeReplaceFrame: false, // set in labor codes, unset in dynamic unit readings
        swapUnitChange: false // set in wo change info, unset in wo header info
    };
    if (CommonWOfunctions.engineReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceEngine = true;
    }
    if (CommonWOfunctions.frameReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceFrame = true;
    }

    /**
     *
     * Generic cb method to be called in child components
     * Pass in the callback method and have the wo available
     * to edit and $timeout to execute changes.
     * @param cb
     * @returns {*}
     */
    $scope.runCb = cb =>
        cb(
            $scope.workorder,
            $scope.displayUnit,
            $scope.headerUnit,
            $scope.state
        );

    /**
     * load variables asynchronously then stop loading symbol
     */
    ARS.http.get.locations({ size: 1000, page: 0 }).then(
        res => {
            $scope.locations = res.data;
        },
        err => {
            console.error(err);
        }
    );
    ARS.WoUnitInputMatrixes({})
        .then(res => {
            $scope.woInputMatrix = res;
        })
        .catch(console.error);
    ARS.FrameModels({})
        .then(res => {
            $scope.frameModels = res;
        })
        .catch(console.error);
    ARS.EngineModels({})
        .then(res => {
            $scope.engineModels = res;
        })
        .catch(console.error);
    ARS.AssetTypes({})
        .then(res => {
            $scope.assetTypes = res;
        })
        .catch(console.error);
    ARS.Parts({})
        .then(res => {
            $scope.parts = res;
            $scope.setParstModel($scope.parts);
        })
        .catch(console.error);
    ARS.States({})
        .then(res => {
            $scope.states = res;
        })
        .catch(console.error);
    ARS.Counties({})
        .then(res => {
            $scope.counties = res;
        })
        .catch(console.error);
    ARS.ApplicationTypes({})
        .then(res => {
            $scope.applicationTypes = res;
        })
        .catch(console.error);
    ARS.KillCodes({})
        .then(res => {
            $scope.killCodes = res;
        })
        .catch(console.error);
    ARS.Customers({})
        .then(res => {
            $scope.customers = res;
        })
        .catch(console.error);
    ARS.Users({})
        .then(res => {
            $scope.users = res;
        })
        .catch(console.error);
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeStarted = input => {
        $scope.workorder.timeStarted = input;
    };
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeSubmitted = input => {
        $scope.workorder.timeSubmitted = input;
    };

    $scope.removePart = part => {
        const index = $scope.workorder.parts.indexOf(part);
        $scope.workorder.parts.splice(index, 1);
    };

    $scope.setParstModel = parts => {
        $scope.partsTableModel = GeneralPartSearchService.partTableModel(
            parts,
            "wo",
            $scope.workorder
        );
    };

    $scope.setParstModel($scope.parts);
    /**
     * submit admin work order to back end Orion
     * back end save to mongodb
     * then sync to netsuite
     * then save the netsuite Id to the workorder
     */
    $scope.submit = () => {
        let canSubmit = true;
        if (!isEmpty($scope.workorder.parts)) {
            $scope.workorder.parts.forEach(part => {
                if (
                    part.quantity === undefined ||
                    part.quantity < 1 ||
                    part.quantity === null
                ) {
                    AlertService.add("danger", "Part is missing a quantity");
                    canSubmit = false;
                }
            });
        }
        if ($scope.workorder.type !== "Indirect") {
            if (
                $scope.workorder.type !== "Swap" &&
                (isEmpty($scope.workorder.header.unitNumberNSID) ||
                    isEmpty($scope.workorder.header.unitNumber))
            ) {
                AlertService.add("danger", "No unit selected");
                canSubmit = false;
            }
        }
        if (
            $scope.workorder.type === "Swap" &&
            (isEmpty($scope.workorder.unitChangeInfo.swapUnitNSID) ||
                isEmpty($scope.workorder.unitChangeInfo.swapUnitNumber))
        ) {
            AlertService.add("danger", "No Swap unit Selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type === "Indirect" &&
            isEmpty($scope.workorder.techId)
        ) {
            AlertService.add("danger", "No user selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type !== "Indirect" &&
            (isEmpty($scope.workorder.truckId) ||
                isEmpty($scope.workorder.techId))
        ) {
            AlertService.add("danger", "No user or truck selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type !== "Indirect" &&
            isEmpty($scope.workorder.unitReadings.hourReading)
        ) {
            AlertService.add("danger", "Missing unit hour reading");
            canSubmit = false;
        }

        if (
            (isEmpty($scope.workorder.laborCodes.basic.contractor.hours) ||
                $scope.workorder.laborCodes.basic.contractor.hours === 0) &&
            (isEmpty($scope.workorder.laborCodes.basic.contractor.minutes) ||
                $scope.workorder.laborCodes.basic.contractor.minutes === 0)
        ) {
            AlertService.add("danger", "No time added");
            canSubmit = false;
        }
        if (
            isEmpty($scope.workorder.timeSubmitted) ||
            isEmpty($scope.workorder.timeStarted)
        ) {
            AlertService.add("danger", "No time selected for work order");
            canSubmit = false;
        }
        if (canSubmit) {
            const now = new Date();
            $scope.workorder.approvedBy = $scope.me.username;
            $scope.workorder.syncedBy = $scope.me.username;
            $scope.workorder.timeApproved = now;
            $scope.workorder.timeSynced = now;
            $scope.workorder.managerApproved = true;
            $scope.netsuiteSyned = true;
            $scope.workorder.totalMileage =
                $scope.workorder.header.endMileage -
                $scope.workorder.header.startMileage;
            ARS.http.post.AdminWorkorder($scope.workorder).then(
                res => {
                    console.log("nsid: " + res.data.netsuiteId);
                    AlertService.add(
                        "success",
                        `Successfully synced to Netsuite: NSID: ${res.data.netsuiteId}`
                    );
                    $location.path("/workorder");
                },
                err => {
                    if ($scope.workorder.type === "Indirect") {
                        AlertService.add(
                            "info",
                            "Indirects do not sync to Netsuite but this work order saved."
                        );
                        $location.path("/workorder");
                    } else {
                        AlertService.add(
                            "danger",
                            "Not synced to Netsuite, no NSID in response."
                        );
                    }
                    console.error(err);
                }
            );
        }
    };
    $scope.debounceSubmit = debounce($scope.submit, 10000, true);
}

angular
    .module("WorkOrderApp.Controllers")
    .controller("WorkOrderCreateCtrl", [
        "$scope",
        "$location",
        "AlertService",
        "ApiRequestService",
        "GeneralPartSearchService",
        "CommonWOfunctions",
        "Utils",
        "me",
        WorkOrderCreateCtrlFunc
    ]);
