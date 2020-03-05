function WorkOrderViewCtrl(
    $scope,
    $location,
    $timeout,
    $uibModal,
    $cookies,
    AlertService,
    ApiRequestService,
    GeneralPartSearchService,
    DateService,
    CommonWOfunctions,
    Utils,
    me,
    workorder,
    WorkOrders
) {
    const { debounce, isEmpty } = Utils;
    const ARS = ApiRequestService;
    const DS = DateService;
    $scope.locations = [];
    $scope.woInputMatrixes = [];
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
    $scope.workorder = workorder;
    $scope.displayUnit = null;
    $scope.headerUnit = null;
    $scope.disabled = true;
    $scope.submittingWorkOrder = false;

    // page state -> passed in cb for manipulation
    $scope.state = {
        typeSelectionChangeHeader: false, // set in type selection, unset in HeaderInfo
        laborCodeTimeChange: false, // set in labor codes, unset in timeSubmittedView
        laborCodeSelectionChange: false, // set in labor codes, unset in parts view
        laborCodeReplaceEngine: false, // set in labor codes, unset in dynamic unit readings
        laborCodeReplaceFrame: false, // set in labor codes, unset in dynamic unit readings
        swapUnitChange: false // set in wo change info, unset in wo header info
    };
    if ($scope.workorder.netsuiteSyned || $scope.workorder.timeSynced) {
        $scope.SyncedToNetsuite =
            $scope.workorder.timeSynced || $scope.workorder.updated_at;
    }

    if (CommonWOfunctions.engineReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceEngine = true;
    }
    if (CommonWOfunctions.frameReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceFrame = true;
    }

    console.log($scope.workorder);

    // set display unit
    const setDisplayUnit = (headerNumber, swapNumber) => {
        if ($scope.workorder.type === "Swap") {
            ARS.Units({ regexN: swapNumber })
                .then(units => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.displayUnit = units[0];
                        });
                    }
                    return ARS.Units({ regexN: headerNumber });
                })
                .then(units => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.headerUnit = units[0];
                        });
                    }
                })
                .catch(err => console.log(err));
        } else {
            ARS.Units({ regexN: headerNumber })
                .then(units => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.displayUnit = units[0];
                            $scope.headerUnit = units[0];
                        });
                    }
                })
                .catch(err => console.log(err));
        }
    };
    if ($scope.workorder.unitNumber) {
        setDisplayUnit(
            $scope.workorder.unitNumber,
            $scope.workorder.unitChangeInfo.swapUnitNumber
        );
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

    $scope.edit = () => {
        $scope.disabled = !$scope.disabled;
    };

    ARS.http.get
        .locations({
            size: 1000,
            page: 0
        })
        .then(
            res => {
                $scope.locations = res.data;
            },
            err => {
                console.log(err);
            }
        );
    ARS.WoUnitInputMatrixes({})
        .then(res => {
            $scope.woInputMatrixes = res;
            $scope.woUnitInputMatrixObject = $scope.woInputMatrixes.reduce(
                (acc, cur) => {
                    cur.enginesObj = {};
                    cur.framesObj = {};
                    cur.engines.forEach(engine => {
                        cur.enginesObj[engine.netsuiteId] = engine;
                    });
                    cur.compressors.forEach(compressor => {
                        cur.framesObj[compressor.netsuiteId] = compressor;
                    });
                    return acc.concat(cur);
                },
                []
            );
        })
        .catch(console.error);

    ARS.FrameModels({})
        .then(res => {
            $scope.frameModels = res;
            $scope.frameModelsObj = $scope.frameModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur;
                return acc;
            }, {});
        })
        .catch(console.error);
    ARS.EngineModels({})
        .then(res => {
            $scope.engineModels = res;
            $scope.engineModelsObj = $scope.engineModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur;
                return acc;
            }, {});
        })
        .catch(console.error);
    ARS.AssetTypes({})
        .then(res => {
            $scope.assetTypes = res;
        })
        .catch(console.error);
    ARS.Parts({})
        .then(res => {
            $scope.parts = res ? res : [];
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

    // set times to server
    const setSave = wo => {
        if (wo.timeStarted) {
            console.log("setSave");
            console.log(wo.timeStarted);
            wo.timeStarted = DS.saveToOrion(new Date(wo.timeStarted));
            console.log(wo.timeStarted);
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.saveToOrion(new Date(wo.timeSubmitted));
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.saveToOrion(new Date(wo.timeApproved));
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.saveToOrion(new Date(wo.timeSynced));
        }
    };
    // set times to display
    const setDisplay = wo => {
        if (wo.timeStarted) {
            console.log("setDisplay for timeStarted -----------");
            console.log(wo.timeStarted);
            wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted));
            console.log(wo.timeStarted);
            console.log("after change -------------------------");
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.displayLocal(new Date(wo.timeSubmitted));
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.displayLocal(new Date(wo.timeApproved));
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.displayLocal(new Date(wo.timeSynced));
        }
    };
    const unSync = () => {
        $timeout(() => {
            $scope.submittingWorkOrder = false;
            $scope.workorder.netsuiteSyned = false;
            $scope.workorder.timeSynced = null;
            $scope.workorder.syncedBy = "";
            WorkOrders.update(
                { id: $scope.workorder._id },
                $scope.workorder,
                response => {
                    setDisplay(workorder);
                },
                err => {
                    setDisplay(workorder);
                    console.error(err);
                    AlertService.add(
                        "danger",
                        "An error occurred while Unsync work order."
                    );
                }
            );
        });
    };
    $scope.submit = () => {
        $scope.submittingWorkOrder = true;
        let allowSubmit = true;

        // Last calibration is saved as a decimal displayed as a Date. Uploaded to NS
        // as a Date but saved to Orion as Number.
        if (
            $scope.workorder.emissionsReadings.lastCalibration &&
            Object.prototype.toString.call(
                $scope.workorder.emissionsReadings.lastCalibration
            ) !== "[object Number]"
        ) {
            try {
                $scope.workorder.emissionsReadings.lastCalibration = new Date(
                    $scope.workorder.emissionsReadings.lastCalibration
                ).getTime();
            } catch (e) {
                allowSubmit = false;
                $scope.submittingWorkOrder = false;
                AlertService.add(
                    "danger",
                    "Unable to Convert last calibration to a number"
                );
            }
        }

        if (
            $scope.workorder.header.timeOfCallout &&
            Object.prototype.toString.call(
                $scope.workorder.header.timeOfCallout
            ) !== "[object Number]"
        ) {
            try {
                $scope.workorder.header.timeOfCallout = new Date(
                    $scope.workorder.header.timeOfCallout
                ).getTime();
            } catch (e) {
                allowSubmit = false;
                $scope.submittingWorkOrder = false;
                AlertService.add(
                    "danger",
                    "Unable to Convert time of callout back to a number."
                );
            }
        }

        if (
            $scope.workorder.type !== "Indirect" &&
            isEmpty($scope.workorder.unitReadings.hourReading)
        ) {
            allowSubmit = false;
            $scope.submittingWorkOrder = false;
            AlertService.add("danger", "Missing unit hour reading");
        }
        if ($scope.disabled) {
            // Review
            console.log("Submitting...");

            /**
             * -----------------------------------------------------
             * ("manager") && (!managerApproved || !timeApproved)
             * && allowSubmit)
             *
             * To: WO->controllers.update( sec:1 )->managers.(UpdateToSync
             * || managerApprove)() which will either Sync or set as
             * manager approved depending on if the manager put any update
             * notes in.
             *
             * if () {
             */
            if (
                $cookies.get("role") === "manager" &&
                (!$scope.workorder.managerApproved ||
                    !$scope.workorder.timeApproved) &&
                allowSubmit
            ) {
                setSave($scope.workorder);
                console.log("manager && !approved");

                WorkOrders.update(
                    { id: $scope.workorder._id },
                    $scope.workorder,
                    () => {
                        $scope.submittingWorkOrder = false;
                        AlertService.add(
                            "success",
                            "Successfully submitted for admin approval."
                        );
                        $location.path("/workorder");
                    },
                    err => {
                        console.error(err);
                        $scope.submittingWorkOrder = false;
                        setDisplay($scope.workorder);
                        AlertService.add(
                            "danger",
                            "An error occurred while attempting to submit."
                        );
                    }
                );
                /**
                 * -----------------------------------------------------
                 * ("admin" && (!managerApproved && !timeApproved)
                 * && allowSubmit)
                 *
                 * Admin's actions will approve the WO in this else if
                 *
                 * } else if() {
                 */
            } else if (
                $cookies.get("role") === "admin" &&
                !$scope.workorder.managerApproved &&
                !$scope.workorder.timeApproved &&
                allowSubmit
            ) {
                /**
                 * -----------------------------------------------------
                 * ("admin" && (!managerApproved && !timeApproved)
                 * && allowSubmit)
                 * (type !== 'Indirect')
                 *
                 * Since not Indirect
                 *
                 * To: WO->controllers.update( sec: 4 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 * which will either
                 * approve the WO as the admin and Sync the WO.
                 *
                 * if() {
                 */
                if ($scope.workorder.type !== "Indirect") {
                    console.log("admin && !approved && !indirect");
                    AlertService.add(
                        "info",
                        "Will route to dashboard when netsuite returns ID. Otherwise a warning will show here."
                    );
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        response => {
                            if (response.netsuiteId !== "") {
                                $scope.submittingWorkOrder = false;
                                AlertService.add(
                                    "success",
                                    "Successfully synced to netsuite."
                                );
                                $location.path("/workorder");
                            } else {
                                unSync($scope.workorder);
                                AlertService.add(
                                    "danger",
                                    "Not synced to Netsuite, no NSID in response."
                                );
                            }
                        },
                        err => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to sync."
                            );
                        }
                    );
                    /**
                     * -----------------------------------------------------
                     * ("admin" && (!managerApproved && !timeApproved)
                     * && allowSubmit)
                     * (type === 'Indirect')
                     *
                     * Since Indirect
                     *
                     * To: WO->controllers.update( sec: 4 )
                     * ->managers.UpdateToSync().updateDoc()
                     *
                     * will set approved and set to sync Indirect but need
                     * to set netsuiteSyned so back end will do things
                     * correctly
                     *
                     * } else {
                     */
                } else {
                    console.log("admin && !approved && indirect");
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        response => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Successfully Submitted Indirect."
                            );
                            $location.path("/workorder");
                        },
                        err => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to save work order."
                            );
                        }
                    );
                }
                /**
                 * -----------------------------------------------------
                 * ("admin" && managerApproved && allowSubmit)
                 *
                 * } else if () {
                 */
            } else if (
                $cookies.get("role") === "admin" &&
                $scope.workorder.managerApproved &&
                allowSubmit
            ) {
                /**
                 * -----------------------------------------------------
                 * ("admin" && managerApproved && allowSubmit)
                 * (type !== 'Indirect')
                 *
                 * To: WO->controllers.update( sec: 5 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 * Approved. Set to sync by setting netsuiteSyned.
                 * Since not Indirect this will sync to Netsuite
                 *
                 * if () {
                 */
                if ($scope.workorder.type !== "Indirect") {
                    console.log("admin && approved && !indirect");
                    AlertService.add(
                        "info",
                        "Will route to dashboard when netsuite returns ID. Otherwise a warning will show here."
                    );
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        response => {
                            if (response.netsuiteId !== "") {
                                $scope.submittingWorkOrder = false;
                                AlertService.add(
                                    "success",
                                    "Successfully synced to netsuite."
                                );
                                $location.path("/workorder");
                            } else {
                                unSync($scope.workorder);
                                AlertService.add(
                                    "danger",
                                    "Not synced to Netsuite, no NSID in response. Work order would not submit."
                                );
                            }
                        },
                        err => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to sync."
                            );
                        }
                    );
                    /**
                     * -----------------------------------------------------
                     * ("admin" && managerApproved && allowSubmit)
                     * (type === 'Indirect')
                     *
                     * To: WO->controllers.update( sec: 5 )
                     * ->managers.UpdateToSync().updateDoc()
                     *
                     *  Here everything is ready to be synced. But Indirect.
                     *  Let back end handle setting correct params.
                     *
                     * } else {
                     */
                } else {
                    console.log("admin && approved && indirect");
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        () => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Successfully saved Indirect work order, not synced to Netsuite."
                            );
                            $location.path("/workorder");
                        },
                        err => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to save work order."
                            );
                        }
                    );
                }
            } else {
                AlertService.add(
                    "info",
                    "Either not allowed to submit or no decision based on your authorization could be made."
                );
                $scope.submittingWorkOrder = false;
            }
        } else {
            // Edit
            if (
                +$scope.workorder.header.startMileage >
                +$scope.workorder.header.endMileage
            ) {
                $scope.openErrorModal("woMileageError.html");
                allowSubmit = false;
            }
            if (
                ($scope.unaccountedH < 0 ||
                    $scope.unaccountedM < -15 ||
                    $scope.unaccountedH > 0 ||
                    $scope.unaccountedM > 15) &&
                $scope.timeAdjustment === false
            ) {
                $scope.openErrorModal("woUnaccoutedTimeError.html");
                allowSubmit = false;
            }
            if (
                +$scope.workorder.header.endMileage -
                    +$scope.workorder.header.startMileage >
                    75 &&
                !$scope.highMileageConfirm
            ) {
                $scope.openConfirmationModal("woHighMileageConfirmation.html");
                allowSubmit = false;
            }
            if (
                !isEmpty($scope.workorder.unitReadings.compressorModel) ||
                !isEmpty($scope.workorder.unitReadings.engineModel)
            ) {
                // clear all emissions, unitReadings, pmChecklist
                // items that are not associated with this wo
                $scope.workorder = CommonWOfunctions.clearNoneEngineFrame(
                    $scope.workorder,
                    $scope.woInputMatrixes
                );
            }
            // TODO: Make sure and uncommented this once Tiffany is done submitting
            // current work orders. 8/8/2019
            /*if ($scope.workorder.type === 'Trouble Call' &&
                (isEmpty($scope.workorder.header.killCode) || isEmpty($scope.workorder.header.timeOfCallout))) {
                $scope.openErrorModal('woMissingKillCodeCallout.html')
                allowSubmit = false
            }*/
            if (
                !isEmpty($scope.workorder.header.timeOfCallout) &&
                $scope.workorder.header.timeOfCallout < 0
            ) {
                $scope.openErrorModal("woTimeOfCalloutError.html");
                allowSubmit = false;
            }
            if (
                $scope.workorder.emissionsReadings.spotCheck &&
                !isEmpty($scope.workorder.emissionsReadings.lastCalibration) &&
                $scope.workorder.emissionsReadings.lastCalibration < 0
            ) {
                $scope.openErrorModal("woLastCalibrationError.html");
                allowSubmit = false;
            }

            /**
             * -----------------------------------------------------
             *
             * To: WO->controllers.update( sec: 2 & 3 )
             * ->managers.(simpleUpdateAndApprove() || updateDoc())
             *
             * Approve if not approved. And update. but do not sync
             * this is all taken care of on the back end.
             *
             * DO NOT SET nestuiteSyned in the update ctrl
             *
             * if () {
             */
            if (allowSubmit) {
                $scope.workorder.totalMileage =
                    $scope.workorder.header.endMileage -
                    $scope.workorder.header.startMileage;
                if ($cookies.get("role") === "admin") {
                    setSave($scope.workorder);
                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        res => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Update was successful!"
                            );
                            $scope.disabled = true;
                            console.log($scope.workorder._id);
                            $location.url(
                                "/workorder/view/" + $scope.workorder._id
                            );
                        },
                        err => {
                            $scope.submittingWorkOrder = false;
                            console.error(err);
                            setDisplay($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to update."
                            );
                        }
                    );
                }
            }
        }
    };

    $scope.openErrorModal = modalUrl => {
        const modalInstance = $uibModal.open({
            templateUrl:
                "/lib/public/angular/apps/workorder/views/modals/" + modalUrl,
            controller: "ErrorCtrl"
        });
    };
    $scope.openConfirmationModal = modalUrl => {
        const modalInstance = $uibModal.open({
            templateUrl:
                "/lib/public/angular/apps/workorder/views/modals/" + modalUrl,
            controller: "ConfirmationCtrl"
        });

        modalInstance.result.then(() => {
            $scope.highMileageConfirm = true;
            $scope.submit();
        });
    };

    setDisplay($scope.workorder);
    $scope.debounceSubmit = debounce($scope.submit, 10000, true);
}

angular
    .module("WorkOrderApp.Controllers")
    .controller("WorkOrderViewCtrl", [
        "$scope",
        "$location",
        "$timeout",
        "$uibModal",
        "$cookies",
        "AlertService",
        "ApiRequestService",
        "GeneralPartSearchService",
        "DateService",
        "CommonWOfunctions",
        "Utils",
        "me",
        "workorder",
        "WorkOrders",
        WorkOrderViewCtrl
    ]);
