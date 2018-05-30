angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
    ['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'Units', 'Users', 'Customers', 'workorder', 'reviewNotes', 'editHistories', 'assettypes', 'me', 'parts', 'states', 'applicationtypes', 'DateService', 'locations',
        function ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, WorkOrders, ReviewNotes, EditHistories, Units, Users, Customers, workorder, reviewNotes, editHistories, assettypes, me, parts, states, applicationtypes, DateService, locations) {
            // set times to server
            const setSave = (wo) => {
                if (wo.timeStarted) {
                    wo.timeStarted = DS.saveToOrion(new Date(wo.timeStarted));
                }
                if (wo.timeSubmitted) {
                    wo.timeSubmitted = DS.saveToOrion(
                        new Date(wo.timeSubmitted));
                }
                if (wo.timeApproved) {
                    wo.timeApproved = DS.saveToOrion(new Date(wo.timeApproved));
                }
                if (wo.timeSynced) {
                    wo.timeSynced = DS.saveToOrion(new Date(wo.timeSynced));
                }
            };
            // set times to display
            const setDisplay = (wo) => {
                if (wo.timeStarted) {
                    wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted));
                }
                if (wo.timeSubmitted) {
                    wo.timeSubmitted = DS.displayLocal(
                        new Date(wo.timeSubmitted));
                }
                if (wo.timeApproved) {
                    wo.timeApproved = DS.displayLocal(
                        new Date(wo.timeApproved));
                }
                if (wo.timeSynced) {
                    wo.timeSynced = DS.displayLocal(new Date(wo.timeSynced));
                }
            };
            const setDisplayUnit = (number) => {
                if ($scope.workorder.unitSnapShot &&
                    $scope.workorder.unitSnapShot.hasOwnProperty('number')) {
                    $timeout(() => {
                        $scope.displayUnit = $scope.workorder.unitSnapShot;
                        $scope.headerUnit = $scope.workorder.unitSnapShot;
                    });
                } else {
                    ARS.Units({regexN: number}).then((units) => {
                        for (let unit in units) {
                            if (units.hasOwnProperty(unit)) {
                                if (units[unit].hasOwnProperty(
                                    'productSeries')) {
                                    // display unit is used in the google map
                                    // view + unit checks
                                    const thisUnit = units[unit];
                                    $timeout(() => {
                                        $scope.displayUnit = thisUnit;
                                    });
                                }
                            }
                        }
                        ARS.Units({regexN: $scope.workorder.header.unitNumber}).
                            then((units) => {
                                for (let unit in units) {
                                    if (units.hasOwnProperty(unit)) {
                                        if (units[unit].hasOwnProperty(
                                            'productSeries')) {
                                            // display unit is used in the
                                            // google map view + unit checks
                                            $scope.headerUnit = units[unit];
                                        }
                                    }
                                }
                            }).
                            catch((err) => console.log(err));
                    }).catch((err) => console.log(err));
                }
            };

            const ARS = ApiRequestService;
            const DS = DateService;
            // scope holding objects.
            $scope.me = me;
            $scope.yards = locations.filter((loc) => {
                return loc.name.indexOf(':') === -1;
            });
            $scope.parts = parts;
            $scope.assettypes = assettypes;
            $scope.states = states;
            $scope.applicationtypes = applicationtypes;
            $scope.workorder = workorder;
            $scope.reviewNotes = reviewNotes;
            $scope.editHistories = editHistories;
            $scope.unitNumberArray = [];

            $scope.disabled = false;
            $scope.hours = getHours();
            $scope.minutes = getMinutes();
            $scope.pad = TimeDisplayService.pad;

            // Arrays for individual collections
            $scope.customersArray = [];
            $scope.countiesArray = [];
            $scope.statesArray = [];
            // Array for rideAlong and app types
            $scope.userRideAlongArray = [];
            $scope.SyncedToNetsuite = $scope.workorder.timeSynced ||
                $scope.workorder.updated_at;

            /*const getCounties = (skp, lm) => {
              return new Promise((resolve, reject) => {
                let skip = skp || 0;
                const limit = lm || 10;
                ARS.http.get.countiesSplit({skip, limit})
                  .then((res) => {
                    console.log(res);
                    if (res.data.length === limit) {
                      res.data.forEach((county) => {
                        $scope.counties.push(county);
                      });
                      skip += 1;
                      return getCounties(skip, limit);
                    } else {
                      return null;
                    }
                  })
                  .then(resolve)
                  .catch(reject);
              });
            };
            getCounties()
              .then((res) => {
                $timeout(() => {
                  console.log($scope.counties);
                  _.map($scope.counties,(obj) => {
                    $scope.countiesArray.push(obj.name);
                  });
                })
              })
              .catch(console.error);*/

            _.map($scope.states, (obj) => {
                $scope.statesArray.push(obj.name);
            });

            // Return the NSID of referenced AssetType --------
            $scope.getAssetTypeNSID = (name) => {
                let returnId = '';
                _.forEach($scope.assettypes, (doc) => {
                    if (name === doc.type) {
                        returnId = doc.netsuiteId;
                    }
                });
                return returnId;
            };
            // -------------------------------------------------
            // init
            setDisplay($scope.workorder);

            // Set Asset Type and Unit for display only ------------
            if ($scope.workorder.unitNumber) {
                setDisplayUnit($scope.workorder.unitNumber);
            }
            // ----------------------------------------------------

            // Get Asset Type ----------------------------------
            const getAssetTypeNSID = (ps) => {
                let NSID = null;
                $scope.assettypes.forEach((asset) => {
                    if (asset.type === ps) {
                        NSID = asset.netsuiteId;
                    }
                });
                return NSID;
            };
            // -------------------------------------------------

            // Add componentName to Pars in WO for listing -----
            $scope.workorder = CommonWOfunctions.addComponentNameToParts(
                $scope.workorder, $scope.parts);
            // -------------------------------------------------

            $scope.swapUnitNumberChange = (changedData) => {
                if ($scope.workorder.unitSnapShot) {
                    $scope.workorder.unitSnapShot = null;
                    $scope.workorder.assetType = null;
                }
                // Get all units that include the newVal string in their number
                ARS.Units({regexN: changedData})
                    .then((units) => {
                        // fill the array for typeahead.
                    $scope.unitNumberArray = units;
                        for (let unit in units) {
                            if (units.hasOwnProperty(unit)) {
                                if (units[unit].number === changedData) {
                                    const header = $scope.workorder.header;
                                    $scope.workorder.header = null;
                                    const thisUnit = units[unit];
                                    $timeout(() => {
                                        $scope.workorder.header = header;
                                        $scope.workorder.unitNumber = thisUnit.number;
                                        $scope.workorder.assetType = getAssetTypeNSID(
                                            thisUnit.productSeries);
                                        $scope.displayUnit = thisUnit;
                                        $scope.workorder.unitReadings.engineSerial = thisUnit.engineSerial;
                                        $scope.workorder.unitReadings.compressorSerial = thisUnit.compressorSerial;
                                        $scope.workorder.unitSnapShot = thisUnit;
                                        $scope.workorder.unitChangeInfo.swapUnitNumber = thisUnit.number;
                                        $scope.workorder.unitChangeInfo.swapUnitNSID = thisUnit.netsuiteId;

                                    });
                                    $timeout(() => console.log(getAssetTypeNSID(
                                        thisUnit.productSeries)), 1000);
                                }
                            }
                        }
                }).catch(console.error);
            };

            // County header info changes ---------------------
            $scope.countyNameChange = (changedData) => {
                // Get all units that include the newVal string in their number
                ARS.Counties({regexN: changedData, limit: 12})
                    .then((counties) => {
                    $scope.countiesArray = counties;
                    }).catch((err) => console.error(err));
            };
            // ------------------------------------------------

            // Unit Header info changes -----------------------
            $scope.unitNumberChange = (changedData) => {
                //set $scope.workorder.unit to null if certain params are met.
                if ($scope.workorder.unitSnapShot) {
                    $scope.workorder.unitSnapShot = null;
                    $scope.workorder.assetType = null;
                }

                // Get all units that include the newVal string in their number
                ARS.Units({regexN: changedData})
                    .then((units) => {
                        // fill the array for typeahead.
                    $scope.unitNumberArray = units;

                        // loop through incoming units and loop through and check
                        // to see if any are an exact match on a unit.
                        for (let unit in units) {
                            if (units.hasOwnProperty(unit)) {
                                if ((units[unit].number === changedData) && (typeof units[unit].number === 'string')) {
                                    const thisUnit = units[unit];

                                    // first clear the header so the checks will run again
                                    for (let u in $scope.workorder.header) {
                                        if ($scope.workorder.header.hasOwnProperty(u)) {
                                            if (u === 'state' || u === 'county' || u === 'leaseName' || u === 'unitNumber' || u === 'customerName') {
                                                $scope.workorder.header[u] = '';
                                            }
                                        }
                                    }
                                    $scope.workorder.geo.coordinates[0] = 0;
                                    $scope.workorder.geo.coordinates[1] = 0;

                                    // Set values at end of Stack loop and $scope.$apply them to be validated.
                                    $timeout(() => {
                                        // Fill doc variables
                                        $scope.workorder.header.state = thisUnit.state ===
                                        null ? '' : thisUnit.state.name;
                                        $scope.workorder.header.county = thisUnit.county ===
                                        null ? '' : thisUnit.county.name;
                                        $scope.workorder.header.leaseName = thisUnit.locationName;
                                        $scope.workorder.header.customerName = thisUnit.customerName;
                                        $scope.workorder.header.unitNumber = thisUnit.number;
                                        $scope.workorder.geo = thisUnit.geo;
                                        $scope.workorder.unitReadings.engineSerial = thisUnit.engineSerial;
                                        $scope.workorder.unitReadings.compressorSerial = thisUnit.compressorSerial;
                                        $scope.workorder.assetType = getAssetTypeNSID(
                                            thisUnit.productSeries);
                                        $scope.workorder.geo.coordinates[0] = thisUnit.geo.coordinates[0];
                                        $scope.workorder.geo.coordinates[1] = thisUnit.geo.coordinates[1];
                                        $scope.displayUnit = thisUnit;
                                        $scope.workorder.jsa.customer = thisUnit.customerName;
                                        $scope.workorder.jsa.location = thisUnit.locationName;
                                        $scope.workorder.unit = thisUnit._id;
                                    });

                                    // If the unit doesnt exist you get undefined for
                                    // units[unit].number.
                                } else if (units[unit].number !== undefined) {
                                    $scope.workorder.jsa.customer = '';
                                    $scope.workorder.jsa.location = '';
                                }
                            }
                        }
                    }).catch((err) => console.log(err));

                $scope.workorder.unitNumber = $scope.workorder.header.unitNumber;
            };

            $scope.customerChange = (changedData) => {
                ARS.Customers({regexName: changedData})
                    .then((customers) => {
                    $scope.customersArray = customers;
                    }).catch((err) => console.log(err));
            };

            $scope.leaseChange = (changedData) => {
                ARS.Units({regexL: changedData})
                    .then((units) => {
                    $scope.unitLocationArray = units;
                    }).catch((err) => console.log(err));
            };
            // ------------------------------------------------

            // Passed function to Components ------------------
            // select-list
            $scope.changeThisSelectList = (changedData, selected) => {
                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };

            // typeahead
            $scope.changeThisTypeahead = (changedData, selected) => {
                if (selected === 'header.rideAlong') {
                    const name = changedData.toUpperCase();
                    ARS.Users({regexName: name})
                        .then((users) => {
                        const userArray = [];
                            if (users.length > 0) {
                                for (let user in users) {
                                    if (users.hasOwnProperty(user)) {
                                        if (users[user].hasOwnProperty('firstName')) {
                                            userArray.push(
                                                users[user].firstName.concat(
                                                    ' ').
                                                    concat(
                                                        users[user].lastName));
                                        }
                                    }
                                }
                                $scope.userRideAlongArray = userArray;
                            }
                        }).catch((err) => console.log(err));
                }

                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };

            // check-box
            $scope.changeThisCheckbox = (changedData, selected) => {
                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };

            // text-field
            $scope.changeThisTextField = (changedData, selected) => {
                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };

            // text-area-field
            $scope.changeThisTextAreaField = (changedData, selected) => {
                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };

            // time-field
            $scope.changeThisTimeField = (changedData, selected) => {
                $scope.getTimeElapsed();
                $scope.getTotalLaborTime();
                $scope.getUnaccountedTime();
                ObjectService.updateNestedObjectValue($scope.workorder,
                    changedData, selected);
            };
            // ------------------------------------------------

            // Set time adjustment notes visibility -----------
            $scope.$watch('workorder.laborCodes.basic', () => {
                if (
                    $scope.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
                    $scope.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
                    $scope.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
                    $scope.workorder.laborCodes.basic.negativeAdj.minutes > 0) {
                    $scope.timeAdjustment = true;
                } else {
                    $scope.timeAdjustment = false;
                }
            }, true);

            $scope.$watch('workorder.laborCodes.engine.replaceEngine', () => {
                if ($scope.workorder.laborCodes.engine.replaceEngine.hours === 0 && $scope.workorder.laborCodes.engine.replaceEngine.minutes === 0) {
                    $scope.workorder.newEngineSerial = '';
                }
            }, true);
            $scope.$watch('workorder.laborCodes.compressor.replace', () => {
                if ($scope.workorder.laborCodes.compressor.replace.hours === 0 && $scope.workorder.laborCodes.compressor.replace.minutes === 0) {
                    $scope.workorder.newCompressorSerial = '';
                }
            }, true);
            // ------------------------------------------------

            // Indirect Select Logic --------------------------
            $scope.type = [
                {text: 'Corrective', value: false},
                {text: 'Trouble Call', value: false},
                {text: 'New Set', value: false},
                {text: 'Transfer', value: false},
                {text: 'Swap', value: false},
                {text: 'Release', value: false},
                {text: 'Indirect', value: false}
            ];
            $scope.getTypeObj = (str) => {
                let value = false;
                $scope.type.forEach((obj) => {
                    if (obj.text === str) {
                        value = obj;
                    }
                });
                return value;
            };
            $scope.setTypeObj = (text, value) => {
                $timeout(() => {
                    $scope.type = [...$scope.type.map((obj) => {
                        if (obj.text === text) {
                            obj.value = value;
                        }
                        return obj;
                    })];
                });
            };
            $scope.wipeTypeObj = () => {
                $scope.type = [...$scope.type.map((obj) => {
                    obj.value = false;
                    return obj;
                })];
            };

            // check header info and run validation, needs to refresh values
            $scope.runHeaderValidation = () => {
                const header = $scope.workorder.header;
                $scope.workorder.header = null;
                if ($scope.workorder.type !== 'Swap') {
                    setDisplayUnit(header.unitNumber);
                    $scope.workorder.comments.swapReason = '';
                    $scope.workorder.unitChangeInfo.swapUnitNSID = '';
                    $scope.workorder.unitChangeInfo.swapUnitNumber = '';
                    $scope.workorder.unitChangeInfo.swapDestination = '';
                }
                if ($scope.workorder.type !== 'Transfer') {
                    $scope.workorder.unitChangeInfo.transferLease = '';
                    $scope.workorder.unitChangeInfo.transferCounty = '';
                    $scope.workorder.unitChangeInfo.transferState = '';
                    $scope.workorder.comments.transferReason = '';
                }
                if ($scope.workorder.type !== 'Release') {
                    $scope.workorder.unitChangeInfo.releaseDestination = '';
                }
                $timeout(() => {
                    $scope.workorder.header = header;
                });
            };
            $scope.pmChange = (val) => {
                $scope.typeChange({text: 'PM', value: !val});
            };

            // Triggered on change to specific checkbox but all but PM call this function, if a pm type just set it. if
            // not a pm type make pm false if true then set.
            $scope.typeChange = (obj) => {
                const type = $scope.workorder.type;
                let pm = false;
                if (obj.text === 'PM') {
                    pm = obj.value;
                } else {
                    pm = $scope.workorder.pm;
                }
                const id = obj.text;
                let state = false;

                if (id === 'PM' && pm && (type === 'Corrective' || type === 'Trouble Call' || type === 'Transfer' || type === 'Swap')) {
                    pm = false;
                } else if (id === 'PM' && !pm && (type === 'Corrective' || type === 'Trouble Call' || type === 'Transfer' || type === 'Swap')) {
                    pm = true;
                } else if ((id === 'Corrective' || id === 'Trouble Call' || id === 'Transfer' || id === 'Swap') && pm) {
                    pm = true;
                } else if ((id === 'Corrective' || id === 'Trouble Call' || id === 'Transfer' || id === 'Swap') && !pm) {
                    pm = false;
                } else if ((id === 'Corrective' || id === 'Trouble Call' || id === 'Transfer' || id === 'Swap') && type === 'PM' && pm) {
                    pm = true;
                } else if (id === 'PM' && !pm) {
                    pm = true;
                } else {
                    pm = false;
                }

                if (id === 'PM') {
                    state = pm;
                } else {
                    state = $scope.getTypeObj(obj.text).value;
                }

                if (id === 'Corrective' && pm && !state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Corrective', false);
                    $scope.workorder.type = id;
                } else if (id === 'Trouble Call' && pm && !state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Trouble Call', false);
                    $scope.workorder.type = id;
                } else if (id === 'Corrective' && pm && state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.workorder.type = 'PM';
                    $scope.setTypeObj('Corrective', true);
                } else if (id === 'Trouble Call' && pm && state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.workorder.type = id;
                    $scope.setTypeObj('Trouble Call', true);
                } else if (id === 'PM' && !pm && $scope.getTypeObj('Corrective').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Corrective', true);
                    $scope.workorder.pm = false;
                    $scope.workorder.type = 'Corrective';
                } else if (id === 'PM' && !pm && $scope.getTypeObj('Trouble Call').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Trouble Call', true);
                    $scope.workorder.pm = false;
                    $scope.workorder.type = 'Trouble Call';
                } else if (id === 'PM' && pm && $scope.getTypeObj('Corrective').value) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Corrective', true);
                    $scope.workorder.type = 'Corrective';
                } else if (id === 'PM' && pm && $scope.getTypeObj('Trouble Call').value) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Trouble Call', true);
                    $scope.workorder.type = 'Trouble Call';
                } else if (id === 'Transfer' && pm && !state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Transfer', false);
                    $scope.workorder.type = id;
                } else if (id === 'Swap' && pm && !state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Swap', false);
                    $scope.workorder.type = id;
                } else if (id === 'Transfer' && pm && state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Transfer', true);
                    $scope.workorder.type = id;
                } else if (id === 'Swap' && pm && state) {
                    $scope.wipeTypeObj();
                    $scope.workorder.pm = true;
                    $scope.setTypeObj('Swap', true);
                    $scope.workorder.type = id;
                } else if (id === 'PM' && !pm && $scope.getTypeObj('Transfer').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Transfer', true);
                    $scope.workorder.pm = false;
                    $scope.workorder.type = 'Transfer';
                } else if (id === 'PM' && !pm && $scope.getTypeObj('Swap').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Swap', true);
                    $scope.workorder.pm = false;
                    $scope.workorder.type = 'Swap';
                } else if (id === 'PM' && pm && $scope.getTypeObj('Transfer').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Transfer', true);
                    $scope.workorder.pm = true;
                    $scope.workorder.type = 'Transfer';
                } else if (id === 'PM' && pm && $scope.getTypeObj('Swap').value) {
                    $scope.wipeTypeObj();
                    $scope.setTypeObj('Swap', true);
                    $scope.workorder.pm = true;
                    $scope.workorder.type = 'Swap';
                } else {
                    $scope.wipeTypeObj();
                    if (id === 'PM' && pm) {
                        $scope.workorder.pm = true;
                    } else if (id === 'PM' && !pm) {
                        $scope.workorder.pm = false;
                    } else {
                        $scope.workorder.pm = false;
                    }
                    $scope.setTypeObj(id, true);
                    $scope.workorder.type = id;
                }
                $scope.runHeaderValidation();
            };

            // on page load set checkboxes
            if ($scope.workorder.pm) {
                // you can have either Corrective or Trouble Call selected at the same time you have PM selected but
                // only one
                if ($scope.workorder.type === 'Corrective') {
                    $scope.type[0].value = true;
                } else if ($scope.workorder.type === 'Trouble Call') {
                    $scope.type[1].value = true;
                } else if ($scope.workorder.type === 'Transfer') {
                    $scope.type[3].value = true;
                } else if ($scope.workorder.type === 'Swap') {
                    $scope.type[4].value = true;
                }
            } else {
                // otherwise PM is not selected in that case only one of the fallowing can be selected.
                switch ($scope.workorder.type) {
                    case 'Corrective':
                        $scope.type[0].value = true;
                        break;
                    case 'Trouble Call':
                        $scope.type[1].value = true;
                        break;
                    case 'New Set':
                        $scope.type[2].value = true;
                        break;
                    case 'Transfer':
                        $scope.type[3].value = true;
                        break;
                    case 'Swap':
                        $scope.type[4].value = true;
                        break;
                    case 'Release':
                        $scope.type[5].value = true;
                        break;
                    case 'Indirect':
                        $scope.type[6].value = true;
                        break;
                    default:
                        console.log($scope.workorder.type);
                }
            }
            // ------------------------------------------------

            // NOTES ------------------------------------------
            // create object model to data bind comment input to.
            $scope.comment = ClassNote();

            // create model object to work off of
            function ClassNote () {
                return {
                    note: '',
                    workOrder: $scope.workorder._id
                };
            }

            // boolean value to keep from editing note while it is sending
            $scope.sendingNote = false;
            // save the new note to the database
            $scope.newNote = () => {
                // save to database will go here only if comment was filled
                if ($scope.comment.note) {
                    $scope.sendingNote = true;
                    // save to database
                    console.log('Saving new note...');
                    ReviewNotes.save({}, $scope.comment,
                        (response) => {
                            $scope.sendingNote = false;
                            console.log(response);
                            console.log('Successful save.');
                            // retrieve notes to display.
                            ARS.ReviewNotes({workOrder: response.workOrder})
                                .then((newNotes) => {
                                $scope.reviewNotes = newNotes;
                                }).catch((err) => console.log(err));
                            // clear display note from form
                            $scope.comment.note = null;
                        }, (err) => {
                            $scope.sendingNote = false;
                            console.log(err);
                            console.log('Error Saving Note.');
                            $scope.comment.note = null;
                        }
                    );
                }
            };

            // Submissions
            // make the display for all submission history
            $scope.displaySubmissions = [];

            //create display class for Submissions
            function ClassSubmission () {
                return {
                    type: '',
                    firstname: '',
                    lastname: '',
                    submissionTime: Date
                };
            }

            // only do if tech has submitted wo.
            if ($scope.workorder.timeSubmitted) {
                // Tech Submission
                ARS.getUser({id: $scope.workorder.techId})
                    .then((user) => {
                    let thisUser = user;
                    const techSubmission = ClassSubmission();
                    techSubmission.type = 'Submission';
                        // if user no longer exists. Deleted from db
                        if (thisUser !== undefined) {
                            techSubmission.firstname = thisUser.firstName;
                            techSubmission.lastname = thisUser.lastName;
                        } else {
                            techSubmission.firstname = $scope.workorder.techId;
                        }
                    techSubmission.submissionTime = $scope.workorder.timeSubmitted;
                    $scope.displaySubmissions.push(techSubmission);
                        // Manager Review
                        if ($scope.workorder.timeApproved) {
                            ARS.getUser({id: $scope.workorder.approvedBy})
                                .then((manager) => {
                                thisUser = manager;
                                const managerSubmission = ClassSubmission();
                                managerSubmission.type = 'Reviewed';
                                managerSubmission.firstname = thisUser.firstName;
                                managerSubmission.lastname = thisUser.lastName;
                                managerSubmission.submissionTime = $scope.workorder.timeApproved;
                                $scope.displaySubmissions.push(
                                    managerSubmission);
                                }).catch((err) => console.log(err));
                        }
                        // Admin Sync
                        if ($scope.workorder.timeSynced) {
                            ARS.getUser({id: $scope.workorder.syncedBy})
                                .then((admin) => {
                                thisUser = admin;
                                const adminSubmission = ClassSubmission();
                                adminSubmission.type = 'Synced';
                                adminSubmission.firstname = thisUser.firstName;
                                adminSubmission.lastname = thisUser.lastName;
                                adminSubmission.submissionTime = $scope.workorder.timeSynced;
                                $scope.displaySubmissions.push(adminSubmission);
                                }).catch((err) => console.log(err));
                        }
                    }).catch((err) => console.log(err));
            }
            // ------------------------------------------------

            // History Changes --------------------------------
            // create the view for all edits
            $scope.displayChanges = [];

            function ClassDisplayHistory () {
                return {
                    panelName: '',
                    itemName: '',
                    type: '',
                    before: '',
                    after: ''
                };
            }

            // load all edits from the database
            _.map($scope.editHistories, (edit) => {
                // format the data correctly for presentation.
                if ($scope.workorder._id === edit.workOrder) {
                    const thisEdit = ClassDisplayHistory();
                    thisEdit.panelName = edit.path[0];
                    thisEdit.itemName = edit.path.pop();
                    thisEdit.type = edit.editType;
                    thisEdit.before = edit.before;
                    thisEdit.after = edit.after;
                    $scope.displayChanges.push(thisEdit);
                }
            });
            // load the username of the admin who made the edits. and get the count
            if ($scope.editHistories.length !== 0) {
                ARS.getUser({id: $scope.editHistories.pop().user})
                    .then((admin) => {
                    $scope.editor = admin;
                    })
                    .catch((err) => {
                    console.log('Editor retrieval error');
                    console.log(err);
                });
                $scope.editCount = $scope.editHistories.length + 1;
            }

            // ------------------------------------------------

            $scope.highMileageConfirm = false;

            $scope.save = () => {
                $scope.submitting = true;
                $scope.allowSubmit = true;
                if ($scope.workorder.header.startMileage > $scope.workorder.header.endMileage) {
                    $scope.openErrorModal('woMileageError.html');
                    $scope.allowSubmit = false;
                }
                if ((($scope.unaccountedH < 0 || $scope.unaccountedM < -15) || ($scope.unaccountedH > 0 || $scope.unaccountedM > 15)) && $scope.timeAdjustment === false) {
                    $scope.openErrorModal('woUnaccoutedTimeError.html');
                    $scope.allowSubmit = false;
                }
                if (($scope.workorder.header.endMileage - $scope.workorder.header.startMileage) > 75 && !$scope.highMileageConfirm) {
                    $scope.openConfirmationModal(
                        'woHighMileageConfirmation.html');
                    $scope.allowSubmit = false;
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
                if ($scope.allowSubmit) {
                    if ($cookies.get('role') === 'admin') {
                        setSave($scope.workorder);
                        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
                            (res) => {
                                AlertService.add('success',
                                    'Update was successful!');
                                $scope.submitting = false;
                                console.log($scope.workorder._id);
                                $location.url('/workorder/review/' +
                                    $scope.workorder._id);
                            }, (err) => {
                                console.log(err);
                                setDisplay($scope.workorder);
                                AlertService.add('danger',
                                    'An error occurred while attempting to update.');
                                $scope.submitting = false;
                            }
                        );
                    }
                }
            };

            $scope.destroy = () => {
                $scope.submitting = true;
                WorkOrders.delete({id: workorder._id},
                    (response) => {
                        $location.path('/workorder');
                        $scope.submitting = false;
                    }, (err) => {
                        AlertService.add('error', err);
                        $scope.submitting = false;
                    }
                );
            };

            $scope.usedLaborCodes = [];
            // set usedLaborCodes array with every used labor code with the text of that labor code
            $scope.getUsedLaborCodes = () => {
                _.forEach($scope.workorder.laborCodes, (lc) => {
                    _.forEach(lc, (code) => {
                        if (code.hours > 0 || code.minutes > 0) {
                            if ($scope.usedLaborCodes.indexOf(code.text) === -1) {
                                $scope.usedLaborCodes.push(code.text);
                            }
                        }
                    });
                });
            };

            // TimeDisplayService handles all time display issues with HH:MM
            // refactored 9.5.16
            $scope.getTimeElapsed = () => {
                const start = new Date($scope.workorder.timeStarted);
                const now = $scope.workorder.timeSubmitted ?
                    new Date($scope.workorder.timeSubmitted) :
                    new Date();
                // e short for elapsed
                $scope.eMilli = (now.getTime() - start.getTime()).toFixed();
                $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60));
                $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)));
                $scope.eHours = Math.floor((($scope.eMilli / (36e5))));
                $scope.getTotalLaborTime();
                $scope.getUnaccountedTime();
            };

            // get total wo time based on used labor codes
            // refactored 9.5.16
            $scope.getTotalLaborTime = () => {
                $scope.laborH = 0;
                $scope.laborM = 0;
                $scope.totalMinutes = 0;
                let AdjMinutes = 0;

                const {laborCodes} = $scope.workorder;
                const laborCs = Object.keys(laborCodes);
                laborCs.forEach((item) => {
                    const lcChild = Object.keys(laborCodes[item]);
                    lcChild.forEach((child) => {
                        if (laborCodes[item][child].text === 'Negative Time Adjustment') {
                            $scope.totalMinutes -= +laborCodes[item][child].hours *
                                60;
                            $scope.totalMinutes -= +laborCodes[item][child].minutes;
                            AdjMinutes -= +laborCodes[item][child].hours * 60;
                            AdjMinutes -= +laborCodes[item][child].minutes;
                        } else {
                            $scope.totalMinutes += +laborCodes[item][child].hours *
                                60;
                            $scope.totalMinutes += +laborCodes[item][child].minutes;
                            if (laborCodes[item][child].text === 'Positive Time Adjustment' || laborCodes[item][child].text === 'Lunch') {
                                AdjMinutes += +laborCodes[item][child].hours *
                                    60;
                                AdjMinutes += +laborCodes[item][child].minutes;
                            }
                        }
                    });
                });
                let AdjH;
                if (AdjMinutes > 0) {
                    AdjH = Math.floor(AdjMinutes / 60);
                } else {
                    AdjH = Math.ceil(AdjMinutes / 60);
                }
                // $scope.laborH = parseInt($scope.totalMinutes / 60);
                if ($scope.totalMinutes > 0) {
                    $scope.laborH = Math.floor($scope.totalMinutes / 60);
                } else {
                    $scope.laborH = Math.ceil($scope.totalMinutes / 60);
                }

                $scope.laborM = Math.round($scope.totalMinutes % 60);
                const AdjM = Math.round(AdjMinutes % 60);
                const ShowH = $scope.laborH - AdjH;
                const ShowM = $scope.laborM - AdjM;
                // $scope.totalLabor = TimeDisplayService.timeManager($scope.laborH,$scope.laborM);
                $scope.totalLabor = TimeDisplayService.timeManager(ShowH,
                    ShowM);
            };

            // get unaccounted for time based on used labor coded and elapsed time FIX
            // refactored 9.5.16
            $scope.getUnaccountedTime = () => {
                $scope.unaccountedM = ($scope.eHours - $scope.laborH) * 60;
                $scope.unaccountedM += $scope.eMinutes - $scope.laborM;
                if ($scope.unaccountedM > 0) {
                    $scope.unaccountedH = Math.floor($scope.unaccountedM / 60);
                } else {
                    $scope.unaccountedH = Math.ceil($scope.unaccountedM / 60);
                }
                $scope.unaccountedM = Math.round($scope.unaccountedM % 60);
                $scope.unaccountedTime = TimeDisplayService.timeManager(
                    $scope.unaccountedH, $scope.unaccountedM);
            };

            function getHours () {
                const hours = [];
                for (let i = 0; i <= 24; i++) {
                    hours.push(i);
                }
                return hours;
            }

            function getMinutes () {
                const minutes = [];
                for (let i = 0; i < 60; i += 5) {
                    minutes.push(i);
                }
                return minutes;
            }

            /* Populate search field for parts ------------------ */
            parts = parts.map((part) => {
                part.searchStr = [
                    part.description,
                    part.componentName,
                    part.MPN].join(' ');
                return part;
            });

            /* Model for the add part table --------------------- */
            $scope.partsTableModel = GeneralPartSearchService.partTableModel(
                $scope.parts, 'wo', $scope.workorder);

            $scope.removePart = (part) => {
                const index = $scope.workorder.parts.indexOf(part);
                $scope.workorder.parts.splice(index, 1);
            };

            $scope.openErrorModal = (modalUrl) => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/modals/' + modalUrl,
                    controller: 'ErrorCtrl'
                });
            };

            $scope.openConfirmationModal = (modalUrl) => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/modals/' + modalUrl,
                    controller: 'ConfirmationCtrl'
                });

                modalInstance.result.then(() => {
                    $scope.highMileageConfirm = true;
                    $scope.save();
                });
            };

            $scope.openLeaseNotes = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLeaseNotesModal.html',
                    controller: 'NotesModalCtrl',
                    resolve: {
                        notes: function () {
                            return $scope.workorder.misc.leaseNotes;
                        }
                    }
                });

                modalInstance.result.then((notes) => {
                    $scope.workorder.misc.leaseNotes = notes;
                });
            };

            $scope.openUnitNotes = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/modals/woUnitNotesModal.html',
                    controller: 'NotesModalCtrl',
                    resolve: {
                        notes: function () {
                            return $scope.workorder.misc.unitNotes;
                        }
                    }
                });

                modalInstance.result.then((notes) => {
                    $scope.workorder.misc.unitNotes = notes;
                });
            };

            $scope.openUnitView = () => {
                if ($scope.displayUnit !== undefined) {
                    const modalInstance = $uibModal.open({
                        templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLocationModal.html',
                        scope: $scope,
                        controller: 'woLocationModalCtrl'
                    });
                } else {
                    AlertService.add('danger',
                        'No unit exists on this work order.');
                }
            };

            $scope.openJSA = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woJsaModal.html',
                    controller: 'JsaEditModalCtrl',
                    windowClass: 'jsa-modal',
                    resolve: {
                        jsa: function () {
                            return $scope.workorder.jsa;
                        }
                    }
                });

                modalInstance.result.then((jsa) => {
                    $scope.workorder.jsa = jsa;
                });
            };

            $scope.openManualPartModal = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woManualAddModal.html',
                    controller: 'AddPartEditModalCtrl'
                });

                modalInstance.result.then((part) => {
                    $scope.workorder.parts.push(
                        GeneralPartSearchService.manualAddPart(part));
                });
            };

            $scope.getUsedLaborCodes();

            $scope.getTimeElapsed();

            $scope.getTotalLaborTime();

            $scope.getUnaccountedTime();
        }
    ]
);
