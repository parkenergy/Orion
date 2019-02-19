'use strict'
const {isEmpty, rmArrObjDups} = require('tedb-utils')
const ObjectId = require('mongoose').Types.ObjectId
const Customers = require('../models/customer')
const Users = require('../models/user')
const Units = require('../models/unit')
const _ = require('lodash')
const TBA = require('./tokenBasedAuthentication')
const ClientError = require('../errors/client')
const log = require('./logger')

class WOSync {

    constructor (WorkOrders, data, newArray) {
        this.WorkOrders = WorkOrders
        this.data = data
        this.newArray = newArray
        this.checkIsSyncStatus = this.checkIsSyncStatus.bind(this)
        this.insertIncomingWOs = this.insertIncomingWOs.bind(this)
        this.syncSubmittedWOs = this.syncSubmittedWOs.bind(this)
        this.AutoSyncToNetsuite = this.AutoSyncToNetsuite.bind(this)
    }

    static populateCustomerByName (wo) {
        return new Promise((resolve, reject) => {
            Customers.findOne({name: wo.header.customerName})
                     .lean()
                     .exec()
                     .then((cust) => {
                         log.trace({customer: cust}, 'Customer Found')
                         wo.customer = cust || null
                         if (wo.customer === null) {
                             wo.customer = {netsuiteId: ''}
                         }

                         return wo
                     })
                     .then(resolve)
                     .catch(reject)
        })
    }

