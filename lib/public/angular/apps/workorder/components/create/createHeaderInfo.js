class createHeaderInfo {
    constructor ($scope, $timeout, ApiRequestService) {
        this.ARS = ApiRequestService
        this.scope = $scope
        this.timeout = $timeout

        this.statesArray = []
        this.countiesArray = []
        this.unitLocationArray = []
        this.customersArray = []
        this.unitNumberArray = []

        this.unitNumberChange = this.unitNumberChange.bind(this)
        this.getAssetTypeNSID = this.getAssetTypeNSID.bind(this)
    }

    /**to
     * Static method with generic return method
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, a, b) => cb(wo, a, b)
    }

    /**
     * This method is used to send the object with cb
     * to the parent controller. The base method needs
     * to be static but the inards need to be dynamic
     * @param cb - where the cb needs to execute on (wo, du, he) -> (workorder, display unit,
     *   header unit)
     */
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
        this.timeout(() => {
            this.ARS.Counties({regexN: input, limit: 12})
                .then((counties) => {
                    this.countiesArray = counties
                })
                .catch(console.error)
        })
    }
    leaseChange(input) {
        this.timeout(() => {
            this.ARS.Units({regexL: input})
                .then((units) => {
                    this.unitLocationArray = units
                })
                .catch(console.error)
        })
    }
    customerChange(input) {
        this.timeout(() => {
            this.ARS.Customers({regexName: input})
                .then((customers) => {
                    this.customersArray = customers
                })
                .catch(console.error)
        })
    }
    unitNumberChange(input) {
        this.toCb((wo, du, hu) => {
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
                                        if (engine._id === thisUnit.engineModel) {
                                            engineObj = engine
                                        }
                                    })
                                }
                                let frameObj
                                if (thisUnit.frameModel) {
                                    this.frameModels.forEach((frame) => {
                                        if (frame._id === thisUnit.frameModel) {
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
                                        }, (err) => {
                                            console.error(err)
                                        })
                                }
                                if (thisUnit.state) {
                                    this.ARS.http.get.state(thisUnit.state)
                                        .then((res) => {
                                            wo.header.state = res.data.name
                                            du.state = res.data.name
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
                    })
                    .catch(console.error)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createHeaderInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/headerInfo.html',
        bindings:    {
            callBack:         '&',
            workorder:        '<',
            states:           '<',
            applicationtypes: '<',
            engineModels:     '<',
            frameModels:      '<',
            assetTypes:       '<',
        },
        controller:  ['$scope', '$timeout','ApiRequestService', createHeaderInfo],
    })
