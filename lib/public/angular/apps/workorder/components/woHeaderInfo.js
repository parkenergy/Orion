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
    }

    $onChanges(ch) {
        if (this.initCheck && !this.utils.isEmpty(this.states) && !this.utils.isEmpty(this.counties)) {
            this.initCheck = false
            this.toCb((wo, du, u) => {
                this.timeout(() => {
                    this.validateHeader(wo, du, u)
                    this.border = {
                        borderWidth: '6px',
                    }
                })
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
            if (wo.type === 'Transfer') {
                number = u.number
            } else {
                number = du.number
            }
            if (number.toUpperCase() === wo.header.unitNumber.toUpperCase()) {
                if ((wo.header.unitNumber.toUpperCase() === wo.unitNumber.toUpperCase()) && wo.type !== 'Swap') {
                    this.numberError = false
                } else {
                    this.numberError = true
                }
            } else {
                this.numberError = true
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
            // County
            let county
            if (wo.type === 'Swap') {
                county = (u.county === null || u.county === undefined) ? '' :
                         this.utils.getObjFromArrayByID(this.counties, u.county)
            } else {
                county = (du.county === null || du.county === undefined) ? '' :
                         this.utils.getObjFromArrayByID(this.counties, du.county)
            }
            this.county = county
            if (county && county.name.toUpperCase() === wo.header.county.toUpperCase()) {
                this.countyError = false
            } else {
                this.countyError = true
            }
            // State
            let state
            if (wo.type === 'Swap') {
                state = (u.state === null || u.state === undefined) ? '' :
                        this.utils.getObjFromArrayByID(this.states, u.state)
            } else {
                state = (du.state === null || du.state === undefined) ? '' :
                        this.utils.getObjFromArrayByID(this.states, du.state)
            }
            this.state = state
            if (state && state.name.toUpperCase() === wo.header.state.toUpperCase()) {
                this.stateError = false
            } else {
                this.stateError = true
            }
        } else if (unitExists === 'should_unit') {
            this.numberError = true
            this.customerError = true
            this.leaseError = true
            this.countyError = true
            this.stateError = true
        } else if (unitExists === 'no_unit') {
            this.numberError = true
            this.customerError = true
            this.leaseError = true
            this.countyError = true
            this.stateError = true
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
                        this.validateHeader(wo, du, u)
                    })
                    .catch(console.error)
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
                            if (unit.number === input) {
                                const thisUnit = unit

                                let engineObj
                                if (thisUnit.engineModel) {
                                    this.engineModels.forEach((engine) => {
                                        if (engine.netsuiteId === thisUnit.engineModel) {
                                            engineObj = engine
                                        }
                                    })
                                }
                                let frameObj
                                if (thisUnit.frameModel) {
                                    this.frameModels.forEach((frame) => {
                                        if (frame.netsuiteId === thisUnit.frameModel) {
                                            frameObj = frame
                                        }
                                    })
                                }

                                for (let u in wo.header) {
                                    if (wo.header.hasOwnProperty(u)) {
                                        if (u === 'state' || u === 'county' || u === 'leaseName' || u === 'unitNumber' || u === 'customerName') {
                                            wo.header[u] = ''
                                        }
                                    }
                                }

                                wo.unitReadings.engineModel = ''
                                wo.unitReadings.compressorModel = ''
                                wo.unitReadings.displayEngineModel = ''
                                wo.unitReadings.displayFrameModel = ''
                                wo.geo.coordinates[0] = 0
                                wo.geo.coordinates[1] = 0


                                du = thisUnit
                                if (thisUnit.county) {
                                    this.ARS.http.get.county(thisUnit.county)
                                        .then((res) => {
                                            wo.header.county = res.data.name
                                            du.county = res.data.name
                                            this.validateHeader(wo, du, u)
                                        }, (err) => {
                                            console.error(err)
                                        })
                                }
                                if (thisUnit.state) {
                                    this.ARS.http.get.state(thisUnit.state)
                                        .then((res) => {
                                            wo.header.state = res.data.name
                                            du.state = res.data.name
                                            this.validateHeader(wo, du, u)
                                        }, (err) => {
                                            console.error(err)
                                        })
                                }

                                wo.header.leaseName = thisUnit.locationName
                                wo.header.customerName = thisUnit.customerName
                                wo.header.unitNumber = thisUnit.number
                                wo.header.unitNumberNSID = thisUnit.netsuiteId
                                wo.unitNumber = wo.header.unitNumber
                                wo.geo = thisUnit.geo
                                wo.unitReadings.engineSerial = thisUnit.engineSerial
                                wo.unitReadings.compressorSerial = thisUnit.compressorSerial
                                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries)
                                wo.geo.coordinates[0] = thisUnit.geo.coordinates[0]
                                wo.geo.coordinates[1] = thisUnit.geo.coordinates[1]
                                wo.jsa.customer = thisUnit.customerName
                                wo.jsa.location = thisUnit.locationName
                                wo.unit = thisUnit._id
                                wo.unitReadings.displayEngineModel = engineObj !== undefined ? engineObj.model : ''
                                wo.unitReadings.displayFrameModel = frameObj !== undefined ? frameObj.model : ''
                                wo.unitReadings.engineModel = engineObj !== undefined ? engineObj.netsuiteId : ''
                                wo.unitReadings.compressorModel = frameObj !== undefined ? frameObj.netsuiteId : ''
                                wo.unitSnapShot = thisUnit
                            } else if (unit.number !== undefined) {
                                wo.jsa.customer = ''
                                wo.jsa.location = ''
                            }
                        })
                        this.validateHeader(wo, du, u)
                    })
                    .catch(console.error)
            })
        })
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
        },
        controller:  ['$scope', '$timeout', 'ApiRequestService', 'CommonWOfunctions', 'Utils', woHeaderInfo],
    })