    static syncToNetsuite (woDoc) {
        return new Promise((resolve, reject) => {
            if (!woDoc.header.unitNumberNSID && woDoc.type !== 'Swap') {
                woDoc.header.unitNumberNSID = woDoc.unitSnapShot.netsuiteId
            }
            if (!woDoc.unitChangeInfo.swapUnitNSID && woDoc.type === 'Swap') {
                woDoc.unitChangeInfo.swapUnitNSID = woDoc.unitSnapShot.netsuiteId
            }
            if (!woDoc.header.unitNumberNSID && woDoc.type === 'Swap') {
                woDoc.header.unitNumberNSID = woDoc.unitSnapShot.netsuiteId
            }

            if (woDoc.type === 'Indirect') {
                return reject(new ClientError('Indirect WorkOrders will not be synced'))
            }

            let nswo = null

            async function getCustomer () {
                const wo = await WOSync.populateCustomerByName(woDoc)
                nswo = WOSync.netSuiteFormat(wo)
                let backoff = 200
                let retries = 8

                const makeCall = (repeats) => {
                    const workOrderLink = new TBA('https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1')

                    workOrderLink.postRequest(nswo,
                        (body) => {
                            if (!isEmpty(body) && !isEmpty(body.error)) {
                                const error_message = body.error.code ||
                                    JSON.stringify(body)
                                if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                                    -1) {
                                    if (repeats > 0) {
                                        if (backoff && retries) {
                                            setTimeout(() => {
                                                makeCall(repeats - 1)
                                            }, backoff * (retries - (repeats + 1)))
                                        } else {
                                            makeCall(repeats - 1)
                                        }
                                    } else {
                                        woDoc.netsuiteId = ''
                                        woDoc.netsuiteSyned = false
                                    }
                                } else {
                                    woDoc.netsuiteId = ''
                                    woDoc.netsuiteSyned = false
                                }
                            } else {
                                if (!body.nswoid) {
                                    woDoc.netsuiteId = ''
                                    woDoc.netsuiteSyned = false
                                } else {
                                    woDoc.netsuiteId = body.nswoid
                                    woDoc.netsuiteSyned = true
                                }
                                resolve(woDoc)
                            }
                        }, (error) => {
                            console.log(error)
                            const error_message = error.error.code ||
                                JSON.stringify(error)
                            if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                                -1) {
                                if (repeats > 0) {
                                    if (backoff && retries) {
                                        setTimeout(() => {
                                            makeCall(repeats - 1)
                                        }, backoff * (retries - (repeats + 1)))
                                    } else {
                                        makeCall(repeats - 1)
                                    }
                                } else {
                                    reject(error)
                                }
                            } else {
                                reject(error)
                            }
                        })
                }

                makeCall(retries)
            }

            let eh = getCustomer()
        })
    }

    static LaborCodePasses (wo) {
        const {laborCodes, header: {startMileage, endMileage}} = wo

        const laborCs = Object.keys(laborCodes)
        let totalMinutes = 0
        let TravelHours = 0
        laborCs.forEach((item) => {
            const lcChild = Object.keys(laborCodes[item])
            lcChild.forEach((child) => {
                if (laborCodes[item][child].text !== 'Negative Time Adjustment' &&
                    laborCodes[item][child].text !== 'Positive Time Adjustment' &&
                    laborCodes[item][child].text !== 'Lunch') {
                    totalMinutes += +laborCodes[item][child].hours * 60
                    totalMinutes += +laborCodes[item][child].minutes
                }
                if (laborCodes[item][child].text === 'Service Travel') {
                    TravelHours += +laborCodes[item][child].hours
                    TravelHours += +laborCodes[item][child].minutes / 60
                }
            })
        })
        const totalHours = Math.floor(totalMinutes / 60)
        const distance = +endMileage - +startMileage
        // don't let work orders over 8 hours auto sync
        if (totalHours > 10) {
            return false
        }
        // block if distance but no service travel
        /*if (TravelHours === 0 && distance > 0) {
            return false
        }
        return true*/
        return !(TravelHours === 0 && distance > 0)
    }

    /**
     * Compare the incoming work order unit information to an actual
     * unit.
     * @param wo
     * @param unit
     * @returns {boolean}
     */
    static compareWorkorderUnitToUnit (wo, unit) {
        let state
        let county
        if (unit.state !== null) {
            state = unit.state.name
        } else {
            state = ''
        }
        if (unit.county !== null) {
            county = unit.county.name
        } else {
            county = ''
        }
        // don't block for lat long anymore
        /*(wo.geo.coordinates[0] === unit.geo.coordinates[0]) &&
          (wo.geo.coordinates[1] === unit.geo.coordinates[1])*/
        return ((wo.number.toUpperCase() === unit.number.toUpperCase()) &&
            (wo.state.toUpperCase() === state.toUpperCase()) &&
            (wo.county.toUpperCase() === county.toUpperCase()) &&
            (wo.locationName.toUpperCase() === unit.locationName.toUpperCase()) &&
            (wo.customerName.toUpperCase() === unit.customerName.toUpperCase()) &&
            (wo.engineSerial === unit.engineSerial) &&
            (wo.compressorSerial === unit.compressorSerial))
    }

    /**
     * Used to get the wo unit information of just the serial numbers
     * everything else except coordinates
     * @param wo
     * @returns {{engineSerial: (unitReadings.engineSerial|{default, type}|string), number: *,
     *   locationName: *, compressorSerial: (unitReadings.compressorSerial|{default, type}|string),
     *   county: *, state: *, customerName: *}}
     */
    static getWorkOrderUnitInfo (wo) {
        return {
            engineSerial:     wo.unitReadings.engineSerial,
            compressorSerial: wo.unitReadings.compressorSerial,
            number:           wo.unitNumber,
            state:            wo.header.state,
            county:           wo.header.county,
            customerName:     wo.header.customerName,
            locationName:     wo.header.leaseName,
        }
    }

    static formatLaborCodeTime (lc) {
        if (lc) {
            const hours = ((lc.minutes / 60) + lc.hours).toFixed(2)
            return hours.toString()
        } else {
            return ''
        }
    }

    static netSuiteFormat (wo) {
        try {
            return {
                //main
                dummy: 'dummy',
                isPM:  wo.pm ? 'T' : 'F', // is PM1
                pm2:   wo.pm2 ? 'T' : 'F',
                pm3:   wo.pm3 ? 'T' : 'F',
                pm4:   wo.pm4 ? 'T' : 'F',
                pm5:   wo.pm5 ? 'T' : 'F',

                techId:    wo.techId,
                truckId:   wo.truckId,
                truckNSID: wo.truckNSID,

                swap:                  wo.type === 'Swap' ? 'T' : 'F',
                transfer:              wo.type === 'Transfer' ? 'T' : 'F',
                troubleCall:           wo.type === 'Trouble Call' ? 'T' : 'F',
                newSet:                wo.type === 'New Set' ? 'T' : 'F',
                release:               wo.type === 'Release' ? 'T' : 'F',
                correctiveMaintenance: wo.type === 'Corrective' ? 'T' : 'F',
                atShop:                wo.atShop ? 'T' : 'F',

                timeSubmitted: typeof wo.timeSubmitted === 'object'
                                   ? wo.timeSubmitted.toISOString()
                                   : wo.timeSubmitted,
                woStarted:     typeof wo.timeStarted === 'object'
                                   ? wo.timeStarted.toISOString()
                                   : wo.timeStarted,
                woEnded:       typeof wo.timeSubmitted === 'object'
                                   ? wo.timeSubmitted.toISOString()
                                   : wo.timeSubmitted,

                //header
                unitNumber:         wo.type === 'Swap'
                                        ? wo.unitChangeInfo.swapUnitNSID
                                        : wo.header.unitNumberNSID,
                customerName:       wo.customer.netsuiteId,
                contactName:        '',
                county:             wo.header.county,
                state:              wo.header.state,
                leaseName:          wo.header.leaseName,
                rideAlong:          wo.header.rideAlong,
                startMileage:       wo.header.startMileage,
                endMileage:         wo.header.endMileage,
                applicationType:    wo.header.applicationtype,
                // unitChangeInfo push transfer/swap/release info
                releaseDestination: wo.unitChangeInfo.releaseDestination
                                        ? wo.unitChangeInfo.releaseDestination
                                        : '', // for release only is a WH
                transferLease:      wo.unitChangeInfo.transferLease
                                        ? wo.unitChangeInfo.transferLease
                                        : '', //
                transferCounty:     wo.unitChangeInfo.transferCounty
                                        ? wo.unitChangeInfo.transferCounty
                                        : '',
                transferState:      wo.unitChangeInfo.transferState
                                        ? wo.unitChangeInfo.transferState
                                        : '',
                swapDestination:    wo.unitChangeInfo.swapDestination
                                        ? wo.unitChangeInfo.swapDestination
                                        : '', // a WH
                swapUnitNSID:       wo.unitChangeInfo.swapUnitNSID
                                        ? wo.unitChangeInfo.swapUnitNSID
                                        : '',

                assetType: wo.assetType,

                isUnitRunningOnDeparture: wo.misc.isUnitRunningOnDeparture ? 'T' : 'F',

                //unit ownership
                isCustomerUnit: wo.unitOwnership.isCustomerUnit ? 'T' : 'F',
                isRental:       wo.unitOwnership.isRental ? 'T' : 'F',

                //billing info
                billableToCustomer: wo.billingInfo.billableToCustomer ? 'T' : 'F',
                warrantyWork:       wo.billingInfo.warrantyWork ? 'T' : 'F',
                AFE:                wo.billingInfo.AFE ? 'T' : 'F',
                AFENumber:          wo.billingInfo.AFENumber,

                //pm check list
                lowDischargeKill:      wo.pmChecklist.killSettings.lowDischargeKill, // !
                highSuctionKill:       wo.pmChecklist.killSettings.highSuctionKill, // !
                highDischargeKill:     wo.pmChecklist.killSettings.highDischargeKill, // !
                lowSuctionKill:        wo.pmChecklist.killSettings.lowSuctionKill, // !
                highDischargeTempKill: wo.pmChecklist.killSettings.highDischargeTempKill, // !

                //engine checks
                battery:           wo.pmChecklist.engineChecks.battery ? 'T' : 'F',
                capAndRotor:       wo.pmChecklist.engineChecks.capAndRotor ? 'T' : 'F',
                airFilter:         wo.pmChecklist.engineChecks.airFilter ? 'T' : 'F',
                oilAndFilters:     wo.pmChecklist.engineChecks.oilAndFilters ? 'T' : 'F',
                magPickup:         wo.pmChecklist.engineChecks.magPickup ? 'T' : 'F',
                belts:             wo.pmChecklist.engineChecks.belts ? 'T' : 'F',
                guardsAndBrackets: wo.pmChecklist.engineChecks.guardsAndBrackets ? 'T' : 'F',
                sparkPlugs:        wo.pmChecklist.engineChecks.sparkPlugs ? 'T' : 'F',
                plugWires:         wo.pmChecklist.engineChecks.plugWires ? 'T' : 'F',
                driveLine:         wo.pmChecklist.engineChecks.driveLine ? 'T' : 'F',

                //general checks
                kills:                wo.pmChecklist.generalChecks.kills ? 'T' : 'F',
                airHoses:             wo.pmChecklist.generalChecks.airHoses ? 'T' : 'F',
                coolerForCracks:      wo.pmChecklist.generalChecks.coolerForCracks ? 'T' : 'F',
                coolerLouverMovement: wo.pmChecklist.generalChecks.coolerLouverMovement ? 'T' : 'F',
                coolerLouverCleaned:  wo.pmChecklist.generalChecks.coolerLouverCleaned ? 'T' : 'F',
                pressureReliefValve:  wo.pmChecklist.generalChecks.pressureReliefValve ? 'T' : 'F',
                scrubberDump:         wo.pmChecklist.generalChecks.scrubberDump ? 'T' : 'F',
                plugInSkid:           wo.pmChecklist.generalChecks.plugInSkid ? 'T' : 'F',
                filledDayTank:        wo.pmChecklist.generalChecks.filledDayTank ? 'T' : 'F',
                fanForCracking:       wo.pmChecklist.generalChecks.fanForCracking ? 'T' : 'F',
                panelWires:           wo.pmChecklist.generalChecks.panelWires ? 'T' : 'F',
                oilPumpBelt:          wo.pmChecklist.generalChecks.oilPumpBelt ? 'T' : 'F',

                fuelPressureFirstCut:  wo.pmChecklist.fuelPressureFirstCut, // !
                fuelPressureSecondCut: wo.pmChecklist.fuelPressureSecondCut, // !
                fuelPressureThirdCut:  wo.pmChecklist.fuelPressureThirdCut,
                visibleLeaksNotes:     wo.pmChecklist.visibleLeaksNotes, // !

                //engine compression // !
                cylinder1:  wo.pmChecklist.engineCompression.cylinder1,
                cylinder2:  wo.pmChecklist.engineCompression.cylinder2,
                cylinder3:  wo.pmChecklist.engineCompression.cylinder3,
                cylinder4:  wo.pmChecklist.engineCompression.cylinder4,
                cylinder5:  wo.pmChecklist.engineCompression.cylinder5,
                cylinder6:  wo.pmChecklist.engineCompression.cylinder6,
                cylinder7:  wo.pmChecklist.engineCompression.cylinder7,
                cylinder8:  wo.pmChecklist.engineCompression.cylinder8,
                cylinder9:  wo.pmChecklist.engineCompression.cylinder9,
                cylinder10: wo.pmChecklist.engineCompression.cylinder10,
                cylinder11: wo.pmChecklist.engineCompression.cylinder11,
                cylinder12: wo.pmChecklist.engineCompression.cylinder12,
                cylinder13: wo.pmChecklist.engineCompression.cylinder13,
                cylinder14: wo.pmChecklist.engineCompression.cylinder14,
                cylinder15: wo.pmChecklist.engineCompression.cylinder15,
                cylinder16: wo.pmChecklist.engineCompression.cylinder16,

                //unit readings
                // Engine
                engineModel:           wo.unitReadings.engineModel,
                engineSerial:          wo.unitReadings.engineSerial,
                engBattery:            wo.unitReadings.engBattery ? wo.unitReadings.engBattery : '',
                engOilTemp:            wo.unitReadings.engOilTemp ? wo.unitReadings.engOilTemp : '',
                engOilTempKill:        wo.unitReadings.engOilTempKill
                                           ? wo.unitReadings.engOilTempKill
                                           : '',
                engineJWTemp:          wo.unitReadings.engineJWTemp,
                engineJWTempKill:      wo.unitReadings.engineJWTempKill
                                           ? wo.unitReadings.engineJWTempKill
                                           : '',
                engineOilPressure:     wo.unitReadings.engineOilPressure,
                engOilPressureKill:    wo.unitReadings.engOilPressureKill
                                           ? wo.unitReadings.engOilPressureKill
                                           : '',
                alternatorOutput:      wo.unitReadings.alternatorOutput,
                hourReading:           wo.unitReadings.hourReading,
                engAirInletTemp:       wo.unitReadings.engAirInletTemp
                                           ? wo.unitReadings.engAirInletTemp
                                           : '',
                engAirInletTempKill:   wo.unitReadings.engAirInletTempKill
                                           ? wo.unitReadings.engAirInletTempKill
                                           : '',
                // !
                engJWPress:            wo.unitReadings.engJWPress ? wo.unitReadings.engJWPress : '',
                // !
                engJWPressKill:        wo.unitReadings.engJWPressKill
                                           ? wo.unitReadings.engJWPressKill
                                           : '',
                engTurboExhTempR:      wo.unitReadings.engTurboExhTempR
                                           ? wo.unitReadings.engTurboExhTempR
                                           : '',
                engTurboExhTempRKill:  wo.unitReadings.engTurboExhTempRKill
                                           ? wo.unitReadings.engTurboExhTempRKill
                                           : '',
                engTurboExhTempL:      wo.unitReadings.engTurboExhTempL
                                           ? wo.unitReadings.engTurboExhTempL
                                           : '',
                engTurboExhTempLKill:  wo.unitReadings.engTurboExhTempLKill
                                           ? wo.unitReadings.engTurboExhTempLKill
                                           : '',
                rpm:                   wo.unitReadings.rpm,
                engIgnitionTiming:     wo.unitReadings.engIgnitionTiming
                                           ? wo.unitReadings.engIgnitionTiming
                                           : '',
                engVacuumBoostR:       wo.unitReadings.engVacuumBoostR
                                           ? wo.unitReadings.engVacuumBoostR
                                           : '',
                engVacuumBoostRKill:   wo.unitReadings.engVacuumBoostRKill
                                           ? wo.unitReadings.engVacuumBoostRKill
                                           : '',
                engVacuumBoostL:       wo.unitReadings.engVacuumBoostL
                                           ? wo.unitReadings.engVacuumBoostL
                                           : '',
                engVacuumBoostLKill:   wo.unitReadings.engVacuumBoostLKill
                                           ? wo.unitReadings.engVacuumBoostLKill
                                           : '',
                engManifoldTempR:      wo.unitReadings.engManifoldTempR
                                           ? wo.unitReadings.engManifoldTempR
                                           : '',
                engManifoldTempRKill:  wo.unitReadings.engManifoldTempRKill
                                           ? wo.unitReadings.engManifoldTempRKill
                                           : '',
                engManifoldTempL:      wo.unitReadings.engManifoldTempL
                                           ? wo.unitReadings.engManifoldTempL
                                           : '',
                engManifoldTempLKill:  wo.unitReadings.engManifoldTempLKill
                                           ? wo.unitReadings.engManifoldTempLKill
                                           : '',
                engineManifoldVac:     wo.unitReadings.engineManifoldVac,
                // Compressor
                compressorModel:       wo.unitReadings.compressorModel
                                           ? wo.unitReadings.compressorModel
                                           : '',
                compressorSerial:      wo.unitReadings.compressorSerial,
                suctionPressure:       wo.unitReadings.suctionPressure,
                compInterPress1:       wo.unitReadings.compInterPress1
                                           ? wo.unitReadings.compInterPress1
                                           : '',
                compInterPress1Low:    wo.unitReadings.compInterPress1Low
                                           ? wo.unitReadings.compInterPress1Low
                                           : '',
                compInterPress1High:   wo.unitReadings.compInterPress1High
                                           ? wo.unitReadings.compInterPress1High
                                           : '',
                compInterPress2:       wo.unitReadings.compInterPress2
                                           ? wo.unitReadings.compInterPress2
                                           : '',
                compInterPress2Low:    wo.unitReadings.compInterPress2Low
                                           ? wo.unitReadings.compInterPress2Low
                                           : '',
                compInterPress2High:   wo.unitReadings.compInterPress2High
                                           ? wo.unitReadings.compInterPress2High
                                           : '',
                compInterPress3:       wo.unitReadings.compInterPress3
                                           ? wo.unitReadings.compInterPress3
                                           : '',
                compInterPress3Low:    wo.unitReadings.compInterPress3Low
                                           ? wo.unitReadings.compInterPress3Low
                                           : '',
                compInterPress3High:   wo.unitReadings.compInterPress3High
                                           ? wo.unitReadings.compInterPress3High
                                           : '',
                dischargePressure:     wo.unitReadings.dischargePressure
                                           ? wo.unitReadings.dischargePressure
                                           : '',
                dischargeTemp1:        wo.unitReadings.dischargeTemp1
                                           ? wo.unitReadings.dischargeTemp1
                                           : '',
                dischargeTemp2:        wo.unitReadings.dischargeTemp2
                                           ? wo.unitReadings.dischargeTemp2
                                           : '',
                dischargeStg1Temp:     wo.unitReadings.dischargeStg1Temp
                                           ? wo.unitReadings.dischargeStg1Temp
                                           : '',
                // !
                dischargeStg1TempKill: wo.unitReadings.dischargeStg1TempKill
                                           ? wo.unitReadings.dischargeStg1TempKill
                                           : '',
                dischargeStg2Temp:     wo.unitReadings.dischargeStg2Temp
                                           ? wo.unitReadings.dischargeStg2Temp
                                           : '',
                dischargeStg2TempKill: wo.unitReadings.dischargeStg2TempKill
                                           ? wo.unitReadings.dischargeStg2TempKill
                                           : '',
                dischargeStg3Temp:     wo.unitReadings.dischargeStg3Temp
                                           ? wo.unitReadings.dischargeStg3Temp
                                           : '',
                dischargeStg3TempKill: wo.unitReadings.dischargeStg3TempKill
                                           ? wo.unitReadings.dischargeStg3TempKill
                                           : '',
                dischargeStg4Temp:     wo.unitReadings.dischargeStg4Temp
                                           ? wo.unitReadings.dischargeStg4Temp
                                           : '',
                dischargeStg4TempKill: wo.unitReadings.dischargeStg4TempKill
                                           ? wo.unitReadings.dischargeStg4TempKill
                                           : '',
                compressorOilPressure: wo.unitReadings.compressorOilPressure
                                           ? wo.unitReadings.compressorOilPressure
                                           : '',
                compOilPressKill:      wo.unitReadings.compOilPressKill
                                           ? wo.unitReadings.compOilPressKill
                                           : '',
                compOilTemp:           wo.unitReadings.compOilTemp
                                           ? wo.unitReadings.compOilTemp
                                           : '',
                compOilTempKill:       wo.unitReadings.compOilTempKill
                                           ? wo.unitReadings.compOilTempKill
                                           : '',
                compDiffPCFilter:      wo.unitReadings.compDiffPCFilter
                                           ? wo.unitReadings.compDiffPCFilter
                                           : '',
                compDiffPCFilterKill:  wo.unitReadings.compDiffPCFilterKill
                                           ? wo.unitReadings.compDiffPCFilterKill
                                           : '',
                flowMCF:               wo.unitReadings.flowMCF,

                // new Serial #s
                newCompressorSerial: wo.newCompressorSerial,
                newEngineSerial:     wo.newEngineSerial,

                //emission readings
                afrmvTarget:             wo.emissionsReadings.afrmvTarget !== null
                                             ? wo.emissionsReadings.afrmvTarget
                                             : '0',
                catalystTempPre:         wo.emissionsReadings.catalystTempPre !== null
                                             ? wo.emissionsReadings.catalystTempPre
                                             : '0',
                catalystTempPreCatKill:  wo.emissionsReadings.catalystTempPreCatKill
                                             ? wo.emissionsReadings.catalystTempPreCatKill
                                             : '',
                catalystTempPost:        wo.emissionsReadings.catalystTempPost !== null
                                             ? wo.emissionsReadings.catalystTempPost
                                             : '0',
                catalystTempPostCatKill: wo.emissionsReadings.catalystTempPostCatKill
                                             ? wo.emissionsReadings.catalystTempPostCatKill
                                             : '',
                // remove permitNumber
                permitNumber:            wo.emissionsReadings.permitNumber !== null
                                             ? wo.emissionsReadings.permitNumber
                                             : '0',
                afrMake:                 wo.emissionsReadings.afrMake
                                             ? wo.emissionsReadings.afrMake
                                             : '',
                afrModel:                wo.emissionsReadings.afrModel
                                             ? wo.emissionsReadings.afrModel
                                             : '',
                afrSN:                   wo.emissionsReadings.afrSN
                                             ? wo.emissionsReadings.afrSN
                                             : '',
                EICSCPUSoftware:         wo.emissionsReadings.EICSCPUSoftware
                                             ? wo.emissionsReadings.EICSCPUSoftware
                                             : '',
                EICSDisplaySoftware:     wo.emissionsReadings.EICSDisplaySoftware
                                             ? wo.emissionsReadings.EICSDisplaySoftware
                                             : '',
                catalystHousingSN:       wo.emissionsReadings.catalystHousingSN
                                             ? wo.emissionsReadings.catalystHousingSN
                                             : '',
                catalystHousingMake:     wo.emissionsReadings.catalystHousingMake
                                             ? wo.emissionsReadings.catalystHousingMake
                                             : '',
                catalystHousingModel:    wo.emissionsReadings.catalystHousingModel
                                             ? wo.emissionsReadings.catalystHousingModel
                                             : '',
                catalystElementMake:     wo.emissionsReadings.catalystElementMake
                                             ? wo.emissionsReadings.catalystElementMake
                                             : '',
                catalystElementSN1:      wo.emissionsReadings.catalystElementSN1
                                             ? wo.emissionsReadings.catalystElementSN1
                                             : '',
                catalystElementSN2:      wo.emissionsReadings.catalystElementSN2
                                             ? wo.emissionsReadings.catalystElementSN2
                                             : '',
                o2Sensors:               wo.emissionsReadings.o2Sensors
                                             ? wo.emissionsReadings.o2Sensors
                                             : '',
                NOxSensor:               wo.emissionsReadings.NOxSensor
                                             ? wo.emissionsReadings.NOxSensor
                                             : '',
                testPInchesH2O:          wo.emissionsReadings.testPInchesH2O
                                             ? wo.emissionsReadings.testPInchesH2O
                                             : '',

                //comments
                repairsDescription:  wo.comments.repairsDescription,
                repairsReason:       wo.comments.repairsReason,
                calloutReason:       wo.comments.calloutReason,
                swapReason:          wo.comments.swapReason,
                transferReason:      wo.comments.transferReason,
                newsetNotes:         wo.comments.newsetNotes,
                releaseNotes:        wo.comments.releaseNotes,
                indirectNotes:       wo.comments.indirectNotes,
                timeAdjustmentNotes: wo.comments.timeAdjustmentNotes,

                //misc
                leaseNotes: wo.misc.leaseNotes,
                unitNotes:  wo.misc.unitNotes,
                latitude:   wo.geo.coordinates[1],
                longitude:  wo.geo.coordinates[0],

                //labor codes
                //basic
                safety:        WOSync.formatLaborCodeTime(wo.laborCodes.basic.safety),
                positiveAdj:   WOSync.formatLaborCodeTime(wo.laborCodes.basic.positiveAdj),
                negativeAdj:   WOSync.formatLaborCodeTime(wo.laborCodes.basic.negativeAdj),
                lunch:         WOSync.formatLaborCodeTime(wo.laborCodes.basic.lunch),
                custRelations: WOSync.formatLaborCodeTime(wo.laborCodes.basic.custRelations),
                telemetry:     WOSync.formatLaborCodeTime(wo.laborCodes.basic.telemetry),
                environmental: WOSync.formatLaborCodeTime(wo.laborCodes.basic.environmental),
                diagnostic:    WOSync.formatLaborCodeTime(wo.laborCodes.basic.diagnostic),
                serviceTravel: WOSync.formatLaborCodeTime(wo.laborCodes.basic.serviceTravel),
                optimizeUnit:  WOSync.formatLaborCodeTime(wo.laborCodes.basic.optimizeUnit),
                pm:            WOSync.formatLaborCodeTime(wo.laborCodes.basic.pm),
                washUnit:      WOSync.formatLaborCodeTime(wo.laborCodes.basic.washUnit),
                inventory:     WOSync.formatLaborCodeTime(wo.laborCodes.basic.inventory),
                training:      WOSync.formatLaborCodeTime(wo.laborCodes.basic.training),

                //engine labor codes
                oilAndFilter:          WOSync.formatLaborCodeTime(wo.laborCodes.engine.oilAndFilter),
                addOil:                WOSync.formatLaborCodeTime(wo.laborCodes.engine.addOil),
                compression:           WOSync.formatLaborCodeTime(wo.laborCodes.engine.compression),
                replaceEngine:         WOSync.formatLaborCodeTime(wo.laborCodes.engine.replaceEngine),
                replaceCylHead:        WOSync.formatLaborCodeTime(wo.laborCodes.engine.replaceCylHead),
                coolingSystem:         WOSync.formatLaborCodeTime(wo.laborCodes.engine.coolingSystem),
                fuelSystem:            WOSync.formatLaborCodeTime(wo.laborCodes.engine.fuelSystem),
                ignition:              WOSync.formatLaborCodeTime(wo.laborCodes.engine.ignition),
                starter:               WOSync.formatLaborCodeTime(wo.laborCodes.engine.starter),
                lubrication:           WOSync.formatLaborCodeTime(wo.laborCodes.engine.lubrication),
                exhaust:               WOSync.formatLaborCodeTime(wo.laborCodes.engine.exhaust),
                alternator:            WOSync.formatLaborCodeTime(wo.laborCodes.engine.alternator),
                driveOrCoupling:       WOSync.formatLaborCodeTime(wo.laborCodes.engine.driveOrCoupling),
                sealsAndGaskets:       WOSync.formatLaborCodeTime(wo.laborCodes.engine.sealsAndGaskets),
                engineVibrationSwitch: WOSync.formatLaborCodeTime(wo.laborCodes.engine.engineVibrationSwitch),
                engineBelts:           WOSync.formatLaborCodeTime(wo.laborCodes.engine.engineBelts),
                harnessRepair:         WOSync.formatLaborCodeTime(wo.laborCodes.engine.harnessRepair),
                EICSSensorActuators:   WOSync.formatLaborCodeTime(wo.laborCodes.engine.EICSSensorActuators),

                //emissions labor codes
                install:                 WOSync.formatLaborCodeTime(wo.laborCodes.emissions.install),
                test:                    WOSync.formatLaborCodeTime(wo.laborCodes.emissions.test),
                repair:                  WOSync.formatLaborCodeTime(wo.laborCodes.emissions.repair),
                o2SensorReplace:         WOSync.formatLaborCodeTime(wo.laborCodes.emissions.o2SensorReplace),
                catalystReplace:         WOSync.formatLaborCodeTime(wo.laborCodes.emissions.catalystReplace),
                emissionsThermocoupling: WOSync.formatLaborCodeTime(wo.laborCodes.emissions.emissionsThermocoupling),
                exhaustGasketReplace:    WOSync.formatLaborCodeTime(wo.laborCodes.emissions.exhaustGasketReplace),
                facilitySetup:           WOSync.formatLaborCodeTime(wo.laborCodes.emissions.facilitySetup),
                adjustment:              WOSync.formatLaborCodeTime(wo.laborCodes.emissions.adjustment),
                troubleshooting:         WOSync.formatLaborCodeTime(wo.laborCodes.emissions.troubleshooting),
                standBy:                 WOSync.formatLaborCodeTime(wo.laborCodes.emissions.standBy),

                //panel labor codes
                panel:           WOSync.formatLaborCodeTime(wo.laborCodes.panel.panel),
                electrical:      WOSync.formatLaborCodeTime(wo.laborCodes.panel.electrical),
                wiring:          WOSync.formatLaborCodeTime(wo.laborCodes.panel.wiring),
                conduit:         WOSync.formatLaborCodeTime(wo.laborCodes.panel.conduit),
                gauges:          WOSync.formatLaborCodeTime(wo.laborCodes.panel.gauges),
                panelDampners:   WOSync.formatLaborCodeTime(wo.laborCodes.panel.panelDampners),
                tubing:          WOSync.formatLaborCodeTime(wo.laborCodes.panel.tubing),
                programming:     WOSync.formatLaborCodeTime(wo.laborCodes.panel.programming),
                annuciator:      WOSync.formatLaborCodeTime(wo.laborCodes.panel.annuciator),
                safetyShutdowns: WOSync.formatLaborCodeTime(wo.laborCodes.panel.safetyShutdowns),

                //compressor labor codes
                inspect:                   WOSync.formatLaborCodeTime(wo.laborCodes.compressor.inspect),
                replace:                   WOSync.formatLaborCodeTime(wo.laborCodes.compressor.replace),
                compressorAddOil:          WOSync.formatLaborCodeTime(wo.laborCodes.compressor.addOil),
                lubePump:                  WOSync.formatLaborCodeTime(wo.laborCodes.compressor.lubePump),
                valves:                    WOSync.formatLaborCodeTime(wo.laborCodes.compressor.valves),
                alignment:                 WOSync.formatLaborCodeTime(wo.laborCodes.compressor.alignment),
                piston:                    WOSync.formatLaborCodeTime(wo.laborCodes.compressor.piston),
                packing:                   WOSync.formatLaborCodeTime(wo.laborCodes.compressor.packing),
                compressorThermocouples:   WOSync.formatLaborCodeTime(wo.laborCodes.compressor.compressorThermocouples),
                noFlowSwitch:              WOSync.formatLaborCodeTime(wo.laborCodes.compressor.noFlowSwitch),
                overhaul:                  WOSync.formatLaborCodeTime(wo.laborCodes.compressor.overhaul),
                compressorVibrationSwitch: WOSync.formatLaborCodeTime(wo.laborCodes.compressor.compressorVibrationSwitch),

                //cooler labor codes
                cooling:               WOSync.formatLaborCodeTime(wo.laborCodes.cooler.cooling),
                coolTubeRepair:        WOSync.formatLaborCodeTime(wo.laborCodes.cooler.coolTubeRepair),
                leakTesting:           WOSync.formatLaborCodeTime(wo.laborCodes.cooler.leakTesting),
                pluggingCoolerTube:    WOSync.formatLaborCodeTime(wo.laborCodes.cooler.pluggingCoolerTube),
                flushCooler:           WOSync.formatLaborCodeTime(wo.laborCodes.cooler.flushCooler),
                washCooler:            WOSync.formatLaborCodeTime(wo.laborCodes.cooler.washCooler),
                coolerBelts:           WOSync.formatLaborCodeTime(wo.laborCodes.cooler.coolerBelts),
                shaftBearing:          WOSync.formatLaborCodeTime(wo.laborCodes.cooler.shaftBearing),
                idlerBearing:          WOSync.formatLaborCodeTime(wo.laborCodes.cooler.idlerBearing),
                fan:                   WOSync.formatLaborCodeTime(wo.laborCodes.cooler.fan),
                shivePulley:           WOSync.formatLaborCodeTime(wo.laborCodes.cooler.shivePulley),
                coolerVibrationSwitch: WOSync.formatLaborCodeTime(wo.laborCodes.cooler.coolerVibrationSwitch),

                //vessel labor codes
                dumpControl:      WOSync.formatLaborCodeTime(wo.laborCodes.vessel.dumpControl),
                reliefValve:      WOSync.formatLaborCodeTime(wo.laborCodes.vessel.reliefValve),
                suctionValve:     WOSync.formatLaborCodeTime(wo.laborCodes.vessel.suctionValve),
                dumpValve:        WOSync.formatLaborCodeTime(wo.laborCodes.vessel.dumpValve),
                piping:           WOSync.formatLaborCodeTime(wo.laborCodes.vessel.piping),
                screenWitchesHat: WOSync.formatLaborCodeTime(wo.laborCodes.vessel.screenWitchesHat),
                vesselDampners:   WOSync.formatLaborCodeTime(wo.laborCodes.vessel.vesselDampners),

                //parts
                parts: wo.parts,
            }
        } catch (e) {
            log.error({
                error: e.message,
                stack: e.stack,
            }, 'Error occured while formating workorder for netsuite')
            throw new Error(e)
        }
    }

    /**
     * Return an array Matrix
     * [
     *  [ get user based on Wo techIDs. usually only 1 ]
     *  [ Units based on _id of units in incoing WOs. usually 1 ]
     *  [ Swap Unit if swap WO ]
     *  [ Check if duplicate Wo if so return here ]
     * ]
     * @returns {*}
     */
    woCreateGetContentChecksum () {
        return Promise.all([
            Users.find({
                username: {
                    // get every User with that techId
                    $in: _.map(this.data, 'techId'),
                },
            }),
            Units.find({
                _id: {
                    // get every Unit with that Id - should be 1
                    $in: this.data.map((obj) => {
                        if (obj.hasOwnProperty('unit') && obj !== null && obj !== undefined) {
                            if (obj.unit !== null && obj.unit !== undefined && obj.unit !== '') {
                                return typeof obj.unit === 'string'
                                    ? ObjectId(obj.unit)
                                    : obj.unit
                            } else {
                                return null
                            }
                        } else {
                            return null
                        }
                    }),
                },
            }),
            Units.find({
                number: {
                    $in: this.data.map((obj) => {
                        if (obj.unitChangeInfo.swapUnitNumber !== '') {
                            return obj.unitChangeInfo.swapUnitNumber
                        } else {
                            return null
                        }
                    }),
                },
            }),
            this.WorkOrders.find({
                timeSubmitted: {
                    $in: this.data.reduce((acc, o) => {
                        if (o.hasOwnProperty('timeSubmitted')) {
                            return acc.concat(o.timeSubmitted)
                        } else {
                            return acc
                        }
                    }, []),
                },
                techId:        {
                    $in: this.data.reduce((acc, o) => {
                        if (o.hasOwnProperty('techId')) {
                            return acc.concat(o.techId)
                        } else {
                            return acc
                        }
                    }, []),
                },
            }),
        ])
    }

    /**
     * Return an array Matrix
     * [
     *  [ Units based on _id of units in incoing WOs ]
     *  [ Swap Unit if swap WO ]
     * ]
     * @param wokorders
     */
    woCreateGetContentChecksumReTry (workorders) {
        return Promise.all([
            Units.find({
                number: {
                    $in: workorders.reduce((acc, cur) => {
                        if (cur.unitNumber !== '' && cur.unitNumber !== null && cur.unitNumber !==
                            undefined) {
                            if (acc.indexOf(cur.unitNumber) === -1) {
                                return acc.concat(cur.unitNumber)
                            } else {
                                return acc
                            }
                        } else {
                            return acc
                        }
                    }, []),
                },
            }),
            Units.find({
                number: {
                    $in: workorders.reduce((acc, cur) => {
                        if (cur.unitChangeInfo.swapUnitNumber !== '' &&
                            cur.unitChangeInfo.swapUnitNumber !== null &&
                            cur.unitChangeInfo.swapUnitNumber !== undefined) {
                            if (acc.indexOf(cur.unitChangeInfo.swapUnitNumber) === -1) {
                                return acc.concat(cur.unitChangeInfo.swapUnitNumber)
                            } else {
                                return acc
                            }
                        } else {
                            return acc
                        }
                    }),
                },
            }),
        ])
    }

    /**
     * Follow method of woCreateGetContentChecksum
     * Only used on Create but is useful to keep WO managers
     * page clean
     * @param checkSumReturnArrayMatrix
     * @returns {Promise<any>}
     */
    checkIsSyncStatus (checkSumReturnArrayMatrix) {
        return new Promise((resolve, reject) => {
            try {
                const techDocs = checkSumReturnArrayMatrix[0]
                const unitDocs = checkSumReturnArrayMatrix[1]
                const swapUnits = checkSumReturnArrayMatrix[2]
                const FoundWOs = checkSumReturnArrayMatrix[3]
                this.newArray = this.data.reduce((acc, doc) => {
                    if (isEmpty(doc)) {
                        return acc
                    }
                    let foundDup = {found: false}
                    FoundWOs.forEach((fDoc) => {
                        if (fDoc.timeSubmitted.toString() ===
                            new Date(doc.timeSubmitted).toString()) {
                            foundDup = {obj: fDoc, sync: false, found: true, managerSync: false}
                        }
                    })
                    // Work order was found, don't insert duplicates
                    if (foundDup.found) {
                        return acc.concat(foundDup)
                    }
                    // Pull the technician out of the array of found users with matching username
                    const tech = _.find(techDocs, (o) => doc.techId === o.username)
                    // Pull the unit from the array of found Units with that netsuite ID
                    let unit = null
                    if (doc.hasOwnProperty('unit') && doc.unit !== null) {
                        unit = _.find(unitDocs, (o) => `${o._id}` === `${doc.unit}`)
                    }
                    // If WO is swap get swap unit as well
                    let swapUnit = null
                    if (!isEmpty(doc.unitChangeInfo.swapUnitNumber)) {
                        swapUnit = _.find(swapUnits, (o) => `${o.number}` ===
                            `${doc.unitChangeInfo.swapUnitNumber}`)
                    }
                    // fill technician with User Id for autofill if exists
                    doc.technician = tech ? tech._id : null
                    if (unit) {
                        // only once both state and county are found will it try and
                        // do the sync procedures; set the doc.unit to the unit id
                        delete unit._id
                        // set unit snapshot to unit or swap unit depending on wo type
                        doc.unitSnapShot = !isEmpty(swapUnit) ? swapUnit : unit
                        let billable = false
                        let manualPart = false
                        // if doc is billable do not sync to netsuite
                        if (doc.billingInfo.billableToCustomer) {
                            billable = true
                        }
                        // if WO has a manual or billable part do not sync
                        if (doc.parts.length > 0) {
                            for (const part of doc.parts) {
                                if (part.isBillable) {
                                    billable = true
                                }
                                if (part.isManual) {
                                    manualPart = true
                                }
                            }
                        }

                        /**
                         * Check if all special fields of a Unit match all
                         * the corresponding fields on the work order except Geo
                         */
                        if ((doc.type !== 'Indirect' && doc.type !== 'Swap' && doc.type !==
                            'Transfer') && !billable && !manualPart) {
                            if (WOSync.compareWorkorderUnitToUnit(WOSync.getWorkOrderUnitInfo(doc), !isEmpty(swapUnit)
                                ? swapUnit
                                : unit) && WOSync.LaborCodePasses(doc)) {
                                // the doc matches 100% with the current unit
                                return acc.concat({
                                    obj:         doc,
                                    sync:        true,
                                    found:       false,
                                    managerSync: false,
                                })
                            } else {
                                // Even serial numbers did not match
                                return acc.concat({
                                    obj:         doc,
                                    sync:        false,
                                    found:       false,
                                    managerSync: false,
                                })
                            }
                        } else {
                            // is either Indirect, Swap, Transfer, Billable, or has Manual Part
                            return acc.concat({
                                obj:         doc,
                                sync:        false,
                                found:       false,
                                managerSync: false,
                            })
                        }
                    } else {
                        // no unit found
                        doc.unitSnapShot = null
                        return acc.concat({obj: doc, sync: false, found: false, managerSync: false})
                    }
                }, [])
                resolve(this.newArray)
            } catch (e) {
                console.log(e)
                resolve(this.newArray)
            }
        })
    }

    /**
     * Following method of woCreateGetContentChecksumReTry
     * Only used on retry sync
     * @param checkSumReturnArrayRetryMatrix
     * @param workorders
     * @returns {Promise<any>}
     */
    canReSync (checkSumReturnArrayRetryMatrix, workorders) {
        return new Promise((resolve, reject) => {
            const unitDocs = checkSumReturnArrayRetryMatrix[1]
            const swapUnits = checkSumReturnArrayRetryMatrix[2]

            let returnArray = []
            try {
                returnArray = workorders.reduce((acc, wo) => {
                    let unit = _.find(unitDocs, (o) => wo.unitNumber === o.number)
                    let swapUnit = null
                    if (!isEmpty(wo.unitChangeInfo.swapUnitNumber)) {
                        swapUnit = _.find(swapUnits, (o) => wo.unitChangeInfo.swapUnitNumber ===
                            o.number)
                    }
                    delete unit._id
                    wo.unitSnapShot = !isEmpty(swapUnit) ? swapUnit : unit
                    let billable = false
                    let manualPart = false
                    if (wo.billingInfo.billableToCustomer) {
                        billable = true
                    }
                    if (wo.parts.length > 0) {
                        for (const part of wo.parts) {
                            if (part.isBillable) {
                                billable = true
                            }
                            if (part.isManual) {
                                manualPart = true
                            }
                        }
                    }
                    if ((wo.type !== 'Swap' && wo.type !== 'Transfer') && !billable &&
                        !manualPart) {
                        if (WOSync.compareWorkorderUnitToUnit(WOSync.getWorkOrderUnitInfo(wo), !isEmpty(swapUnit)
                            ? swapUnit
                            : unit) && WOSync.LaborCodePasses(wo)) {
                            return acc.concat({
                                obj:  wo,
                                sync: true,
                            })
                        } else {
                            return acc.concat({
                                obj:  wo,
                                sync: false,
                            })
                        }
                    } else {
                        return acc.concat({
                            obj:  wo,
                            sync: false,
                        })
                    }
                }, [])
                resolve(returnArray)
            } catch (e) {
                return reject(e)
            }
        })
    }

    tryReSyncWOs (toSyncObjects) {
        return new Promise((resolve, reject) => {
            Promise.all(toSyncObjects.reduce((acc, obj) => {
                       if (obj.sync) {
                           const syncDoc = obj.obj
                           if (process.env.NODE_ENV === undefined ||
                               process.env.NODE_ENV === 'test') {
                               return acc.concat(new Promise((res) => res(syncDoc)))
                           } else {
                               return acc.concat(this.ReTryAutoSyncToNetsuite(syncDoc))
                           }
                       } else {
                           return acc
                       }
                   }, []))
                   .then(resolve)
                   .catch(reject)
        })
    }

    updateDocAfterSync (doc) {
        return new Promise((resolve, reject) => {
            console.log('update after sync')
            // if synced
            const now = new Date()
            if (!isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                doc.timeSynced = now
                doc.syncedBy = doc.techId
            } else if (type === 'Indirect') {
                doc.timeSynced = now
                doc.syncedBy = doc.techId
            }
            if (isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                doc.timeSynced = null
                doc.syncedBy = null
                doc.netsuiteId = ''
                doc.netsuiteSyned = false
            }
            // still auto approve
            doc.updated_at = now
            doc.timeApproved = now
            doc.managerApproved = true
            doc.approvedBy = doc.techId
            this.WorkOrders.findByIdAndUpdate(doc._id, doc,
                {safe: false, new: true})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    ReTryAutoSyncToNetsuite (doc) {
        return new Promise((resolve, reject) => {
            return WOSync.syncToNetsuite(doc)
                         .then(this.updateDocAfterSync)
                         .then(resolve)
                         .catch(reject)
        })
    }

    /**
     * Follow up of checkIsSyncStatus
     * This takes those to sync objects and syncs the WOs
     * that need to sync and inserts all
     * @param toSyncObjects
     * @returns {Promise|*|Promise.ES6}
     */
    insertIncomingWOs (toSyncObjects) {
        let insertObjects = []
        if (!isEmpty(toSyncObjects)) {
            insertObjects = toSyncObjects.reduce((acc, cur) => {
                if (cur.found === false) {
                    if (isEmpty(cur.obj)) {
                        return acc
                    } else {
                        return acc.concat(cur.obj)
                    }
                } else {
                    return acc
                }
            }, [])
            insertObjects = rmArrObjDups(insertObjects, 'timeSubmitted')
            if (isEmpty(insertObjects)) {
                return new Promise((res, rej) => res([]))
            } else {
                return this.WorkOrders.insertMany(insertObjects)
            }
        } else {
            return new Promise((res, rej) => res([]))
        }
    }

    /**
     * Follow up method of insertIncomingWOs
     * @param toSyncDocumentObject
     * @returns {*}
     */
    syncSubmittedWOs (toSyncDocumentObject) {
        const promises = []
        this.newArray.forEach((item) => {
            // for duplicate items
            if (item.found) {
                // return the found object because it has already been
                // synced.
                promises.push(new Promise((res) => res(item.obj)))
            } else {
                // for items that were new
                toSyncDocumentObject.forEach((document) => {
                    if ((document.timeSubmitted.toString() ===
                        new Date(item.obj.timeSubmitted).toString()) &&
                        (item.found === false)) {
                        if (item.sync) {
                            const SyncDoc = item.obj
                            SyncDoc._id = document._id
                                ? document._id
                                : ''
                            SyncDoc.id = document.id ? document.id : ''
                            // prevent from submitting items.length *
                            // docs.length
                            item.found = true
                            // for testing
                            if (process.env.NODE_ENV === undefined ||
                                process.env.NODE_ENV === 'test') {
                                promises.push(new Promise((res) => res(document)))
                            } else {
                                promises.push(this.AutoSyncToNetsuite(SyncDoc))
                            }
                        } else if (item.managerSync) {
                            // make manager approved.
                            const updateDoc = item.obj
                            updateDoc.timeApproved = new Date()
                            updateDoc.managerApproved = true
                            updateDoc.approvedBy = updateDoc.techId
                            promises.push(this.WorkOrders.find({
                                                  techId:        updateDoc.techId,
                                                  timeSubmitted: updateDoc.timeSubmitted,
                                                  timeCreated:   updateDoc.timeCreated,
                                              })
                                              .exec()
                                              .then((docs) => {
                                                  if (docs.length > 0) {
                                                      const doc = docs[0]
                                                      return this.WorkOrders.findByIdAndUpdate(
                                                          doc._id, updateDoc,
                                                          {safe: false, new: true})
                                                                 .exec()
                                                  } else {
                                                      return new Promise(
                                                          (res) => res(document))
                                                  }
                                              }),
                            )
                        } else {
                            item.found = true
                            promises.push(
                                new Promise((res) => res(document)))
                        }
                    }
                })
            }
        })
        return Promise.all(promises)
    }

    AutoSyncToNetsuite (data) {
        return new Promise((resolve, reject) => {
            this.WorkOrders.findById(data.id)
                .exec()
                .then(WOSync.syncToNetsuite)
                .then(this.updateDocAfterSync)
                .then(resolve)
                .catch(reject)
        })
    }

    syncWOs () {
        return new Promise((resolve, reject) => {
            let workOrders = []
            this.WorkOrders.find({
                    netsuiteSyned: false,
                    type:          {$ne: 'Indirect'},
                    netsuiteId:    '',
                })
                .exec()
                .then((res) => {
                    workOrders = res
                    return this.woCreateGetContentChecksumReTry(res)
                })
                .then((res) => {
                    return this.canReSync(res, workOrders)
                })
                .then(this.tryReSyncWOs)
                .then(resolve)
                .catch(reject)
        })
    }
}

module.exports = WOSync
