class woHeaderInfo {
    constructor($scope, $timeout, ApiRequestService, CommonWOfunctions, Utils) {
        this.utils = Utils
        this.CWF = CommonWOfunctions
        this.ARS = ApiRequestService
        this.scope = $scope
        this.timeout = $timeout

        this.border = null

        // for validation and success borders
        this.numberError = false
        this.numberSuccess = false
        this.numberHighlight = false
        this.customerError = false
        this.leaseError = false
        this.countyError = false
        this.stateError = false

        this.currentState = null
        this.currentCounty = null


        this.countiesArray = []
        this.unitLocationArray = []
        this.customersArray = []
        this.unitNumberArray = []
        this.usersArray = []

        this.initCheck = true

        this.unitNumberChange = this.unitNumberChange.bind(this)
        this.getAssetTypeNSID = this.getAssetTypeNSID.bind(this)
        this.validateHeader = this.validateHeader.bind(this)
        this.validateState = this.validateState.bind(this)
        this.validateCounty = this.validateCounty.bind(this)
        this.resetUnitInfoTypeChange = this.resetUnitInfoTypeChange.bind(this)
        this.resetInfo = this.resetInfo.bind(this)
    }

    $doCheck() {
        if (!this.utils.isEmpty(this.states) && !this.utils.isEmpty(this.counties)) {
            this.toCb((wo, du, u, state) => {
                console.log(state)
                if ((state.typeSelectionChangeHeader || this.initCheck) && !this.utils.isEmpty(du) &&
                    !this.utils.isEmpty(u)) {
                    this.initCheck = false
                    this.timeout(() => {
                        if (state.typeSelectionChangeHeader) {
                            console.log('doing the reset')
                            // fix unit header information
                            this.resetUnitInfoTypeChange(wo, du, u, state, wo.header.unitNumber)
                        } else {
                            this.validateState(wo, du, u)
                            this.validateCounty(wo, du, u)
                            this.validateHeader(wo, du, u)
                        }
                        state.typeSelectionChangeHeader = false
                        this.border = {
                            borderWidth: '6px',
                        }
                    })
                }
            })
        }
    }

    validateHeader(wo, du, u) {
        let unitExists
        if (du && wo.type !== 'Indirect') {
            unitExists = 'is_unit'
        } else if (!du && wo.type !== 'Indirect') {
            unitExists = 'should_unit'
        } else {
            unitExists = 'no_unit'
        }

        if (unitExists === 'is_unit') {
            // Unit Number
            let number
            if (wo.type !== 'Swap') {
                number = u.number
                if (number.toUpperCase() === wo.header.unitNumber.toUpperCase() && number.toUpperCase() ===
                    wo.unitNumber.toUpperCase()) {
                    this.numberError = false
                    this.numberSuccess = true
                } else {
                    this.numberError = true
                    this.numberSuccess = false
                }
            }
            // Customer
            let customerName
            if (wo.type === 'Swap') {
                customerName = u.customerName
            } else {
                customerName = du.customerName
            }
            if (customerName.toUpperCase() === wo.header.customerName.toUpperCase()) {
                this.customerError = false
            } else {
                this.customerError = true
            }
            // Lease
            let locationName
            if (wo.type === 'Swap') {
                locationName = u.locationName
            } else {
                locationName = du.locationName
            }
            if (locationName.toUpperCase() === wo.header.leaseName.toUpperCase()) {
                this.leaseError = false
            } else {
                this.leaseError = true
            }
        } else if (unitExists === 'should_unit') {
            this.numberError = true
            this.customerError = true
            this.leaseError = true
        } else if (unitExists === 'no_unit') {
            this.numberError = true
            this.customerError = true
            this.leaseError = true
        }
    }

