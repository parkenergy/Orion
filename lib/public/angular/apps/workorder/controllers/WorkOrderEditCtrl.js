function WorkOrderEditCtrlFunc ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, WorkOrders, ReviewNotes, EditHistories, Units, Users, Customers, workorder, reviewNotes, editHistories, assettypes, me, parts, states, applicationtypes, DateService, locations, woInputMatrixes, frameModels, engineModels, counties) {

    $scope.statesObj = states.reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc
    }, {})
    $scope.countiesObj = counties.reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc
    }, {})
    // set times to server
    const setSave = (wo) => {
        if (wo.timeStarted) {
            wo.timeStarted = DS.saveToOrion(new Date(wo.timeStarted))
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.saveToOrion(
                new Date(wo.timeSubmitted))
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.saveToOrion(new Date(wo.timeApproved))
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.saveToOrion(new Date(wo.timeSynced))
        }
    }
    // set times to display
    const setDisplay = (wo) => {
        if (wo.timeStarted) {
            wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted))
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.displayLocal(
                new Date(wo.timeSubmitted))
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.displayLocal(
                new Date(wo.timeApproved))
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.displayLocal(new Date(wo.timeSynced))
        }
    }
    const setDisplayUnit = (number) => {
        ARS.Units({regexN: number})
           .then((units) => {
               for (let unit in units) {
                   if (units.hasOwnProperty(unit)) {
                       if (units[unit].hasOwnProperty(
                           'productSeries')) {
                           // display unit is used in the google map
                           // view + unit checks
                           const thisUnit = units[unit]
                           $timeout(() => {
                               $scope.headerUnit = units[unit]
                               $scope.displayUnit = thisUnit
                           })
                       }
                   }
               }
           })
           .catch((err) => console.log(err))
    }

    const ARS = ApiRequestService
    const DS = DateService
    // scope holding objects.
    $scope.me = me
    $scope.yards = locations.filter((loc) => {
        return loc.name.indexOf(':') === -1
    })
    $scope.parts = parts
    $scope.woInputMatrixes = woInputMatrixes
    $scope.engineModels = engineModels
    $scope.frameModels = frameModels
    $scope.assettypes = assettypes
    $scope.states = states
    $scope.applicationtypes = applicationtypes
    $scope.workorder = workorder
    $scope.reviewNotes = reviewNotes
    $scope.editHistories = editHistories
    $scope.unitNumberArray = []

    $scope.disabled = false
    $scope.hours = getHours()
    $scope.minutes = getMinutes()
    $scope.pad = TimeDisplayService.pad

    // Arrays for individual collections
    $scope.customersArray = []
    $scope.countiesArray = []
    $scope.statesArray = []
    // Array for rideAlong and app types
    $scope.userRideAlongArray = []
    $scope.SyncedToNetsuite = $scope.workorder.timeSynced ||
        $scope.workorder.updated_at

    $scope.tripleInputStyling = {
        'display': 'inline-block',
        'width':   '32%',
    }
    $scope.inputStyling = {
        'display': 'inline-block',
        'width':   '49%',
    }
    _.map($scope.states, (obj) => {
        $scope.statesArray.push(obj.name)
    })
    // init
    setDisplay($scope.workorder)

    // Set Asset Type and Unit for display only ------------
    if ($scope.workorder.unitNumber) {
        setDisplayUnit($scope.workorder.unitNumber)
    }
    // ----------------------------------------------------

    // Get Asset Type ----------------------------------
    const getAssetTypeNSID = (ps) => {
        let NSID = null
        $scope.assettypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId
            }
        })
        return NSID
    }
    // -------------------------------------------------

    // Add componentName to Pars in WO for listing -----
    $scope.workorder = CommonWOfunctions.addComponentNameToParts(
        $scope.workorder, $scope.parts)
    // -------------------------------------------------

    $scope.swapUnitNumberChange = (changedData) => {
        // Get all units that include the newVal string in their number
        ARS.Units({regexN: changedData})
           .then((units) => {
               // fill the array for typeahead.
               $scope.unitNumberArray = units
               for (let unit in units) {
                   if (units.hasOwnProperty(unit)) {
                       if (units[unit].number === changedData) {
                           const header = $scope.workorder.header
                           $scope.workorder.header = null
                           const thisUnit = units[unit]
                           // get frame and engine models
                           let engineObj
                           if (thisUnit.engineModel) {
                               $scope.engineModels.forEach((engine) => {
                                   if (engine.netsuiteId === thisUnit.engineModel) {
                                       engineObj = engine
                                   }
                               })
                           }
                           let frameObj
                           if (thisUnit.frameModel) {
                               $scope.frameModels.forEach((frame) => {
                                   if (frame.netsuiteId === thisUnit.frameModel) {
                                       frameObj = frame
                                   }
                               })
                           }
                           $timeout(() => {
                               $scope.workorder.header = header
                               $scope.workorder.unitNumber = thisUnit.number
                               $scope.workorder.assetType = getAssetTypeNSID(
                                   thisUnit.productSeries)
                               $scope.displayUnit = thisUnit
                               $scope.workorder.unitReadings.engineSerial = thisUnit.engineSerial
                               $scope.workorder.unitReadings.compressorSerial = thisUnit.compressorSerial
                               $scope.workorder.unitChangeInfo.swapUnitNumber = thisUnit.number
                               $scope.workorder.unitChangeInfo.swapUnitNSID = thisUnit.netsuiteId
                               $scope.workorder.unitReadings.displayEngineModel = engineObj !==
                               undefined ? engineObj.model : ''
                               $scope.workorder.unitReadings.displayFrameModel = frameObj !==
                               undefined ? frameObj.model : ''
                               $scope.workorder.unitReadings.engineModel = engineObj !==
                               undefined ? engineObj.netsuiteId : ''
                               $scope.workorder.unitReadings.compressorModel = frameObj !==
                               undefined ? frameObj.netsuiteId : ''

                           })
                       }
                   }
               }
           })
           .catch(console.error)
    }

    // County header info changes ---------------------
    $scope.countyNameChange = (changedData) => {
        // Get all units that include the newVal string in their number
        ARS.Counties({regexN: changedData, limit: 12})
           .then((counties) => {
               $scope.countiesArray = counties
           })
           .catch((err) => console.error(err))
    }
    // ------------------------------------------------

    // Unit Engine info changes -----------------------
    $scope.unitEngineModelChange = (changedData) => {
        $scope.workorder.unitReadings.displayEngineModel = changedData
    }
    $scope.$watch('workorder.unitReadings.displayEngineModel', (newModel, oldModel) => {
        if (newModel !== oldModel) {
            $scope.engineModels.forEach((engine) => {
                if (engine.model === newModel) {
                    $timeout(() => {
                        $scope.workorder.unitReadings.engineModel = engine.netsuiteId
                    })
                }
            })
        }
    }, true)
    // ------------------------------------------------
    // Unit Frame info changes -----------------------
    $scope.unitFrameModelChange = (changedData) => {
        $scope.workorder.unitReadings.displayFrameModel = changedData
    }
    $scope.$watch('workorder.unitReadings.displayFrameModel', (newModel, oldModel) => {
        if (newModel !== oldModel) {
            $scope.frameModels.forEach((frame) => {
                if (frame.model === newModel) {
                    $timeout(() => {
                        $scope.workorder.unitReadings.compressorModel = frame.netsuiteId
                    })
                }
            })
        }
    }, true)
    // ------------------------------------------------

    // Unit Header info changes -----------------------
    $scope.unitNumberChange = (changedData) => {
        //set $scope.workorder.unit to null if certain params are met.

        // Get all units that include the newVal string in their number
        ARS.Units({regexN: changedData})
           .then((units) => {
               // fill the array for typeahead.
               $scope.unitNumberArray = units

               // loop through incoming units and loop through and check
               // to see if any are an exact match on a unit.
               for (let unit in units) {
                   if (units.hasOwnProperty(unit)) {
                       if ((units[unit].number === changedData) &&
                           (typeof units[unit].number === 'string')) {
                           const thisUnit = units[unit]
                           
                           // get frame and engine models
                           let engineObj
                           if (thisUnit.engineModel) {
                               $scope.engineModels.forEach((engine) => {
                                   if (engine.netsuiteId === thisUnit.engineModel) {
                                       engineObj = engine
                                   }
                               })
                           }
                           let frameObj
                           if (thisUnit.frameModel) {
                               $scope.frameModels.forEach((frame) => {
                                   if (frame.netsuiteId === thisUnit.frameModel) {
                                       frameObj = frame
                                   }
                               })
                           }

                           // first clear the header so the checks will run again
                           for (let u in $scope.workorder.header) {
                               if ($scope.workorder.header.hasOwnProperty(u)) {
                                   if (u === 'state' || u === 'county' || u ===
                                       'leaseName' || u === 'unitNumber' || u ===
                                       'customerName') {
                                       $scope.workorder.header[u] = ''
                                   }
                               }
                           }
                           $scope.workorder.unitReadings.engineModel = ''
                           $scope.workorder.unitReadings.compressorModel = ''
                           $scope.workorder.unitReadings.displayEngineModel = ''
                           $scope.workorder.unitReadings.displayFrameModel = ''
                           $scope.workorder.geo.coordinates[0] = 0
                           $scope.workorder.geo.coordinates[1] = 0

                           // Set values at end of Stack loop and $scope.$apply them to be
                           // validated.
                           $timeout(() => {
                               // Fill doc variables
                               $scope.workorder.header.state = thisUnit.state === null ? '' : $scope.statesObj[thisUnit.state].name
                               $scope.workorder.header.county = thisUnit.county === null ? '' : $scope.countiesObj[thisUnit.county].name
                               $scope.workorder.header.leaseName = thisUnit.locationName
                               $scope.workorder.header.customerName = thisUnit.customerName
                               $scope.workorder.header.unitNumber = thisUnit.number
                               $scope.workorder.geo = thisUnit.geo
                               $scope.workorder.unitReadings.engineSerial = thisUnit.engineSerial
                               $scope.workorder.unitReadings.compressorSerial = thisUnit.compressorSerial
                               $scope.workorder.assetType = getAssetTypeNSID(
                                   thisUnit.productSeries)
                               $scope.workorder.geo.coordinates[0] = thisUnit.geo.coordinates[0]
                               $scope.workorder.geo.coordinates[1] = thisUnit.geo.coordinates[1]
                               $scope.displayUnit = thisUnit
                               $scope.workorder.jsa.customer = thisUnit.customerName
                               $scope.workorder.jsa.location = thisUnit.locationName
                               $scope.workorder.unit = thisUnit._id
                               $scope.workorder.unitReadings.displayEngineModel = engineObj !==
                               undefined ? engineObj.model : ''
                               $scope.workorder.unitReadings.displayFrameModel = frameObj !==
                               undefined ? frameObj.model : ''
                               $scope.workorder.unitReadings.engineModel = engineObj !==
                               undefined ? engineObj.netsuiteId : ''
                               $scope.workorder.unitReadings.compressorModel = frameObj !==
                               undefined ? frameObj.netsuiteId : ''
                           })
                           // If the unit doesnt exist you get undefined for
                           // units[unit].number.
                       } else if (units[unit].number !== undefined) {
                           $scope.workorder.jsa.customer = ''
                           $scope.workorder.jsa.location = ''
                       }
                   }
               }
           })
           .catch((err) => console.log(err))

        $scope.workorder.unitNumber = $scope.workorder.header.unitNumber
    }

    $scope.customerChange = (changedData) => {
        ARS.Customers({regexName: changedData})
           .then((customers) => {
               $scope.customersArray = customers
           })
           .catch((err) => console.log(err))
    }

    $scope.leaseChange = (changedData) => {
        ARS.Units({regexL: changedData})
           .then((units) => {
               $scope.unitLocationArray = units
           })
           .catch((err) => console.log(err))
    }
    // ------------------------------------------------

    // Passed function to Components ------------------
    // select-list
    $scope.changeThisSelectList = (changedData, selected) => {
        ObjectService.updateNestedObjectValue($scope.workorder,
            changedData, selected)
    }

    // typeahead
    $scope.changeThisTypeahead = (changedData, selected) => {
        if (selected === 'header.rideAlong') {
            const name = changedData.toUpperCase()
            ARS.Users({regexName: name})
               .then((users) => {
                   const userArray = []
                   if (users.length > 0) {
                       for (let user in users) {
                           if (users.hasOwnProperty(user)) {
                               if (users[user].hasOwnProperty('firstName')) {
                                   userArray.push(
                                       users[user].firstName.concat(
                                           ' ')
                                                  .concat(
                                                      users[user].lastName))
                               }
                           }
                       }
                       $scope.userRideAlongArray = userArray
                   }
               })
               .catch((err) => console.log(err))
        }

        ObjectService.updateNestedObjectValue($scope.workorder,
            changedData, selected)
    }

    // check-box
    $scope.changeThisCheckbox = (changedData, selected) => {
        ObjectService.updateNestedObjectValue($scope.workorder,
            changedData, selected)
    }

    // text-field
    $scope.changeThisTextField = (changedData, selected) => {
        if (selected === 'unitReadings.engineSerial' || selected === 'unitReadings.compressorSerial' || selected === 'newEngineSerial' || selected === 'newCompressorSerial') {
            ObjectService.updateNestedObjectValue($scope.workorder,
                changedData.toUpperCase(), selected)
        } else {
            ObjectService.updateNestedObjectValue($scope.workorder,
                changedData, selected)
        }
    }

    // text-area-field
    $scope.changeThisTextAreaField = (changedData, selected) => {
        ObjectService.updateNestedObjectValue($scope.workorder,
            changedData, selected)
    }

    // time-field
    $scope.changeThisTimeField = (changedData, selected) => {
        $scope.getTimeElapsed()
        $scope.getTotalLaborTime()
        $scope.getUnaccountedTime()
        ObjectService.updateNestedObjectValue($scope.workorder,
            changedData, selected)
    }
    // ------------------------------------------------

    // Set time adjustment notes visibility -----------
    $scope.$watch('workorder.laborCodes.basic', () => {
        if (
            $scope.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
            $scope.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
            $scope.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
            $scope.workorder.laborCodes.basic.negativeAdj.minutes > 0) {
            $scope.timeAdjustment = true
        } else {
            $scope.timeAdjustment = false
        }
    }, true)

    $scope.$watch('workorder.laborCodes.engine.replaceEngine', () => {
        if ($scope.workorder.laborCodes.engine.replaceEngine.hours === 0 &&
            $scope.workorder.laborCodes.engine.replaceEngine.minutes === 0) {
            $scope.workorder.newEngineSerial = ''
        }
    }, true)
    $scope.$watch('workorder.laborCodes.compressor.replace', () => {
        if ($scope.workorder.laborCodes.compressor.replace.hours === 0 &&
            $scope.workorder.laborCodes.compressor.replace.minutes === 0) {
            $scope.workorder.newCompressorSerial = ''
        }
    }, true)
    // ------------------------------------------------

    // Indirect Select Logic --------------------------
    $scope.type = [
        {text: 'Corrective', value: false},
        {text: 'Trouble Call', value: false},
        {text: 'New Set', value: false},
        {text: 'Transfer', value: false},
        {text: 'Swap', value: false},
        {text: 'Release', value: false},
        {text: 'Indirect', value: false},
    ]
    $scope.getTypeObj = (str) => {
        let value = false
        $scope.type.forEach((obj) => {
            if (obj.text === str) {
                value = obj
            }
        })
        return value
    }
    $scope.setType = (type) => {
        $timeout(() => {
            $scope.workorder.type = type
        })
    }
    $scope.setPM = (type, value) => {
        $scope.workorder.pm = false
        $scope.workorder.pm2 = false
        $scope.workorder.pm3 = false
        $scope.workorder.pm4 = false
        $scope.workorder.pm5 = false
        $timeout(() => {
            $scope.workorder[type.toLowerCase()] = value
        })
    }
    $scope.doItAll = (type, value) => {
        $timeout(() => {
            $scope.workorder.type = type
            $scope.type = [...$scope.type.map((obj) => {
                obj.value = false
                return obj
            })]
            $scope.workorder.pm = false
            $scope.workorder.pm2 = false
            $scope.workorder.pm3 = false
            $scope.workorder.pm4 = false
            $scope.workorder.pm5 = false
            $scope.workorder[type.toLowerCase()] = value
        })
    }
    $scope.setTypeObj = (text, value) => {
        $timeout(() => {
            $scope.type = [...$scope.type.map((obj) => {
                if (obj.text === text) {
                    obj.value = value
                }
                return obj
            })]
        })
    }
    $scope.wipeTypeObj = () => {
        $timeout(() => {
            $scope.type = [...$scope.type.map((obj) => {
                obj.value = false
                return obj
            })]
        })
    }

    // check header info and run validation, needs to refresh values
    $scope.runHeaderValidation = () => {
        const header = $scope.workorder.header
        $scope.workorder.header = null
        if ($scope.workorder.type !== 'Swap') {
            setDisplayUnit(header.unitNumber)
            $scope.workorder.comments.swapReason = ''
            $scope.workorder.unitChangeInfo.swapUnitNSID = ''
            $scope.workorder.unitChangeInfo.swapUnitNumber = ''
            $scope.workorder.unitChangeInfo.swapDestination = ''
        }
        if ($scope.workorder.type !== 'Transfer') {
            $scope.workorder.unitChangeInfo.transferLease = ''
            $scope.workorder.unitChangeInfo.transferCounty = ''
            $scope.workorder.unitChangeInfo.transferState = ''
            $scope.workorder.comments.transferReason = ''
        }
        if ($scope.workorder.type !== 'Release') {
            $scope.workorder.unitChangeInfo.releaseDestination = ''
        }
        $timeout(() => {
            $scope.workorder.header = header
        })
    }
    $scope.pmChange = (val, type) => {
        $scope.typeChange({text: type, value: val})
    }

    // Triggered on change to specific checkbox but all but PM call this function, if a pm
    // type just set it. if not a pm type make pm false if true then set.
    $scope.typeChange = (obj) => {
        const type = $scope.workorder.type
        // console.log(type)
        if (obj.text === 'PM' || obj.text === 'PM2' || obj.text === 'PM3' || obj.text ===
            'PM4' || obj.text === 'PM5') {
            if (type === 'New Set' || type === 'Release' || type === 'Indirect') {
                // console.log(`1.  I am PM type. my value is ${obj.value}`)
                $scope.doItAll(obj.text, obj.value)
            } else if ((type === 'Corrective' || type === 'Trouble Call' || type ===
                'Transfer' || type === 'Swap') && (!obj.value)) {
                // console.log(`2.  I am ${obj.text}. my value is ${obj.value}`)
                $timeout(() => {
                    $scope.workorder.pm = false
                    $scope.workorder.pm2 = false
                    $scope.workorder.pm3 = false
                    $scope.workorder.pm4 = false
                    $scope.workorder.pm5 = false
                })
            } else {
                // console.log(`3. PM type selected. I am ${obj.text}. my value is
                // ${obj.value}`)

                if (obj.text !== type) {
                    // console.log(5 + ' the current selected is not the current type')
                    if (type !== 'Corrective' && type !== 'Trouble Call' && type !==
                        'Transfer' && type !== 'Swap') {
                        // console.log(17 + ' selected another PM and removed previous PM')
                        $scope.setType(obj.text)
                    }
                    $scope.setPM(obj.text, obj.value)
                } else {
                    if (type === 'Corrective' || type === 'Trouble Call' || type ===
                        'Transfer' || type === 'Swap') {
                        // console.log(`${obj.text} is selected`)
                    } else {
                        // console.log(`18.  ${obj.text} was clicked. value is ${obj.value}.
                        // Selecting current PM, keeps true.`)
                        if (!obj.value) {
                            $scope.setPM(obj.text, !obj.value)
                        }
                    }
                }
            }
        }
        else {
            // console.log(9)
            $scope.wipeTypeObj()
            if (obj.text === 'New Set' || obj.text === 'Release' || obj.text ===
                'Indirect') {
                // console.log(10)
                if (obj.text !== $scope.workorder.type) {
                    // console.log(11)
                    $scope.setType(obj.text)
                    $scope.setTypeObj(obj.text, obj.value)
                } else {
                    // console.log('I erase everything and set to new set')
                    $scope.setType(obj.text)
                    $scope.setTypeObj(obj.text, !obj.value)
                }
                $scope.workorder.pm = false
                $scope.workorder.pm2 = false
                $scope.workorder.pm3 = false
                $scope.workorder.pm4 = false
                $scope.workorder.pm5 = false
            } else if (obj.text === 'Corrective' || obj.text === 'Trouble Call' ||
                obj.text === 'Transfer' || obj.text === 'Swap') {
                if ($scope.workorder.pm || $scope.workorder.pm2 || $scope.workorder.pm3 ||
                    $scope.workorder.pm4 || $scope.workorder.pm5) {
                    // console.log(obj.value)
                    // console.log($scope.type)
                    if ((type !== 'PM' && type !== 'PM2' && type !== 'PM3' && type !==
                        'PM4' && type !== 'PM5') && !obj.value) {
                        // console.log('Not PM and Checked is false')
                        $scope.workorder.type = $scope.workorder.pm
                            ? 'PM'
                            : ($scope.workorder.pm2 ? 'PM2' : ($scope.workorder.pm3
                                ? 'PM3'
                                : ($scope.workorder.pm4 ? 'PM4' : ($scope.workorder.pm5
                                    ? 'PM5'
                                    : obj.text))))
                        $scope.setTypeObj(obj.text, obj.value)
                        // console.log($scope.workorder.type)
                    } else {
                        // console.log(2)
                        $scope.workorder.type = obj.text
                        $scope.setTypeObj(obj.text, obj.value)
                    }
                } else {
                    // console.log(14)
                    if (obj.text !== $scope.workorder.type) {
                        // console.log(15)
                        $scope.setType(obj.text)
                        $scope.setTypeObj(obj.text, obj.value)
                    } else {
                        // console.log(16 + ' is Working')
                        $scope.setType(obj.text)
                        $scope.setTypeObj(obj.text, !obj.value)
                    }
                }
            }
        }
        console.log($scope.workorder)
        $scope.runHeaderValidation()
    }

    // on page load set checkboxes
    if ($scope.workorder.pm) {
        // you can have either Corrective or Trouble Call selected at the same time you have
        // PM selected but only one
        if ($scope.workorder.type === 'Corrective') {
            $scope.type[0].value = true
        } else if ($scope.workorder.type === 'Trouble Call') {
            $scope.type[1].value = true
        } else if ($scope.workorder.type === 'Transfer') {
            $scope.type[3].value = true
        } else if ($scope.workorder.type === 'Swap') {
            $scope.type[4].value = true
        }
    } else {
        // otherwise PM is not selected in that case only one of the fallowing can be
        // selected.
        switch ($scope.workorder.type) {
            case 'Corrective':
                $scope.type[0].value = true
                break
            case 'Trouble Call':
                $scope.type[1].value = true
                break
            case 'New Set':
                $scope.type[2].value = true
                break
            case 'Transfer':
                $scope.type[3].value = true
                break
            case 'Swap':
                $scope.type[4].value = true
                break
            case 'Release':
                $scope.type[5].value = true
                break
            case 'Indirect':
                $scope.type[6].value = true
                break
            default:
                console.log($scope.workorder.type)
        }
    }
    // ------------------------------------------------

    $scope.isFound = (input) => {
        let show
        const frameModel = $scope.workorder.unitReadings.compressorModel
        if (frameModel) {
            $scope.woInputMatrixes.forEach(matrix => {
                matrix.compressors.forEach(frame => {
                    if (frame.netsuiteId ===
                        frameModel) {
                        show = true
                    }
                })
            })
        }
        const engineModel = $scope.workorder.unitReadings.engineModel
        if (engineModel) {
            $scope.woInputMatrixes.forEach(matrix => {
                matrix.engines.forEach(engine => {
                    if (engine.netsuiteId === engineModel) {
                        show = true
                    }
                })
            })
        }
        if (!engineModel && !frameModel) {
            show = false
        }
        return show
    }

    // NOTES ------------------------------------------
    // create object model to data bind comment input to.
    $scope.comment = ClassNote()

    // create model object to work off of
    function ClassNote () {
        return {
            note:      '',
            workOrder: $scope.workorder._id,
        }
    }

    // boolean value to keep from editing note while it is sending
    $scope.sendingNote = false
    // save the new note to the database
    $scope.newNote = () => {
        // save to database will go here only if comment was filled
        if ($scope.comment.note) {
            $scope.sendingNote = true
            // save to database
            console.log('Saving new note...')
            ReviewNotes.save({}, $scope.comment,
                (response) => {
                    $scope.sendingNote = false
                    console.log(response)
                    console.log('Successful save.')
                    // retrieve notes to display.
                    ARS.ReviewNotes({workOrder: response.workOrder})
                       .then((newNotes) => {
                           $scope.reviewNotes = newNotes
                       })
                       .catch((err) => console.log(err))
                    // clear display note from form
                    $scope.comment.note = null
                }, (err) => {
                    $scope.sendingNote = false
                    console.log(err)
                    console.log('Error Saving Note.')
                    $scope.comment.note = null
                },
            )
        }
    }

    // Submissions
    // make the display for all submission history
    $scope.displaySubmissions = []

    //create display class for Submissions
    function ClassSubmission () {
        return {
            type:           '',
            firstname:      '',
            lastname:       '',
            submissionTime: Date,
        }
    }

    // only do if tech has submitted wo.
    if ($scope.workorder.timeSubmitted) {
        // Tech Submission
        ARS.getUser({id: $scope.workorder.techId})
           .then((user) => {
               let thisUser = user
               const techSubmission = ClassSubmission()
               techSubmission.type = 'Submission'
               // if user no longer exists. Deleted from db
               if (thisUser !== undefined) {
                   techSubmission.firstname = thisUser.firstName
                   techSubmission.lastname = thisUser.lastName
               } else {
                   techSubmission.firstname = $scope.workorder.techId
               }
               techSubmission.submissionTime = $scope.workorder.timeSubmitted
               $scope.displaySubmissions.push(techSubmission)
               // Manager Review
               if ($scope.workorder.timeApproved) {
                   ARS.getUser({id: $scope.workorder.approvedBy})
                      .then((manager) => {
                          thisUser = manager
                          const managerSubmission = ClassSubmission()
                          managerSubmission.type = 'Reviewed'
                          managerSubmission.firstname = thisUser.firstName
                          managerSubmission.lastname = thisUser.lastName
                          managerSubmission.submissionTime = $scope.workorder.timeApproved
                          $scope.displaySubmissions.push(
                              managerSubmission)
                      })
                      .catch((err) => console.log(err))
               }
               // Admin Sync
               if ($scope.workorder.timeSynced) {
                   ARS.getUser({id: $scope.workorder.syncedBy})
                      .then((admin) => {
                          thisUser = admin
                          const adminSubmission = ClassSubmission()
                          adminSubmission.type = 'Synced'
                          adminSubmission.firstname = thisUser.firstName
                          adminSubmission.lastname = thisUser.lastName
                          adminSubmission.submissionTime = $scope.workorder.timeSynced
                          $scope.displaySubmissions.push(adminSubmission)
                      })
                      .catch((err) => console.log(err))
               }
           })
           .catch((err) => console.log(err))
    }
    // ------------------------------------------------

    // History Changes --------------------------------
    // create the view for all edits
    $scope.displayChanges = []

    function ClassDisplayHistory () {
        return {
            panelName: '',
            itemName:  '',
            type:      '',
            before:    '',
            after:     '',
        }
    }

    // load all edits from the database
    _.map($scope.editHistories, (edit) => {
        // format the data correctly for presentation.
        if ($scope.workorder._id === edit.workOrder) {
            const thisEdit = ClassDisplayHistory()
            thisEdit.panelName = edit.path[0]
            thisEdit.itemName = edit.path.pop()
            thisEdit.type = edit.editType
            thisEdit.before = edit.before
            thisEdit.after = edit.after
            $scope.displayChanges.push(thisEdit)
        }
    })
    // load the username of the admin who made the edits. and get the count
    if ($scope.editHistories.length !== 0) {
        ARS.getUser({id: $scope.editHistories.pop().user})
           .then((admin) => {
               $scope.editor = admin
           })
           .catch((err) => {
               console.log('Editor retrieval error')
               console.log(err)
           })
        $scope.editCount = $scope.editHistories.length + 1
    }

    // ------------------------------------------------

    $scope.highMileageConfirm = false

    $scope.save = () => {
        $scope.submitting = true
        $scope.allowSubmit = true

        if (+$scope.workorder.header.startMileage > +$scope.workorder.header.endMileage) {
            $scope.openErrorModal('woMileageError.html')
            $scope.allowSubmit = false
        }
        if ((($scope.unaccountedH < 0 || $scope.unaccountedM < -15) ||
            ($scope.unaccountedH > 0 || $scope.unaccountedM > 15)) &&
            $scope.timeAdjustment === false) {
            $scope.openErrorModal('woUnaccoutedTimeError.html')
            $scope.allowSubmit = false
        }
        if ((+$scope.workorder.header.endMileage - +$scope.workorder.header.startMileage) >
            75 && !$scope.highMileageConfirm) {
            $scope.openConfirmationModal(
                'woHighMileageConfirmation.html')
            $scope.allowSubmit = false
        }
        if ($scope.workorder.unitReadings.compressorModel ||
            $scope.workorder.unitReadings.engineModel) {
            // clear all emissions, unitReadings, pmChecklist
            // items that are not associated with this wo
            $scope.workorder = CommonWOfunctions.clearNoneEngineFrame($scope.workorder, $scope.woInputMatrixes)
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
            $scope.workorder.totalMileage = $scope.workorder.header.endMileage - $scope.workorder.header.startMileage
            if ($cookies.get('role') === 'admin') {
                setSave($scope.workorder)
                WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
                    (res) => {
                        AlertService.add('success',
                            'Update was successful!')
                        $scope.submitting = false
                        console.log($scope.workorder._id)
                        $location.url('/workorder/review/' +
                            $scope.workorder._id)
                    }, (err) => {
                        console.log(err)
                        setDisplay($scope.workorder)
                        AlertService.add('danger',
                            'An error occurred while attempting to update.')
                        $scope.submitting = false
                    },
                )
            }
        }
    }

    $scope.destroy = () => {
        $scope.submitting = true
        WorkOrders.delete({id: workorder._id},
            (response) => {
                $location.path('/workorder')
                $scope.submitting = false
            }, (err) => {
                AlertService.add('error', err)
                $scope.submitting = false
            },
        )
    }

    $scope.usedLaborCodes = []
    // set usedLaborCodes array with every used labor code with the text of that labor code
    $scope.getUsedLaborCodes = () => {
        _.forEach($scope.workorder.laborCodes, (lc) => {
            _.forEach(lc, (code) => {
                if (code.hours > 0 || code.minutes > 0) {
                    if ($scope.usedLaborCodes.indexOf(code.text) === -1) {
                        $scope.usedLaborCodes.push(code.text)
                    }
                }
            })
        })
    }

    // TimeDisplayService handles all time display issues with HH:MM
    // refactored 9.5.16
    $scope.getTimeElapsed = () => {
        const start = new Date($scope.workorder.timeStarted)
        const now = $scope.workorder.timeSubmitted ?
            new Date($scope.workorder.timeSubmitted) :
            new Date()
        // e short for elapsed
        $scope.eMilli = (now.getTime() - start.getTime()).toFixed()
        $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60))
        $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)))
        $scope.eHours = Math.floor((($scope.eMilli / (36e5))))
        $scope.getTotalLaborTime()
        $scope.getUnaccountedTime()
    }

    // get total wo time based on used labor codes
    // refactored 9.5.16
    $scope.getTotalLaborTime = () => {
        $scope.laborH = 0
        $scope.laborM = 0
        $scope.totalMinutes = 0
        let AdjMinutes = 0

        const {laborCodes} = $scope.workorder
        const laborCs = Object.keys(laborCodes)
        laborCs.forEach((item) => {
            const lcChild = Object.keys(laborCodes[item])
            lcChild.forEach((child) => {
                if (laborCodes[item][child].text === 'Negative Time Adjustment') {
                    $scope.totalMinutes -= +laborCodes[item][child].hours *
                        60
                    $scope.totalMinutes -= +laborCodes[item][child].minutes
                    AdjMinutes -= +laborCodes[item][child].hours * 60
                    AdjMinutes -= +laborCodes[item][child].minutes
                } else {
                    $scope.totalMinutes += +laborCodes[item][child].hours *
                        60
                    $scope.totalMinutes += +laborCodes[item][child].minutes
                    if (laborCodes[item][child].text === 'Positive Time Adjustment' ||
                        laborCodes[item][child].text === 'Lunch') {
                        AdjMinutes += +laborCodes[item][child].hours *
                            60
                        AdjMinutes += +laborCodes[item][child].minutes
                    }
                }
            })
        })
        let AdjH
        if (AdjMinutes > 0) {
            AdjH = Math.floor(AdjMinutes / 60)
        } else {
            AdjH = Math.ceil(AdjMinutes / 60)
        }
        // $scope.laborH = parseInt($scope.totalMinutes / 60);
        if ($scope.totalMinutes > 0) {
            $scope.laborH = Math.floor($scope.totalMinutes / 60)
        } else {
            $scope.laborH = Math.ceil($scope.totalMinutes / 60)
        }

        $scope.laborM = Math.round($scope.totalMinutes % 60)
        const AdjM = Math.round(AdjMinutes % 60)
        const ShowH = $scope.laborH - AdjH
        const ShowM = $scope.laborM - AdjM
        // $scope.totalLabor = TimeDisplayService.timeManager($scope.laborH,$scope.laborM);
        $scope.totalLabor = TimeDisplayService.timeManager(ShowH,
            ShowM)
    }

    // get unaccounted for time based on used labor coded and elapsed time FIX
    // refactored 9.5.16
    $scope.getUnaccountedTime = () => {
        $scope.unaccountedM = ($scope.eHours - $scope.laborH) * 60
        $scope.unaccountedM += $scope.eMinutes - $scope.laborM
        if ($scope.unaccountedM > 0) {
            $scope.unaccountedH = Math.floor($scope.unaccountedM / 60)
        } else {
            $scope.unaccountedH = Math.ceil($scope.unaccountedM / 60)
        }
        $scope.unaccountedM = Math.round($scope.unaccountedM % 60)
        $scope.unaccountedTime = TimeDisplayService.timeManager(
            $scope.unaccountedH, $scope.unaccountedM)
    }

    function getHours () {
        const hours = []
        for (let i = 0; i <= 24; i++) {
            hours.push(i)
        }
        return hours
    }

    function getMinutes () {
        const minutes = []
        for (let i = 0; i < 60; i += 5) {
            minutes.push(i)
        }
        return minutes
    }

    /* Populate search field for parts ------------------ */
    parts.forEach((part) => {
        part.searchStr = [
            part.description,
            part.componentName,
            part.MPN].join(' ')
        return part
    })

    /* Model for the add part table --------------------- */
    $scope.partsTableModel = GeneralPartSearchService.partTableModel(
        $scope.parts, 'wo', $scope.workorder)

    $scope.removePart = (part) => {
        const index = $scope.workorder.parts.indexOf(part)
        $scope.workorder.parts.splice(index, 1)
    }

    $scope.openErrorModal = (modalUrl) => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/' + modalUrl,
            controller:  'ErrorCtrl',
        })
    }

    $scope.openConfirmationModal = (modalUrl) => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/' + modalUrl,
            controller:  'ConfirmationCtrl',
        })

        modalInstance.result.then(() => {
            $scope.highMileageConfirm = true
            $scope.save()
        })
    }

    $scope.openLeaseNotes = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLeaseNotesModal.html',
            controller:  'NotesModalCtrl',
            resolve:     {
                notes: function () {
                    return $scope.workorder.misc.leaseNotes
                },
            },
        })

        modalInstance.result.then((notes) => {
            $scope.workorder.misc.leaseNotes = notes
        })
    }

    $scope.openUnitNotes = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woUnitNotesModal.html',
            controller:  'NotesModalCtrl',
            resolve:     {
                notes: function () {
                    return $scope.workorder.misc.unitNotes
                },
            },
        })

        modalInstance.result.then((notes) => {
            $scope.workorder.misc.unitNotes = notes
        })
    }

    $scope.openUnitView = () => {
        if ($scope.displayUnit !== undefined) {
            const modalInstance = $uibModal.open({
                templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLocationModal.html',
                scope:       $scope,
                controller:  'woLocationModalCtrl',
            })
        } else {
            AlertService.add('danger',
                'No unit exists on this work order.')
        }
    }

    $scope.openJSA = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woJsaModal.html',
            controller:  'JsaEditModalCtrl',
            windowClass: 'jsa-modal',
            resolve:     {
                jsa: function () {
                    return $scope.workorder.jsa
                },
            },
        })

        modalInstance.result.then((jsa) => {
            $scope.workorder.jsa = jsa
        })
    }

    $scope.openManualPartModal = () => {
        const modalInstance = $uibModal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woManualAddModal.html',
            controller:  'AddPartEditModalCtrl',
        })

        modalInstance.result.then((part) => {
            $scope.workorder.parts.push(
                GeneralPartSearchService.manualAddPart(part))
        })
    }

    $scope.getUsedLaborCodes()

    $scope.getTimeElapsed()

    $scope.getTotalLaborTime()

    $scope.getUnaccountedTime()
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderEditCtrl', ['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'Units', 'Users', 'Customers', 'workorder', 'reviewNotes', 'editHistories', 'assettypes', 'me', 'parts', 'states', 'applicationtypes', 'DateService', 'locations', 'woInputMatrixes', 'frameModels', 'engineModels', 'counties',WorkOrderEditCtrlFunc])