    validateState(wo, du, u) {
        let unitExists
        if (du && wo.type !== 'Indirect') {
            unitExists = 'is_unit'
        } else if (!du && wo.type !== 'Indirect') {
            unitExists = 'should_unit'
        } else {
            unitExists = 'no_unit'
        }

        if (unitExists === 'is_unit') {
            let state = (du.state === null || du.state === undefined) ? '' :
                        (this.utils.getObjFromArrayByID(this.states, du.state) ?
                         this.utils.getObjFromArrayByID(this.states, du.state) :
                         (this.utils.getObjByValue(this.states, du.state, 'name') ?
                          this.utils.getObjByValue(this.states, du.state, 'name') : ''))
            this.state = state
            if (!this.utils.isEmpty(state) && state.name.toUpperCase() === wo.header.state.toUpperCase()) {
                this.stateError = false
            } else {
                this.stateError = true
            }
        } else if (unitExists === 'should_unit') {
            this.stateError = true
        } else if (unitExists === 'no_unit') {
            this.stateError = true
        }
    }

    validateCounty(wo, du, u) {
        let unitExists
        if (du && wo.type !== 'Indirect') {
            unitExists = 'is_unit'
        } else if (!du && wo.type !== 'Indirect') {
            unitExists = 'should_unit'
        } else {
            unitExists = 'no_unit'
        }

        if (unitExists === 'is_unit') {
            let county = (du.county === null || du.county === undefined) ? '' :
                         (this.utils.getObjFromArrayByID(this.counties, du.county) ?
                          this.utils.getObjFromArrayByID(this.counties, du.county) :
                          (this.utils.getObjByValue(this.counties, du.county, 'name') ?
                           this.utils.getObjByValue(this.counties, du.county, 'name') : ''))
            this.county = county
            if (!this.utils.isEmpty(county) && county.name.toUpperCase() === wo.header.county.toUpperCase()) {
                this.countyError = false
            } else {
                this.countyError = true
            }
        } else if (unitExists === 'should_unit') {
            this.countyError = true
        } else if (unitExists === 'no_unit') {
            this.countyError = true
        }
    }

    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    getAssetTypeNSID(ps) {
        let NSID = null
        this.assetTypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId
            }
        })
        return NSID
    }

    /*
    * Methods to dynamically create lists for user typeaheads
    * */
    countyNameChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Counties({
                    regexN: input,
                    limit:  12
                })
                    .then((counties) => {
                        this.countiesArray = counties
                        this.validateCounty(wo, du, u)
                    })
                    .catch(console.error)
            })
        })
    }

    stateNameChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.validateState(wo, du, u)
            })
        })
    }
    leaseChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Units({regexL: input})
                    .then((units) => {
                        this.unitLocationArray = units
                        this.validateHeader(wo, du, u)
                    })
                    .catch(console.error)
            })
        })
    }
    customerChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Customers({regexName: input})
                    .then((customers) => {
                        this.customersArray = customers
                        this.validateHeader(wo, du, u)
                    })
                    .catch(console.error)
            })
        })
    }
    rideAlongChange(input) {
        this.timeout(() => {
            this.ARS.Users({regexName: input})
                .then((users) => {
                    this.usersArray = users.map((user) => {
                        user.fullName = `${user.firstName} ${user.lastName}`
                        return user
                    })
                })
                .catch(console.error)
        })
    }
    unitNumberChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.ARS.Units({regexN: input})
                    .then((units) => {
                        this.unitNumberArray = units
                        units.forEach((unit) => {
                            this.resetInfo(wo, du, u, state, unit, input)
                        })
                    })
                    .catch(console.error)
            })
        })
    }

    /**
     * When a new Type is selected all the current rules set up for the header
     * are broken. Need to reset header rules and display unit and header unit.
     * Along with setting focal points of what to check againast now so proper
     * highlighting is shown.
     * @param wo
     * @param du
     * @param u
     * @param state
     */
    resetUnitInfoTypeChange(wo, du, u, state, input) {
        this.ARS.Units({regexN: wo.header.unitNumber})
            .then((units) => {
                units.forEach((unit) => {
                    this.resetInfo(wo, du, u, state, unit, input)
                })
            })
            .catch(console.error)
    }

    resetInfo(wo, du, u, state, unit, input) {
        if (unit.number.toUpperCase() === input.toUpperCase()) {
            const thisUnit = unit

            let engineObj
            let frameObj

            for (let item in wo.header) {
                if (wo.header.hasOwnProperty(item)) {
                    if (item === 'state' || item === 'county' || item === 'leaseName' || item === 'unitNumber' ||
                        item === 'customerName') {
                        wo.header[item] = ''
                    }
                }
            }
            if (wo.type !== 'Swap') {
                if (thisUnit.engineModel) {
                    this.engineModels.forEach((engine) => {
                        if (engine.netsuiteId === thisUnit.engineModel) {
                            engineObj = engine
                        }
                    })
                }
                if (thisUnit.frameModel) {
                    this.frameModels.forEach((frame) => {
                        if (frame.netsuiteId === thisUnit.frameModel) {
                            frameObj = frame
                        }
                    })
                }

                wo.unitReadings.engineModel = ''
                wo.unitReadings.compressorModel = ''
                wo.unitReadings.displayEngineModel = ''
                wo.unitReadings.displayFrameModel = ''
                wo.geo.coordinates[0] = 0
                wo.geo.coordinates[1] = 0
                du = thisUnit
                u = thisUnit
                wo.header.unitNumber = thisUnit.number
                wo.unitNumber = wo.header.unitNumber
                wo.unitReadings.engineSerial = thisUnit.engineSerial
                wo.unitReadings.compressorSerial = thisUnit.compressorSerial
                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries)
                wo.jsa.customer = thisUnit.customerName
                wo.jsa.location = thisUnit.locationName
                wo.unit = thisUnit._id
                wo.unitReadings.displayEngineModel = engineObj !== undefined ? engineObj.model : ''
                wo.unitReadings.displayFrameModel = frameObj !== undefined ? frameObj.model : ''
                wo.unitReadings.engineModel = engineObj !== undefined ? engineObj.netsuiteId : ''
                wo.unitReadings.compressorModel = frameObj !== undefined ? frameObj.netsuiteId : ''
            } else {
                u = thisUnit
            }
            wo.header.unitNumber = thisUnit.number
            console.log(thisUnit)
            if (thisUnit.county) {
                console.log('validate county')
                console.log(thisUnit.county)
                this.ARS.http.get.county(thisUnit.county)
                    .then((res) => {
                        wo.header.county = res.data.name
                        if (wo.type !== 'Swap') {
                            du.county = res.data.name
                        }
                        u.county = res.data.name
                        this.validateCounty(wo, du, u)
                    }, (err) => {
                        console.error(err)
                    })
            }
            if (thisUnit.state) {
                this.ARS.http.get.state(thisUnit.state)
                    .then((res) => {
                        wo.header.state = res.data.name
                        if (wo.type !== 'Swap') {
                            du.state = res.data.name
                        }
                        u.state = res.data.name
                        this.validateState(wo, du, u)
                    }, (err) => {
                        console.error(err)
                    })
            }
            wo.header.leaseName = thisUnit.locationName
            wo.header.customerName = thisUnit.customerName
            wo.header.unitNumberNSID = thisUnit.netsuiteId
            wo.geo = thisUnit.geo
            wo.geo.coordinates[0] = thisUnit.geo.coordinates[0]
            wo.geo.coordinates[1] = thisUnit.geo.coordinates[1]
        } else if (unit.number !== undefined) {
            wo.jsa.customer = ''
            wo.jsa.location = ''
        }
        this.validateHeader(wo, du, u)
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woHeaderInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woHeaderInfo.html',
        bindings:    {
            callBack:         '&',
            workorder:        '<',
            headerUnit:       '<',
            displayUnit:      '<',
            states:           '<',
            counties:         '<',
            applicationtypes: '<',
            engineModels:     '<',
            frameModels:      '<',
            assetTypes:       '<',
            disabled:         '<',
            state:            '<',
        },
        controller:  ['$scope', '$timeout', 'ApiRequestService', 'CommonWOfunctions', 'Utils', woHeaderInfo],
    })
