"use strict";
const { isEmpty, rmArrObjDups } = require("tedb-utils");
const ObjectId = require("mongoose").Types.ObjectId;
const Customers = require("../models/customer");
const Units = require("../models/unit");
const _ = require("lodash");
const TBA = require("./tokenBasedAuthentication");
const ClientError = require("../errors/client");
const NetsuiteError = require("../errors/netsuite");
const log = require("./logger");
const GmailMailer = require("../helpers/email_helper");

class WOSync {
    constructor(WorkOrders, data, newArray) {
        // this.url = 'https://4086435.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1'
        this.WorkOrders = WorkOrders;
        this.data = data;
        this.newArray = newArray;
        // create WO/Sync
        this.woCreateGetContentChecksum = this.woCreateGetContentChecksum.bind(
            this
        );
        this.checkIsSyncStatus = this.checkIsSyncStatus.bind(this);
        this.insertIncomingWOs = this.insertIncomingWOs.bind(this);
        // this.syncSubmittedWOs = this.syncSubmittedWOs.bind(this)
        this.setUpInsertedWOsForSync = this.setUpInsertedWOsForSync.bind(this);
        // this.AutoSyncToNetsuite = this.AutoSyncToNetsuite.bind(this)
        this.setCustomerAndFormatOnInsert = this.setCustomerAndFormatOnInsert.bind(
            this
        );

        // re-try WO Sync
        this.syncWOs = this.syncWOs.bind(this);
        this.woCreateGetContentChecksumReTry = this.woCreateGetContentChecksumReTry.bind(
            this
        );
        this.canReSync = this.canReSync.bind(this);
        this.setUpWOsForSync = this.setUpWOsForSync.bind(this);
        // this.ReTryAutoSyncToNetsuite = this.ReTryAutoSyncToNetsuite.bind(this)
        // this.ResyncToNetsuite = this.ResyncToNetsuite.bind(this)
        this.emailSyncs = this.emailSyncs.bind(this);

        this.setCustomerAndFormat = this.setCustomerAndFormat.bind(this);
        this.ReTryAutoSyncAllToNetsuite = this.ReTryAutoSyncAllToNetsuite.bind(
            this
        );
        this.formatObjsToUpdateObjsAndUpdate = this.formatObjsToUpdateObjsAndUpdate.bind(
            this
        );

        // both
        this.updateDocAfterSync = this.updateDocAfterSync.bind(this);
        this.emailOrionAlertsError = this.emailOrionAlertsError.bind(this);
    }

    /**
     * Takes the given customername from the work order
     * and returns an object with the key nesuiteId.
     * so now in netsuite Sync the netsuiteId is sent to netsuite
     * for the customer
     *
     * - Also used in wo_adminCreateSync.js
     * @param wo
     * @returns {Promise<any>}
     */
    static populateCustomerByName(wo) {
        return new Promise((resolve, reject) => {
            Customers.findOne({ name: wo.header.customerName })
                .lean()
                .exec()
                .then((cust) => {
                    log.info({ customer: cust }, "Customer Found");
                    wo.customer = cust || null;
                    if (wo.customer === null) {
                        wo.customer = { netsuiteId: "" };
                    }

                    resolve(wo);
                })
                .catch((err) => {
                    log.info("failed ot populate customername");
                    reject(err);
                });
        });
    }

    /**
     * Netsuite Sync made specifically for work order
     * syncing after updates. and admin syncs
     * @param woDoc
     * @returns {Promise<any>}
     */
    static syncToNetsuite(woDoc) {
        return new Promise((resolve, reject) => {
            if (woDoc.type === "Indirect") {
                return reject(
                    new ClientError(
                        "Indirect WorkOrders will not be synced to Nestuite. WO Saved"
                    )
                );
            }

            let nswo = null;

            async function getCustomer() {
                const wo = await WOSync.populateCustomerByName(woDoc);
                nswo = WOSync.netSuiteFormat(wo);
                let backoff = 200;
                let retries = 8;

               // console.log(nswo);

                const makeCall = (repeats) => {
                    const workOrderLink = new TBA(
                        "https://4086435.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1"
                    );

                    workOrderLink.postRequest(
                        nswo,
                        (body) => {
                            if (!isEmpty(body) && !isEmpty(body.error)) {
                                const error_message =
                                    body.error.code || JSON.stringify(body);
                                if (
                                    [
                                        "ECONNRESET",
                                        "ESOCKETTIMEDOUT",
                                        "ETIMEDOUT",
                                        "SSS_REQUEST_LIMIT_EXCEEDED",
                                    ].indexOf(error_message) !== -1
                                ) {
                                    if (repeats > 0) {
                                        if (backoff && retries) {
                                            setTimeout(() => {
                                                makeCall(repeats - 1);
                                            }, backoff * (retries - (repeats + 1)));
                                        } else {
                                            makeCall(repeats - 1);
                                        }
                                    } else {
                                        woDoc.timeSynced = null;
                                        woDoc.syncedBy = "";
                                        woDoc.netsuiteId = "";
                                        woDoc.netsuiteSyned = false;
                                        log.error(
                                            `wodoc did not sync Error on repeat > 0 ${
                                                woDoc._id
                                            } \n Error message: ${JSON.stringify(
                                                body,
                                                null,
                                                2
                                            )}`
                                        );
                                        resolve(woDoc);
                                    }
                                } else {
                                    woDoc.timeSynced = null;
                                    woDoc.syncedBy = "";
                                    woDoc.netsuiteId = "";
                                    woDoc.netsuiteSyned = false;
                                    log.error(
                                        `wodoc did not sync error on error_message !== -1 ${
                                            woDoc._id
                                        } \n Error message: ${JSON.stringify(
                                            body,
                                            null,
                                            2
                                        )}`
                                    );
                                    resolve(woDoc);
                                }
                            } else {
                                if (!body.nswoid) {
                                    woDoc.timeSynced = null;
                                    woDoc.syncedBy = "";
                                    woDoc.netsuiteId = "";
                                    woDoc.netsuiteSyned = false;
                                } else {
                                    woDoc.netsuiteId = body.nswoid;
                                    woDoc.netsuiteSyned = true;
                                }
                                if (woDoc.netsuiteSyned === false) {
                                    log.error(
                                        `wodoc did not sync ${woDoc._id}`
                                    );
                                }
                                resolve(woDoc);
                            }
                        },
                        (error) => {
                            const error_message =
                                error.error.code || JSON.stringify(error);
                            log.error(JSON.stringify(error, null, 2));
                            if (
                                [
                                    "ECONNRESET",
                                    "ESOCKETTIMEDOUT",
                                    "ETIMEDOUT",
                                    "SSS_REQUEST_LIMIT_EXCEEDED",
                                ].indexOf(error_message) !== -1
                            ) {
                                if (repeats > 0) {
                                    if (backoff && retries) {
                                        setTimeout(() => {
                                            makeCall(repeats - 1);
                                        }, backoff * (retries - (repeats + 1)));
                                    } else {
                                        makeCall(repeats - 1);
                                    }
                                } else {
                                    return reject(
                                        new NetsuiteError(`${error}`)
                                    );
                                }
                            } else {
                                return reject(new NetsuiteError(`${error}`));
                            }
                        }
                    );
                };

                makeCall(retries);
            }

            let eh = getCustomer();
        });
    }

    static LaborCodePasses(wo) {
        const {
            laborCodes,
            header: { startMileage, endMileage },
        } = wo;

        const laborCs = Object.keys(laborCodes);
        let totalMinutes = 0;
        let TravelHours = 0;
        laborCs.forEach((item) => {
            const lcChild = Object.keys(laborCodes[item]);
            lcChild.forEach((child) => {
                if (
                    laborCodes[item][child].text !==
                        "Negative Time Adjustment" &&
                    laborCodes[item][child].text !==
                        "Positive Time Adjustment" &&
                    laborCodes[item][child].text !== "Lunch"
                ) {
                    totalMinutes += +laborCodes[item][child].hours * 60;
                    totalMinutes += +laborCodes[item][child].minutes;
                }
                if (laborCodes[item][child].text === "Service Travel") {
                    TravelHours += +laborCodes[item][child].hours;
                    TravelHours += +laborCodes[item][child].minutes / 60;
                }
            });
        });
        const totalHours = Math.floor(totalMinutes / 60);
        const distance = +endMileage - +startMileage;
        // don't let work orders over 8 hours auto sync
        if (totalHours > 10) {
            return false;
        }
        // block if distance but no service travel
        /*if (TravelHours === 0 && distance > 0) {
            return false
        }
        return true*/
        return true;
        //return !(TravelHours === 0 && distance > 0)
    }

    /**
     * Compare the incoming work order unit information to an actual
     * unit.
     * @param wo
     * @param unit
     * @returns {boolean}
     */
    static compareWorkorderUnitToUnit(wo, unit) {
        let state;
        let county;
        if (unit.state !== null) {
            state = unit.state.name;
        } else {
            state = "";
        }
        if (unit.county !== null) {
            county = unit.county.name;
        } else {
            county = "";
        }
        return (
            wo.number.toUpperCase() === unit.number.toUpperCase() &&
            wo.state.toUpperCase() === state.toUpperCase() &&
            wo.county.toUpperCase() === county.toUpperCase() &&
            wo.locationName.toUpperCase() === unit.locationName.toUpperCase() &&
            wo.customerName.toUpperCase() === unit.customerName.toUpperCase() &&
            wo.engineSerial.toUpperCase() === unit.engineSerial.toUpperCase() &&
            wo.compressorSerial.toUpperCase() ===
                unit.compressorSerial.toUpperCase()
        );
    }

    /**
     * Used to get the wo unit information of just the serial numbers
     * everything else except coordinates
     * @param wo
     * @returns {{engineSerial: (unitReadings.engineSerial|{default, type}|string), number: *,
     *   locationName: *, compressorSerial: (unitReadings.compressorSerial|{default, type}|string),
     *   county: *, state: *, customerName: *}}
     */
    static getWorkOrderUnitInfo(wo) {
        return {
            engineSerial: wo.unitReadings.engineSerial,
            compressorSerial: wo.unitReadings.compressorSerial,
            number: wo.unitNumber,
            state: wo.header.state,
            county: wo.header.county,
            customerName: wo.header.customerName,
            locationName: wo.header.leaseName,
        };
    }

    static formatLaborCodeTime(lc) {
        if (lc) {
            const hours = (lc.minutes / 60 + lc.hours).toFixed(2);
            return hours.toString();
        } else {
            return "";
        }
    }

    static netSuiteFormat(wo) {
        log.info("in netsuiteFormat");
        log.trace("Hour Reading: " + wo.unitReadings.hourReading);
        try {
            return {
                id: wo._id,
                //main
                dummy: "dummy",
                isPM: wo.pm ? "T" : "F", // is PM1
                pm2: wo.pm2 ? "T" : "F",
                pm3: wo.pm3 ? "T" : "F",
                pm4: wo.pm4 ? "T" : "F",
                pm5: wo.pm5 ? "T" : "F",

                techId: wo.techId,
                truckId: wo.truckId,
                truckNSID: wo.truckNSID,
                totalMileage: wo.totalMileage ? wo.totalMileage : 0,
                swap: wo.type === "Swap" ? "T" : "F",
                transfer: wo.type === "Transfer" ? "T" : "F",
                troubleCall: wo.type === "Trouble Call" ? "T" : "F",
                newSet: wo.type === "New Set" ? "T" : "F",
                release: wo.type === "Release" ? "T" : "F",
                correctiveMaintenance: wo.type === "Corrective" ? "T" : "F",
                atShop: wo.atShop ? "T" : "F",

                timeSubmitted:
                    typeof wo.timeSubmitted === "object"
                        ? wo.timeSubmitted.toISOString()
                        : wo.timeSubmitted,
                woStarted:
                    typeof wo.timeStarted === "object"
                        ? wo.timeStarted.toISOString()
                        : wo.timeStarted,
                woEnded:
                    typeof wo.timeSubmitted === "object"
                        ? wo.timeSubmitted.toISOString()
                        : wo.timeSubmitted,

                //header
                unitNumber:
                    wo.type === "Swap"
                        ? wo.unitChangeInfo.swapUnitNSID
                        : wo.header.unitNumberNSID,
                customerName: wo.customer.netsuiteId,
                contactName: wo.header.contactName,
                timeOfCallout: wo.header.timeOfCallout
                    ? wo.header.timeOfCallout
                    : null,
                killCode:
                    wo.header.killCode !== undefined &&
                    wo.header.killCode !== null
                        ? wo.header.killCode.toString()
                        : "",
                county: wo.header.county,
                state: wo.header.state,
                leaseName: wo.header.leaseName,
                rideAlong: wo.header.rideAlong,
                startMileage: wo.header.startMileage,
                endMileage: wo.header.endMileage,
                applicationType: wo.header.applicationtype,
                // unitChangeInfo push transfer/swap/release info
                releaseDestination: wo.unitChangeInfo.releaseDestination
                    ? wo.unitChangeInfo.releaseDestination
                    : "", // for release only is a WH
                transferLease: wo.unitChangeInfo.transferLease
                    ? wo.unitChangeInfo.transferLease
                    : "", //
                transferCounty: wo.unitChangeInfo.transferCounty
                    ? wo.unitChangeInfo.transferCounty
                    : "",
                transferState: wo.unitChangeInfo.transferState
                    ? wo.unitChangeInfo.transferState
                    : "",
                swapDestination: wo.unitChangeInfo.swapDestination
                    ? wo.unitChangeInfo.swapDestination
                    : "", // a WH
                swapUnitNSID: wo.unitChangeInfo.swapUnitNSID
                    ? wo.unitChangeInfo.swapUnitNSID
                    : "",

                assetType: wo.assetType,

                isUnitRunningOnDeparture: wo.misc.isUnitRunningOnDeparture
                    ? "T"
                    : "F",

                //unit ownership
                isCustomerUnit: wo.unitOwnership.isCustomerUnit ? "T" : "F",
                isRental: wo.unitOwnership.isRental ? "T" : "F",

                //billing info
                billableToCustomer: wo.billingInfo.billableToCustomer
                    ? "T"
                    : "F",
                warrantyWork: wo.billingInfo.warrantyWork ? "T" : "F",
                AFE: wo.billingInfo.AFE ? "T" : "F",
                AFENumber: wo.billingInfo.AFENumber,

                //pm check list
                lowDischargeKill: wo.pmChecklist.killSettings.lowDischargeKill, // !
                highSuctionKill: wo.pmChecklist.killSettings.highSuctionKill, // !
                highDischargeKill:
                    wo.pmChecklist.killSettings.highDischargeKill, // !
                lowSuctionKill: wo.pmChecklist.killSettings.lowSuctionKill, // !
                highDischargeTempKill:
                    wo.pmChecklist.killSettings.highDischargeTempKill, // !

                //engine checks
                battery: wo.pmChecklist.engineChecks.battery ? "T" : "F",
                capAndRotor: wo.pmChecklist.engineChecks.capAndRotor
                    ? "T"
                    : "F",
                airFilter: wo.pmChecklist.engineChecks.airFilter ? "T" : "F",
                oilAndFilters: wo.pmChecklist.engineChecks.oilAndFilters
                    ? "T"
                    : "F",
                magPickup: wo.pmChecklist.engineChecks.magPickup ? "T" : "F",
                belts: wo.pmChecklist.engineChecks.belts ? "T" : "F",
                guardsAndBrackets: wo.pmChecklist.engineChecks.guardsAndBrackets
                    ? "T"
                    : "F",
                sparkPlugs: wo.pmChecklist.engineChecks.sparkPlugs ? "T" : "F",
                plugWires: wo.pmChecklist.engineChecks.plugWires ? "T" : "F",
                driveLine: wo.pmChecklist.engineChecks.driveLine ? "T" : "F",

                //general checks
                kills: wo.pmChecklist.generalChecks.kills ? "T" : "F",
                airHoses: wo.pmChecklist.generalChecks.airHoses ? "T" : "F",
                coolerForCracks: wo.pmChecklist.generalChecks.coolerForCracks
                    ? "T"
                    : "F",
                coolerLouverMovement: wo.pmChecklist.generalChecks
                    .coolerLouverMovement
                    ? "T"
                    : "F",
                coolerLouverCleaned: wo.pmChecklist.generalChecks
                    .coolerLouverCleaned
                    ? "T"
                    : "F",
                pressureReliefValve: wo.pmChecklist.generalChecks
                    .pressureReliefValve
                    ? "T"
                    : "F",
                scrubberDump: wo.pmChecklist.generalChecks.scrubberDump
                    ? "T"
                    : "F",
                plugInSkid: wo.pmChecklist.generalChecks.plugInSkid ? "T" : "F",
                filledDayTank: wo.pmChecklist.generalChecks.filledDayTank
                    ? "T"
                    : "F",
                fanForCracking: wo.pmChecklist.generalChecks.fanForCracking
                    ? "T"
                    : "F",
                panelWires: wo.pmChecklist.generalChecks.panelWires ? "T" : "F",
                oilPumpBelt: wo.pmChecklist.generalChecks.oilPumpBelt
                    ? "T"
                    : "F",

                fuelPressureFirstCut: wo.pmChecklist.fuelPressureFirstCut, // !
                fuelPressureSecondCut: wo.pmChecklist.fuelPressureSecondCut, // !
                fuelPressureThirdCut: wo.pmChecklist.fuelPressureThirdCut,
                visibleLeaksNotes: wo.pmChecklist.visibleLeaksNotes, // !

                //engine compression // !
                cylinder1: wo.pmChecklist.engineCompression.cylinder1,
                cylinder2: wo.pmChecklist.engineCompression.cylinder2,
                cylinder3: wo.pmChecklist.engineCompression.cylinder3,
                cylinder4: wo.pmChecklist.engineCompression.cylinder4,
                cylinder5: wo.pmChecklist.engineCompression.cylinder5,
                cylinder6: wo.pmChecklist.engineCompression.cylinder6,
                cylinder7: wo.pmChecklist.engineCompression.cylinder7,
                cylinder8: wo.pmChecklist.engineCompression.cylinder8,
                cylinder9: wo.pmChecklist.engineCompression.cylinder9,
                cylinder10: wo.pmChecklist.engineCompression.cylinder10,
                cylinder11: wo.pmChecklist.engineCompression.cylinder11,
                cylinder12: wo.pmChecklist.engineCompression.cylinder12,
                cylinder13: wo.pmChecklist.engineCompression.cylinder13,
                cylinder14: wo.pmChecklist.engineCompression.cylinder14,
                cylinder15: wo.pmChecklist.engineCompression.cylinder15,
                cylinder16: wo.pmChecklist.engineCompression.cylinder16,

                //unit readings
                // Engine
                engineModel: wo.unitReadings.engineModel,
                engineSerial: wo.unitReadings.engineSerial,
                engBattery: wo.unitReadings.engBattery
                    ? wo.unitReadings.engBattery
                    : "",
                engOilTemp: wo.unitReadings.engOilTemp
                    ? wo.unitReadings.engOilTemp
                    : "",
                engOilTempKill: wo.unitReadings.engOilTempKill
                    ? wo.unitReadings.engOilTempKill
                    : "",
                engineJWTemp: wo.unitReadings.engineJWTemp,
                engineJWTempKill: wo.unitReadings.engineJWTempKill
                    ? wo.unitReadings.engineJWTempKill
                    : "",
                engineOilPressure: wo.unitReadings.engineOilPressure,
                engOilPressureKill: wo.unitReadings.engOilPressureKill
                    ? wo.unitReadings.engOilPressureKill
                    : "",
                alternatorOutput: wo.unitReadings.alternatorOutput,
                hourReading: wo.unitReadings.hourReading,
                engAirInletTemp: wo.unitReadings.engAirInletTemp
                    ? wo.unitReadings.engAirInletTemp
                    : "",
                engAirInletTempKill: wo.unitReadings.engAirInletTempKill
                    ? wo.unitReadings.engAirInletTempKill
                    : "",
                // !
                engJWPress: wo.unitReadings.engJWPress
                    ? wo.unitReadings.engJWPress
                    : "",
                // !
                engJWPressKill: wo.unitReadings.engJWPressKill
                    ? wo.unitReadings.engJWPressKill
                    : "",
                engTurboExhTempR: wo.unitReadings.engTurboExhTempR
                    ? wo.unitReadings.engTurboExhTempR
                    : "",
                engTurboExhTempRKill: wo.unitReadings.engTurboExhTempRKill
                    ? wo.unitReadings.engTurboExhTempRKill
                    : "",
                engTurboExhTempL: wo.unitReadings.engTurboExhTempL
                    ? wo.unitReadings.engTurboExhTempL
                    : "",
                engTurboExhTempLKill: wo.unitReadings.engTurboExhTempLKill
                    ? wo.unitReadings.engTurboExhTempLKill
                    : "",
                rpm: wo.unitReadings.rpm,
                engIgnitionTiming: wo.unitReadings.engIgnitionTiming
                    ? wo.unitReadings.engIgnitionTiming
                    : "",
                engVacuumBoostR: wo.unitReadings.engVacuumBoostR
                    ? wo.unitReadings.engVacuumBoostR
                    : "",
                engVacuumBoostRKill: wo.unitReadings.engVacuumBoostRKill
                    ? wo.unitReadings.engVacuumBoostRKill
                    : "",
                engVacuumBoostL: wo.unitReadings.engVacuumBoostL
                    ? wo.unitReadings.engVacuumBoostL
                    : "",
                engVacuumBoostLKill: wo.unitReadings.engVacuumBoostLKill
                    ? wo.unitReadings.engVacuumBoostLKill
                    : "",
                engManifoldTempR: wo.unitReadings.engManifoldTempR
                    ? wo.unitReadings.engManifoldTempR
                    : "",
                engManifoldTempRKill: wo.unitReadings.engManifoldTempRKill
                    ? wo.unitReadings.engManifoldTempRKill
                    : "",
                engManifoldTempL: wo.unitReadings.engManifoldTempL
                    ? wo.unitReadings.engManifoldTempL
                    : "",
                engManifoldTempLKill: wo.unitReadings.engManifoldTempLKill
                    ? wo.unitReadings.engManifoldTempLKill
                    : "",
                engineManifoldVac: wo.unitReadings.engineManifoldVac,
                // Compressor
                compressorModel: wo.unitReadings.compressorModel
                    ? wo.unitReadings.compressorModel
                    : "",
                compressorSerial: wo.unitReadings.compressorSerial,
                suctionPressure: wo.unitReadings.suctionPressure,
                compInterPress1: wo.unitReadings.compInterPress1
                    ? wo.unitReadings.compInterPress1
                    : "",
                compInterPress1Low: wo.unitReadings.compInterPress1Low
                    ? wo.unitReadings.compInterPress1Low
                    : "",
                compInterPress1High: wo.unitReadings.compInterPress1High
                    ? wo.unitReadings.compInterPress1High
                    : "",
                compInterPress2: wo.unitReadings.compInterPress2
                    ? wo.unitReadings.compInterPress2
                    : "",
                compInterPress2Low: wo.unitReadings.compInterPress2Low
                    ? wo.unitReadings.compInterPress2Low
                    : "",
                compInterPress2High: wo.unitReadings.compInterPress2High
                    ? wo.unitReadings.compInterPress2High
                    : "",
                compInterPress3: wo.unitReadings.compInterPress3
                    ? wo.unitReadings.compInterPress3
                    : "",
                compInterPress3Low: wo.unitReadings.compInterPress3Low
                    ? wo.unitReadings.compInterPress3Low
                    : "",
                compInterPress3High: wo.unitReadings.compInterPress3High
                    ? wo.unitReadings.compInterPress3High
                    : "",
                dischargePressure: wo.unitReadings.dischargePressure
                    ? wo.unitReadings.dischargePressure
                    : "",
                dischargeTemp1: wo.unitReadings.dischargeTemp1
                    ? wo.unitReadings.dischargeTemp1
                    : "",
                dischargeTemp2: wo.unitReadings.dischargeTemp2
                    ? wo.unitReadings.dischargeTemp2
                    : "",
                dischargeStg1Temp: wo.unitReadings.dischargeStg1Temp
                    ? wo.unitReadings.dischargeStg1Temp
                    : "",
                // !
                dischargeStg1TempKill: wo.unitReadings.dischargeStg1TempKill
                    ? wo.unitReadings.dischargeStg1TempKill
                    : "",
                dischargeStg2Temp: wo.unitReadings.dischargeStg2Temp
                    ? wo.unitReadings.dischargeStg2Temp
                    : "",
                dischargeStg2TempKill: wo.unitReadings.dischargeStg2TempKill
                    ? wo.unitReadings.dischargeStg2TempKill
                    : "",
                dischargeStg3Temp: wo.unitReadings.dischargeStg3Temp
                    ? wo.unitReadings.dischargeStg3Temp
                    : "",
                dischargeStg3TempKill: wo.unitReadings.dischargeStg3TempKill
                    ? wo.unitReadings.dischargeStg3TempKill
                    : "",
                dischargeStg4Temp: wo.unitReadings.dischargeStg4Temp
                    ? wo.unitReadings.dischargeStg4Temp
                    : "",
                dischargeStg4TempKill: wo.unitReadings.dischargeStg4TempKill
                    ? wo.unitReadings.dischargeStg4TempKill
                    : "",
                compressorOilPressure: wo.unitReadings.compressorOilPressure
                    ? wo.unitReadings.compressorOilPressure
                    : "",
                compOilPressKill: wo.unitReadings.compOilPressKill
                    ? wo.unitReadings.compOilPressKill
                    : "",
                compOilTemp: wo.unitReadings.compOilTemp
                    ? wo.unitReadings.compOilTemp
                    : "",
                compOilTempKill: wo.unitReadings.compOilTempKill
                    ? wo.unitReadings.compOilTempKill
                    : "",
                compDiffPCFilter: wo.unitReadings.compDiffPCFilter
                    ? wo.unitReadings.compDiffPCFilter
                    : "",
                compDiffPCFilterKill: wo.unitReadings.compDiffPCFilterKill
                    ? wo.unitReadings.compDiffPCFilterKill
                    : "",
                lubeRate: wo.unitReadings.lubeRate
                    ? wo.unitReadings.lubeRate
                    : "",
                flowMCF: wo.unitReadings.flowMCF,

                // new Serial #s
                newCompressorSerial: wo.newCompressorSerial.toUpperCase(),
                newEngineSerial: wo.newEngineSerial.toUpperCase(),

                //emission readings
                afrmvTarget:
                    wo.emissionsReadings.afrmvTarget !== null
                        ? wo.emissionsReadings.afrmvTarget
                        : "0",
                catalystTempPre:
                    wo.emissionsReadings.catalystTempPre !== null
                        ? wo.emissionsReadings.catalystTempPre
                        : "0",
                catalystTempPreCatKill: wo.emissionsReadings
                    .catalystTempPreCatKill
                    ? wo.emissionsReadings.catalystTempPreCatKill
                    : "",
                catalystTempPost:
                    wo.emissionsReadings.catalystTempPost !== null
                        ? wo.emissionsReadings.catalystTempPost
                        : "0",
                catalystTempPostCatKill: wo.emissionsReadings
                    .catalystTempPostCatKill
                    ? wo.emissionsReadings.catalystTempPostCatKill
                    : "",
                // remove permitNumber
                permitNumber:
                    wo.emissionsReadings.permitNumber !== null
                        ? wo.emissionsReadings.permitNumber
                        : "0",
                afrMake: wo.emissionsReadings.afrMake
                    ? wo.emissionsReadings.afrMake
                    : "",
                afrModel: wo.emissionsReadings.afrModel
                    ? wo.emissionsReadings.afrModel
                    : "",
                afrSN: wo.emissionsReadings.afrSN
                    ? wo.emissionsReadings.afrSN
                    : "",
                EICSCPUSoftware: wo.emissionsReadings.EICSCPUSoftware
                    ? wo.emissionsReadings.EICSCPUSoftware
                    : "",
                EICSDisplaySoftware: wo.emissionsReadings.EICSDisplaySoftware
                    ? wo.emissionsReadings.EICSDisplaySoftware
                    : "",
                catalystHousingSN: wo.emissionsReadings.catalystHousingSN
                    ? wo.emissionsReadings.catalystHousingSN
                    : "",
                catalystHousingMake: wo.emissionsReadings.catalystHousingMake
                    ? wo.emissionsReadings.catalystHousingMake
                    : "",
                catalystHousingModel: wo.emissionsReadings.catalystHousingModel
                    ? wo.emissionsReadings.catalystHousingModel
                    : "",
                catalystElementMake: wo.emissionsReadings.catalystElementMake
                    ? wo.emissionsReadings.catalystElementMake
                    : "",
                catalystElementSN1: wo.emissionsReadings.catalystElementSN1
                    ? wo.emissionsReadings.catalystElementSN1
                    : "",
                catalystElementSN2: wo.emissionsReadings.catalystElementSN2
                    ? wo.emissionsReadings.catalystElementSN2
                    : "",
                o2Sensors: wo.emissionsReadings.o2Sensors
                    ? wo.emissionsReadings.o2Sensors
                    : "",
                NOxSensor: wo.emissionsReadings.NOxSensor
                    ? wo.emissionsReadings.NOxSensor
                    : "",
                testPInchesH2O: wo.emissionsReadings.testPInchesH2O
                    ? wo.emissionsReadings.testPInchesH2O
                    : "",

                spotCheck: wo.emissionsReadings.spotCheck ? "T" : "F",
                noSpotCheck: wo.emissionsReadings.noSpotCheck ? "T" : "F",
                lastCalibration: wo.emissionsReadings.lastCalibration
                    ? wo.emissionsReadings.lastCalibration
                    : null,
                NOxGrams: wo.emissionsReadings.NOxGrams
                    ? wo.emissionsReadings.NOxGrams
                    : "",
                COGrams: wo.emissionsReadings.COGrams
                    ? wo.emissionsReadings.COGrams
                    : "",
                NOxAllowable: wo.emissionsReadings.NOxAllowable
                    ? wo.emissionsReadings.NOxAllowable
                    : "",
                COAllowable: wo.emissionsReadings.COAllowable
                    ? wo.emissionsReadings.COAllowable
                    : "",

                //comments
                repairsDescription: wo.comments.repairsDescription,
                repairsReason: wo.comments.repairsReason,
                calloutReason: wo.comments.calloutReason,
                swapReason: wo.comments.swapReason,
                transferReason: wo.comments.transferReason,
                newsetNotes: wo.comments.newsetNotes,
                releaseNotes: wo.comments.releaseNotes,
                indirectNotes: wo.comments.indirectNotes,
                timeAdjustmentNotes: wo.comments.timeAdjustmentNotes,

                //misc
                leaseNotes: wo.misc.leaseNotes,
                unitNotes: wo.misc.unitNotes,

                //labor codes
                //basic
                contractor: wo.laborCodes.basic.contractor
                    ? WOSync.formatLaborCodeTime(wo.laborCodes.basic.contractor)
                    : "",
                safety: WOSync.formatLaborCodeTime(wo.laborCodes.basic.safety),
                positiveAdj: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.positiveAdj
                ),
                negativeAdj: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.negativeAdj
                ),
                lunch: WOSync.formatLaborCodeTime(wo.laborCodes.basic.lunch),
                custRelations: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.custRelations
                ),
                telemetry: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.telemetry
                ),
                environmental: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.environmental
                ),
                diagnostic: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.diagnostic
                ),
                serviceTravel: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.serviceTravel
                ),
                optimizeUnit: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.optimizeUnit
                ),
                pm: WOSync.formatLaborCodeTime(wo.laborCodes.basic.pm),
                washUnit: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.washUnit
                ),
                inventory: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.inventory
                ),
                training: WOSync.formatLaborCodeTime(
                    wo.laborCodes.basic.training
                ),

                //engine labor codes
                oilAndFilter: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.oilAndFilter
                ),
                addOil: WOSync.formatLaborCodeTime(wo.laborCodes.engine.addOil),
                compression: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.compression
                ),
                replaceEngine: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.replaceEngine
                ),
                replaceCylHead: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.replaceCylHead
                ),
                coolingSystem: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.coolingSystem
                ),
                fuelSystem: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.fuelSystem
                ),
                ignition: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.ignition
                ),
                starter: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.starter
                ),
                lubrication: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.lubrication
                ),
                exhaust: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.exhaust
                ),
                alternator: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.alternator
                ),
                driveOrCoupling: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.driveOrCoupling
                ),
                sealsAndGaskets: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.sealsAndGaskets
                ),
                engineVibrationSwitch: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.engineVibrationSwitch
                ),
                engineBelts: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.engineBelts
                ),
                harnessRepair: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.harnessRepair
                ),
                EICSSensorActuators: WOSync.formatLaborCodeTime(
                    wo.laborCodes.engine.EICSSensorActuators
                ),

                //emissions labor codes
                install: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.install
                ),
                test: WOSync.formatLaborCodeTime(wo.laborCodes.emissions.test),
                repair: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.repair
                ),
                o2SensorReplace: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.o2SensorReplace
                ),
                catalystReplace: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.catalystReplace
                ),
                emissionsThermocoupling: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.emissionsThermocoupling
                ),
                exhaustGasketReplace: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.exhaustGasketReplace
                ),
                facilitySetup: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.facilitySetup
                ),
                adjustment: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.adjustment
                ),
                troubleshooting: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.troubleshooting
                ),
                standBy: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.standBy
                ),
                analyzerRepair: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.analyzerRepair
                ),
                calibration: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.calibration
                ),
                reportGeneration: WOSync.formatLaborCodeTime(
                    wo.laborCodes.emissions.reportGeneration
                ),

                //panel labor codes
                panel: WOSync.formatLaborCodeTime(wo.laborCodes.panel.panel),
                electrical: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.electrical
                ),
                wiring: WOSync.formatLaborCodeTime(wo.laborCodes.panel.wiring),
                conduit: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.conduit
                ),
                gauges: WOSync.formatLaborCodeTime(wo.laborCodes.panel.gauges),
                panelDampners: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.panelDampners
                ),
                tubing: WOSync.formatLaborCodeTime(wo.laborCodes.panel.tubing),
                programming: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.programming
                ),
                annuciator: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.annuciator
                ),
                safetyShutdowns: WOSync.formatLaborCodeTime(
                    wo.laborCodes.panel.safetyShutdowns
                ),

                //compressor labor codes
                inspect: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.inspect
                ),
                replace: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.replace
                ),
                compressorAddOil: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.addOil
                ),
                lubePump: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.lubePump
                ),
                valves: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.valves
                ),
                alignment: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.alignment
                ),
                piston: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.piston
                ),
                packing: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.packing
                ),
                compressorThermocouples: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.compressorThermocouples
                ),
                noFlowSwitch: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.noFlowSwitch
                ),
                overhaul: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.overhaul
                ),
                compressorVibrationSwitch: WOSync.formatLaborCodeTime(
                    wo.laborCodes.compressor.compressorVibrationSwitch
                ),

                //cooler labor codes
                cooling: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.cooling
                ),
                coolTubeRepair: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.coolTubeRepair
                ),
                leakTesting: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.leakTesting
                ),
                pluggingCoolerTube: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.pluggingCoolerTube
                ),
                flushCooler: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.flushCooler
                ),
                washCooler: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.washCooler
                ),
                coolerBelts: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.coolerBelts
                ),
                shaftBearing: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.shaftBearing
                ),
                idlerBearing: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.idlerBearing
                ),
                fan: WOSync.formatLaborCodeTime(wo.laborCodes.cooler.fan),
                shivePulley: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.shivePulley
                ),
                coolerVibrationSwitch: WOSync.formatLaborCodeTime(
                    wo.laborCodes.cooler.coolerVibrationSwitch
                ),

                //vessel labor codes
                dumpControl: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.dumpControl
                ),
                reliefValve: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.reliefValve
                ),
                suctionValve: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.suctionValve
                ),
                dumpValve: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.dumpValve
                ),
                piping: WOSync.formatLaborCodeTime(wo.laborCodes.vessel.piping),
                screenWitchesHat: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.screenWitchesHat
                ),
                vesselDampners: WOSync.formatLaborCodeTime(
                    wo.laborCodes.vessel.vesselDampners
                ),

                //parts
                parts: wo.parts,
            };
        } catch (e) {
            log.info("failed to format Wo for nestuite submission");
            log.error(
                {
                    error: e.message,
                    stack: e.stack,
                },
                "Error occured while formating workorder for netsuite"
            );
            throw new Error(e);
        }
    }

    /**
     * Return an array Matrix
     * [
     *  [ Units based on _id of units in incoing WOs. usually 1 ]
     *  [ Swap Unit if swap WO ]
     *  [ Check if duplicate Wo if so return here ]
     * ]
     * @returns {*}
     */
    woCreateGetContentChecksum() {
        return Promise.all([
            Units.find({
                _id: {
                    // get every Unit with that Id - should be 1
                    $in: this.data.map((obj) => {
                        if (
                            obj.hasOwnProperty("unit") &&
                            obj !== null &&
                            obj !== undefined
                        ) {
                            if (
                                obj.unit !== null &&
                                obj.unit !== undefined &&
                                obj.unit !== ""
                            ) {
                                return typeof obj.unit === "string"
                                    ? ObjectId(obj.unit)
                                    : obj.unit;
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }),
                },
            }),
            Units.find({
                number: {
                    $in: this.data.map((obj) => {
                        if (obj.unitChangeInfo.swapUnitNumber !== "") {
                            return obj.unitChangeInfo.swapUnitNumber;
                        } else {
                            return null;
                        }
                    }),
                },
            }),
            this.WorkOrders.find({
                timeSubmitted: {
                    $in: this.data.reduce((acc, o) => {
                        if (o.hasOwnProperty("timeSubmitted")) {
                            return acc.concat(o.timeSubmitted);
                        } else {
                            return acc;
                        }
                    }, []),
                },
                techId: {
                    $in: this.data.reduce((acc, o) => {
                        if (o.hasOwnProperty("techId")) {
                            return acc.concat(o.techId);
                        } else {
                            return acc;
                        }
                    }, []),
                },
            }),
        ]);
    }

    /**
     * Return an array Matrix
     * [
     *  [ Units based on _id of units in incoing WOs ]
     *  [ Swap Unit if swap WO ]
     * ]
     * @param workorders
     * @returns {Promise<[any, any]>}
     */
    woCreateGetContentChecksumReTry(workorders) {
        return Promise.all([
            Units.find({
                number: {
                    $in: workorders.reduce((acc, cur) => {
                        if (
                            cur.unitNumber !== "" &&
                            cur.unitNumber !== null &&
                            cur.unitNumber !== undefined
                        ) {
                            if (acc.indexOf(cur.unitNumber) === -1) {
                                return acc.concat(cur.unitNumber);
                            } else {
                                return acc;
                            }
                        } else {
                            return acc;
                        }
                    }, []),
                },
            }),
            Units.find({
                number: {
                    $in: workorders.reduce((acc, cur) => {
                        if (
                            cur.unitChangeInfo.swapUnitNumber !== "" &&
                            cur.unitChangeInfo.swapUnitNumber !== null &&
                            cur.unitChangeInfo.swapUnitNumber !== undefined
                        ) {
                            if (
                                acc.indexOf(
                                    cur.unitChangeInfo.swapUnitNumber
                                ) === -1
                            ) {
                                return acc.concat(
                                    cur.unitChangeInfo.swapUnitNumber
                                );
                            } else {
                                return acc;
                            }
                        } else {
                            return acc;
                        }
                    }, []),
                },
            }),
        ]);
    }

    /**
     * Follow method of woCreateGetContentChecksum
     * Only used on Create but is useful to keep WO managers
     * page clean
     * @param checkSumReturnArrayMatrix
     * @returns {Promise<any>}
     */
    checkIsSyncStatus(checkSumReturnArrayMatrix) {
        return new Promise((resolve, reject) => {
            try {
                const unitDocs = checkSumReturnArrayMatrix[0];
                const swapUnits = checkSumReturnArrayMatrix[1];
                const FoundWOs = checkSumReturnArrayMatrix[2];
                this.newArray = this.data.reduce((acc, doc) => {
                    if (isEmpty(doc)) {
                        return acc;
                    }
                    let foundDup = { found: false };
                    FoundWOs.forEach((fDoc) => {
                        if (
                            fDoc.timeSubmitted.toString() ===
                            new Date(doc.timeSubmitted).toString()
                        ) {
                            foundDup = {
                                obj: fDoc,
                                sync: false,
                                found: true,
                                managerSync: false,
                            };
                        }
                    });
                    // Work order was found, don't insert duplicates
                    if (foundDup.found) {
                        return acc.concat(foundDup);
                    }
                    // Pull the unit from the array of found Units with that netsuite ID
                    let unit = null;
                    if (doc.hasOwnProperty("unit") && doc.unit !== null) {
                        unit = _.find(
                            unitDocs,
                            (o) => `${o._id}` === `${doc.unit}`
                        );
                    }
                    // If WO is swap get swap unit as well
                    let swapUnit = null;
                    if (!isEmpty(doc.unitChangeInfo.swapUnitNumber)) {
                        swapUnit = _.find(
                            swapUnits,
                            (o) =>
                                `${o.number}` ===
                                `${doc.unitChangeInfo.swapUnitNumber}`
                        );
                    }
                    if (unit) {
                        // only once both state and county are found will it try and
                        // do the sync procedures; set the doc.unit to the unit id
                        delete unit._id;
                        // set unit snapshot to unit or swap unit depending on wo type
                        let billable = false;
                        let manualPart = false;
                        // if doc is billable do not sync to netsuite
                        if (doc.billingInfo.billableToCustomer) {
                            billable = true;
                        }
                        // if WO has a manual or billable part do not sync
                        if (doc.parts.length > 0) {
                            for (const part of doc.parts) {
                                if (part.isBillable) {
                                    billable = true;
                                }
                                if (part.isManual) {
                                    manualPart = true;
                                }
                            }
                        }

                        /**
                         * Check if all special fields of a Unit match all
                         * the corresponding fields on the work order except Geo
                         */
                        if (
                            doc.type !== "Indirect" &&
                            doc.type !== "Swap" &&
                            doc.type !== "Transfer" &&
                            !billable &&
                            !manualPart
                        ) {
                            if (
                                WOSync.compareWorkorderUnitToUnit(
                                    WOSync.getWorkOrderUnitInfo(doc),
                                    !isEmpty(swapUnit) ? swapUnit : unit
                                )
                            ) {
                                // the doc matches 100% with the current unit
                                return acc.concat({
                                    obj: doc,
                                    sync: true,
                                    found: false,
                                    managerSync: false,
                                });
                            } else {
                                // Even serial numbers did not match
                                return acc.concat({
                                    obj: doc,
                                    sync: false,
                                    found: false,
                                    managerSync: false,
                                });
                            }
                        } else {
                            // is either Indirect, Swap, Transfer, Billable, or has Manual Part
                            return acc.concat({
                                obj: doc,
                                sync: false,
                                found: false,
                                managerSync: false,
                            });
                        }
                    } else {
                        return acc.concat({
                            obj: doc,
                            sync: false,
                            found: false,
                            managerSync: false,
                        });
                    }
                }, []);
                resolve(this.newArray);
            } catch (e) {
                resolve(this.newArray);
            }
        });
    }

    /**
     * Following method of woCreateGetContentChecksumReTry
     * Only used on retry sync
     * @param checkSumReturnArrayRetryMatrix
     * @param workorders
     * @returns {Promise<any>}  [{ obj: wo, sync: false }]
     */
    canReSync(checkSumReturnArrayRetryMatrix, workorders) {
        return new Promise((resolve, reject) => {
            const unitDocs = checkSumReturnArrayRetryMatrix[0];
            const swapUnits = checkSumReturnArrayRetryMatrix[1];

            let returnArray = [];
            try {
                returnArray = workorders.reduce((acc, wo) => {
                    let unit = _.find(
                        unitDocs,
                        (o) => wo.unitNumber === o.number
                    );
                    let swapUnit = null;
                    if (!isEmpty(wo.unitChangeInfo.swapUnitNumber)) {
                        swapUnit = _.find(
                            swapUnits,
                            (o) => wo.unitChangeInfo.swapUnitNumber === o.number
                        );
                        delete swapUnit._id;
                        delete swapUnit.__v;
                    }

                    delete unit._id;
                    delete unit.__v;
                    let billable = false;
                    let manualPart = false;
                    if (wo.billingInfo.billableToCustomer) {
                        billable = true;
                    }
                    if (wo.parts.length > 0) {
                        for (const part of wo.parts) {
                            if (part.isBillable) {
                                billable = true;
                            }
                            if (part.isManual) {
                                manualPart = true;
                            }
                        }
                    }
                    if (
                        wo.type !== "Swap" &&
                        wo.type !== "Transfer" &&
                        !billable &&
                        !manualPart
                    ) {
                        if (
                            WOSync.compareWorkorderUnitToUnit(
                                WOSync.getWorkOrderUnitInfo(wo),
                                !isEmpty(swapUnit) ? swapUnit : unit
                            )
                        ) {
                            return acc.concat({
                                obj: wo,
                                sync: true,
                            });
                        } else {
                            return acc.concat({
                                obj: wo,
                                sync: false,
                            });
                        }
                    } else {
                        return acc.concat({
                            obj: wo,
                            sync: false,
                        });
                    }
                }, []);
                resolve(returnArray);
            } catch (e) {
                log.info("failed to canReSync");
                return reject(e);
            }
        });
    }
    /**
     * Method takes in all workorders that have not synced
     * adds the customer if any and then formats workorder
     * how it should be for syncing to netsuite
     * if they need to be
     * @param toSyncObjects:  [{obj: wo, sync: boolean}]
     * @returns {Promise<[any]>}: [{returnOnly: bool, nswo: formattedDoc, woDoc: unformattedDoc, sync: bool}]
     */
    setUpWOsForSync(toSyncObjects) {
        return new Promise((resolve, reject) => {
            async function processArray(array, fn) {
                let results = [];
                for (let i = 0; i < array.length; i++) {
                    let r = await fn(array[i]);
                    results.push(r);
                }
                return results;
            }
            console.log("tryReSyncWos");

            toSyncObjects.sort(function (a, b) {
                var timeA = Date.parse(a.obj.timeSubmitted)
                var timeB = Date.parse(b.obj.timeSubmitted)

                if (timeA < timeB) return -1
                if (timeA > timeB) return 1
                return 0
            })
            
            console.log(toSyncObjects.length);
            let toSync = toSyncObjects.reduce((acc, cur) => {
                if (cur.sync) {
                    const syncDoc = cur.obj;
                    if (
                        process.env.NODE_ENV === undefined ||
                        process.env.NODE_ENV === "test" ||
                        process.env.NODE_ENV === "development"
                    ) {
                        return acc;
                    } else {
                        // return acc.concat(new Promise((res) => res(syncDoc)))

                        // set sync params
                        const now = new Date();
                        syncDoc.timeSynced = now;
                        if (!syncDoc.timeApproved) {
                            syncDoc.timeApproved = now;
                            syncDoc.approvedBy = "MWH001";
                        }
                        syncDoc.managerApproved = true;
                        syncDoc.netsuiteSyned = true;
                        syncDoc.syncedBy = "MWH001";

                        return acc.concat({
                            returnOnly: false,
                            sync: cur.sync,
                            doc: syncDoc,
                        });
                    }
                } else {
                    return acc;
                }
            }, []);
            log.info(`To Sync Length ${toSync.length}`);
            let items = processArray(toSync, this.setCustomerAndFormat);
            resolve(items);
        });
    }

    /**
     * Take incoming wos and decide on syncing or not
     * this depends if it needs to be manager synced or not
     * @param objs -> [{returnOnly: woDoc.returnOnly, nswo: res, woDoc: woDoc.doc, sync: woDoc.sync}]
     * @returns {*} -> [{
     *           returnOnly: bool,
     *           formattedWO: nswo,
     *           unformattedWO: woDoc,
     *           backoff: 200,
     *           retries: 30,
     *           repeats: 30,
     *           synced: false,
     *           NSReturnObj: null,
     *           cb: workOrderLink.postRequest
     *   }]
     */
    static setUpFormattedInsertedDocsWithSyncInfo(objs) {
        return objs.reduce((acc, cur) => {
            if (cur.sync) {
                return acc.concat({
                    returnOnly: cur.returnOnly,
                    formattedWO: cur.nswo,
                    unformattedWO: cur.woDoc,
                    backoff: 200,
                    retries: 30,
                    repeats: 30,
                    synced: false,
                    NSReturnObj: null,
                    cb: new TBA(
                        "https://4086435.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1"
                    ), // postRequest
                });
            } else {
                return acc.concat({
                    returnOnly: cur.returnOnly,
                    formattedWO: null,
                    unformattedWO: cur.woDoc,
                    backoff: 0,
                    retries: 0,
                    repeats: 0,
                    synced: false,
                    NSReturnObj: null,
                    cb: null,
                });
            }
        }, []);
    }

    /**
     * Make formatted objects for sync process to be asynchrounous
     * have all related and needed itmes added to object for each
     * syncable item here
     * @param formattedObjs
     * @returns {*}
     */
    static setUpFormattedDocWithsyncInfo(formattedObjs) {
        return formattedObjs.map((obj) => ({
            returnOnly: obj.returnOnly, // sync or not
            formattedWO: obj.nswo,
            unformattedWO: obj.woDoc,
            backoff: 200, // value for sync timing retries
            retries: 30, // const value to compare to repeats
            repeats: 30, // value decremented
            synced: false,
            NSReturnObj: null, // will hold the nswoid return object
            cb: new TBA(
                "https://4086435.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1"
            ), // postRequest
        }));
    }

    /**
     * Take in work order from insert that needs to be
     * manager approved or synced to netsuite
     * @param woDocInfo -> {sync: bool, doc: wo}
     * @returns {Promise<any>} -> {returnOnly: bool, nswo: formattedDoc, woDoc: unformattedDoc, sync: bool}
     */
    setCustomerAndFormatOnInsert(woDocInfo) {
        return new Promise((resolve, reject) => {
            if (woDocInfo.sync) {
                WOSync.populateCustomerByName(woDocInfo.doc)
                    .then(WOSync.netSuiteFormat)
                    .then((res) => {
                        resolve({
                            returnOnly: woDocInfo.returnOnly,
                            nswo: res,
                            woDoc: woDocInfo.doc,
                            sync: woDocInfo.sync,
                        });
                    })
                    .catch(reject);
            } else {
                this.WorkOrders.find({
                    techId: woDocInfo.doc.techId,
                    timeSubmitted: woDocInfo.doc.timeSubmitted,
                    timeCreated: woDocInfo.doc.timeCreated,
                })
                    .exec()
                    .then((docs) => {
                        if (docs.length > 0) {
                            const doc = docs[0];
                            return this.WorkOrders.findByIdAndUpdate(
                                doc._id,
                                woDocInfo.doc,
                                { safe: false, new: true }
                            ).exec();
                        } else {
                            return new Promise((res) => res(woDocInfo.doc));
                        }
                    })
                    .then((res) => {
                        resolve({
                            returnOnly: woDocInfo.returnOnly,
                            nswo: null,
                            woDoc: res,
                            sync: woDocInfo.sync,
                        });
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * Format document for syncing to netsuite along with adding customer name
     * set up object to be sent to alternative setup
     * @param woDoc -> {returnOnly: false, sync: cur.sync, doc: syncDoc}
     * @returns {Promise<any>} -> {returnOnly: bool, nswo: formattedDoc, woDoc: unformattedDoc, sync: bool}
     */
    setCustomerAndFormat(woDoc) {
        return new Promise((resolve, reject) => {
            log.info(`in resysnc to netsuite: id: ${woDoc.doc._id}`);
            if (woDoc.doc.type === "Indirect") {
                return reject(
                    new ClientError("Indirect WorkOrders will not be synced")
                );
            }
            WOSync.populateCustomerByName(woDoc.doc)
                .then(WOSync.netSuiteFormat)
                .then((res) => {
                    log.info("succesfullyg formatted wo");
                    resolve({
                        returnOnly: woDoc.returnOnly,
                        nswo: res,
                        woDoc: woDoc.doc,
                        sync: woDoc.sync,
                    });
                })
                .catch((err) => {
                    log.error(
                        `Error Setting customer or formatting for netsuite sync`
                    );
                    reject(err);
                });
        });
    }

    /**
     * Sync did not succeed so make sure to set all related fields
     * accordingly.
     * @param obj
     * @returns {*}
     */
    static woDidNotSync(obj) {
        obj.unformattedWO.timeSynced = null;
        obj.unformattedWO.syncedBy = "";
        obj.unformattedWO.netsuiteId = "";
        obj.unformattedWO.netsuiteSyned = false;
        obj.synced = false;
        return obj;
    }

    /**
     * Either decrements the index and moves to the next operation
     * or it knows it is done an returns all docs
     * @param docs
     * @param index
     * @param cb
     * @returns {*}
     */
    static resyncNext(docs, index, cb) {
        return new Promise((resolve, reject) => {
            if (index > 0) {
                // try to sync the next
                cb(docs, index - 1)
                    .then(resolve)
                    .catch(reject);
            } else {
                // otherwise return all current docs
                return resolve(docs);
            }
        });
    }

    static syncedLinks(synced) {
        return synced.reduce((acc, cur) => {
            if (cur) {
                return acc.concat(
                    `<a href="http://orion.parkenergyservices.com/#/workorder/view/${cur._id}">Synced WO ${cur.type} | ${cur.header.unitNumber} | ${cur.techId} | ${cur.header.customerName} | ${cur.header.leaseName}</a>
                                            <br>`
                );
            } else {
                return acc;
            }
        }, ``);
    }

    /**
     * Sends a post request for the work orders. Does all syncrhonously
     * @param docs  = [{
     *           sync: bool
     *           formattedWO: nswo,
     *           unformattedWO: woDoc,
     *           backoff: 200,
     *           retries: 30,
     *           repeats: 30,
     *           synced: false,
     *           NSReturnObj: null,
     *           cb: workOrderLink.postRequest
     *   }]
     * @param index
     * @constructor
     */
    ReTryAutoSyncAllToNetsuite(docs, index) {
        return new Promise((resolve, reject) => {
            log.info(`index for current resync try: ${index}`);
            // set the Obj to work on based on the incoming index
            let obj = docs[index];
            log.info(`woid: obj: ${obj.unformattedWO._id}`);
            log.info(obj.returnOnly);

            // the cb is the post request for this formatted wo
            if (!obj.returnOnly) {
                obj.cb.postRequest(
                    obj.formattedWO,
                    (body) => {
                        log.info(`got Response form NEtsuite body`);

                        // check to see if the return type has an error
                        if (!isEmpty(body) && !isEmpty(body.error)) {
                            const error_message =
                                body.error.code || JSON.stringify(body);

                            if (
                                [
                                    "ECONNRESET",
                                    "ESOCKETTIMEDOUT",
                                    "ETIMEDOUT",
                                    "SSS_REQUEST_LIMIT_EXCEEDED",
                                ].indexOf(error_message) !== -1
                            ) {
                                // only try as long as repeats of this obj are > 0
                                if (obj.repeats > 0) {
                                    setTimeout(() => {
                                        obj.repeats = obj.repeats - 1;
                                        log.info("error so retry make call");
                                        this.ReTryAutoSyncAllToNetsuite(
                                            docs,
                                            index
                                        )
                                            .then(resolve)
                                            .catch(reject);
                                    }, obj.backoff * (obj.retries - obj.repeats));
                                } else {
                                    // the work order has surpassed its tries to post
                                    obj = WOSync.woDidNotSync(obj);
                                    log.error(
                                        `Work order did not sync: ${
                                            obj.unformattedWO._id
                                        } ${JSON.stringify(body)}`
                                    );
                                    obj.repeats = 0;
                                    // could not sync this current work order go to next
                                    WOSync.resyncNext(
                                        docs,
                                        index,
                                        this.ReTryAutoSyncAllToNetsuite
                                    )
                                        .then(resolve)
                                        .catch(reject);
                                }
                            } else if (
                                ["INVALID_KEY_OR_REF"].indexOf(
                                    error_message
                                ) !== -1
                            ) {
                                // error with a key .. Email out to orion alerts the error
                                log.error(
                                    `Work order sync error, received non limit exceeded body1: ${
                                        obj.unformattedWO._id
                                    } | ${JSON.stringify(body)}`
                                );
                                this.emailOrionAlertsError(
                                    error_message,
                                    obj.unformattedWO
                                );
                                WOSync.resyncNext(
                                    docs,
                                    index,
                                    this.ReTryAutoSyncAllToNetsuite
                                )
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                // Error was not an limit exceeded error log error and try
                                // next
                                obj = WOSync.woDidNotSync(obj);
                                log.error(
                                    `Work order did not sync, received non limit exceeded body2: ${
                                        obj.unformattedWO._id
                                    } | ${JSON.stringify(body)}`
                                );
                                obj.repeats = 0;
                                // go to next on this error type.
                                WOSync.resyncNext(
                                    docs,
                                    index,
                                    this.ReTryAutoSyncAllToNetsuite
                                )
                                    .then(resolve)
                                    .catch(reject);
                            }
                        } else {
                            // either body is empty of no error
                            if (!body.nswoid) {
                                log.info("No body.nswoid");
                                obj = WOSync.woDidNotSync(obj);
                                obj.repeats = 0;
                                // go to next could not get nswoid returned
                                WOSync.resyncNext(
                                    docs,
                                    index,
                                    this.ReTryAutoSyncAllToNetsuite
                                )
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                console.log(body.nswoid);
                                log.info(
                                    `WO Synced: NSID:${body.nswoid} | WOID:${obj.unformattedWO._id}`
                                );
                                obj.unformattedWO.netsuiteId = body.nswoid;
                                obj.unformattedWO.netsuiteSyned = true;
                                obj.synced = true;
                                obj.NSReturnObj = body;
                                obj.repeats = 0;
                                // calling this will make it go to next automatically
                                WOSync.resyncNext(
                                    docs,
                                    index,
                                    this.ReTryAutoSyncAllToNetsuite
                                )
                                    .then(resolve)
                                    .catch(reject);
                            }
                        }
                    },
                    (error) => {
                        log.info(`Recieved info from ns ERROR`);
                        const error_message =
                            error.error.code || JSON.stringify(error);
                        if (
                            [
                                "ECONNRESET",
                                "ESOCKETTIMEDOUT",
                                "ETIMEDOUT",
                                "SSS_REQUEST_LIMIT_EXCEEDED",
                            ].indexOf(error_message) !== -1
                        ) {
                            if (obj.repeats > 0) {
                                setTimeout(() => {
                                    obj.repeats = obj.repeats - 1;
                                    log.info("error so retry make call");
                                    this.ReTryAutoSyncAllToNetsuite(docs, index)
                                        .then(resolve)
                                        .catch(reject);
                                }, obj.backoff * (obj.retries - obj.repeats));
                            } else {
                                // the work order has surpassed its tries to post
                                obj = WOSync.woDidNotSync(obj);
                                log.error(
                                    `Work order did not sync: ${obj.unformattedWO._id}`
                                );
                                obj.repeats = 0;
                                // could not sync this current work order go to next
                                WOSync.resyncNext(
                                    docs,
                                    index,
                                    this.ReTryAutoSyncAllToNetsuite
                                )
                                    .then(resolve)
                                    .catch(reject);
                            }
                        } else if (
                            ["INVALID_KEY_OR_REF"].indexOf(error_message) !== -1
                        ) {
                            // error with a key .. Email out to orion alerts the error
                            log.error(
                                `Work order sync error, received non limit exceeded error1: ${obj.unformattedWO._id} | ${error_message}`
                            );
                            this.emailOrionAlertsError(
                                error_message,
                                obj.unformattedWO
                            );
                            WOSync.resyncNext(
                                docs,
                                index,
                                this.ReTryAutoSyncAllToNetsuite
                            )
                                .then(resolve)
                                .catch(reject);
                        } else {
                            // error message did not have a limit exceeded error type
                            obj = WOSync.woDidNotSync(obj);
                            obj.repeats = 0;
                            log.error(
                                `Work order sync error, received non limit exceeded error2: ${obj.unformattedWO._id} | ${error_message}`
                            );
                            // go to next on this error type
                            WOSync.resyncNext(
                                docs,
                                index,
                                this.ReTryAutoSyncAllToNetsuite
                            )
                                .then(resolve)
                                .catch(reject);
                        }
                    }
                );
            } else {
                log.info("returnOnly no sync");
                WOSync.resyncNext(docs, index, this.ReTryAutoSyncAllToNetsuite)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    /**
     * Unformats to documents only. then updates and returns an array
     * of updated objects
     * @param objs
     * @returns {Promise<[any]>}
     */
    formatObjsToUpdateObjsAndUpdate(objs) {
        return new Promise((resolve, reject) => {
            Promise.all(
                objs.map((obj) => this.updateDocAfterSync(obj.unformattedWO))
            )
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Update Sync information on workorder in db before finishing
     * @param doc
     * @returns {Promise<any>}
     */
    updateDocAfterSync(doc) {
        return new Promise((resolve, reject) => {
            log.info("in updateDocAfterSync");
            // if synced
            const now = new Date();
            if (!isEmpty(doc.netsuiteId) && doc.type !== "Indirect") {
                doc.timeSynced = now;
                doc.syncedBy = doc.techId;
            }
            if (isEmpty(doc.netsuiteId) && doc.type !== "Indirect") {
                doc.timeSynced = null;
                doc.syncedBy = null;
                doc.netsuiteId = "";
                doc.netsuiteSyned = false;
            }
            // still auto approve
            doc.updated_at = now;
            if (!doc.timeApproved) {
                doc.timeApproved = now;
                doc.managerApproved = true;
                doc.approvedBy = doc.techId;
            }
            this.WorkOrders.findByIdAndUpdate(doc._id, doc, {
                safe: false,
                new: true,
            })
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Follow up of checkIsSyncStatus
     * This takes those to sync objects and syncs the WOs
     * that need to sync and inserts all
     * @param toSyncObjects
     * @returns {Promise|*|Promise.ES6}
     */
    insertIncomingWOs(toSyncObjects) {
        let insertObjects = [];
        if (!isEmpty(toSyncObjects)) {
            insertObjects = toSyncObjects.reduce((acc, cur) => {
                if (cur.found === false) {
                    if (isEmpty(cur.obj)) {
                        return acc;
                    } else {
                        return acc.concat(cur.obj);
                    }
                } else {
                    return acc;
                }
            }, []);
            insertObjects = rmArrObjDups(insertObjects, "timeSubmitted");
            if (isEmpty(insertObjects)) {
                return new Promise((res, rej) => res([]));
            } else {
                return this.WorkOrders.insertMany(insertObjects);
            }
        } else {
            return new Promise((res, rej) => res([]));
        }
    }

    /**
     * Take in all incoming wos that have not synced
     * separates work orders depending on manager and
     * netsuite syncs
     * @param toSyncObjects
     * @returns {Promise<any>} [{returnOnly: bool, nswo: formattedDoc, woDoc: unformattedDoc, sync: bool}]
     */
    setUpInsertedWOsForSync(toSyncObjects) {
        return new Promise((resolve, reject) => {
            async function processArray(array, fn) {
                let results = [];
                for (let i = 0; i < array.length; i++) {
                    let r = await fn(array[i]);
                    results.push(r);
                }
                return results;
            }
            let toSync = [];
            this.newArray.forEach((item) => {
                if (!item.found) {
                    log.info(`OnInsert setupINsertedWOsForSync, `);
                    toSyncObjects.forEach((wo) => {
                        if (
                            wo.timeSubmitted.toString() ===
                                new Date(item.obj.timeSubmitted).toString() &&
                            item.found === false
                        ) {
                            if (item.sync && item.obj.type !== "Indirect") {
                                const SyncDoc = item.obj;
                                SyncDoc._id = wo._id ? wo._id : "";
                                SyncDoc.id = wo.id ? wo.id : "";

                                if (
                                    process.env.NODE_ENV !== undefined &&
                                    process.env.NODE_ENV !== "test" &&
                                    process.env.NODE_ENV !== "development"
                                ) {
                                    toSync.push({
                                        returnOnly: false,
                                        sync: true,
                                        doc: SyncDoc,
                                    });
                                } else {
                                    toSync.push({
                                        returnOnly: true,
                                        sync: false,
                                        doc: SyncDoc,
                                    });
                                }
                            } else if (
                                item.managerSync &&
                                item.obj.type !== "Indirect"
                            ) {
                                const updateDoc = item.obj;
                                updateDoc.timeApproved = new Date();
                                updateDoc.managerApproved = true;
                                updateDoc.approvedBy = updateDoc.techId;
                                toSync.push({
                                    returnOnly: true,
                                    sync: false,
                                    doc: updateDoc,
                                });
                            } else {
                                toSync.push({
                                    returnOnly: true,
                                    sync: false,
                                    doc: item.obj,
                                });
                            }
                        }
                    });
                } else {
                    toSync.push({
                        returnOnly: true,
                        sync: false,
                        doc: item.obj,
                    });
                }
            });
            log.info(`To Sync on Insert Length ${toSync.length}`);
            let items = processArray(toSync, this.setCustomerAndFormatOnInsert);
            resolve(items);
        });
    }

    static notSynced(notSynced) {
        return notSynced.reduce((acc, cur) => {
            if (cur) {
                return acc.concat(
                    `<a href="http://orion.parkenergyservices.com/#/workorder/view/${cur._id}">not Synced WO ${cur.type} | ${cur.header.unitNumber} | ${cur.techId} | ${cur.header.customerName} | ${cur.header.leaseName}</a>
                                            <br>`
                );
            } else {
                return acc;
            }
        }, ``);
    }

    /**
     * Email error out to Orion alerts when error occurs.
     * no return, just send email
     * @param error_message
     * @param wo
     */
    emailOrionAlertsError(error_message, wo) {
        let mailer = new GmailMailer();
        let to;
        if (
            process.env.NODE_ENV === undefined ||
            process.env.NODE_ENV === "development" ||
            process.env.NODE_ENV === "test"
        ) {
            to = "mwhelan@parkenergyservices.com";
        } else {
            to = "orionalerts@parkenergyservices.com";
            // to = 'mwhelan@parkenergyservices.com'
        }
        mailer.transport.verify(function (error, success) {
            if (error) {
                log.error(
                    { error: error },
                    "Issue verifying mailer in resync workorders"
                );
            } else {
                let mailOptions = {
                    from: '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                    to: to,
                    subject: `Unable to AutoSync WorkOrder due to: ${error_message}. on WO: ${wo._id}`,
                    html: `
                    <body>
                        <a href="http://orion.parkenergyservices.com/#/workorder/view/${wo._id}">WorkOrder:" +
                        " ${wo._id} |" +
                    " ${wo.unitNumber} | ${wo.techId}</a>
                    <p>Error Message: ${error_message}</p>
                    </body>
                    `,
                };
                mailer.transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        log.error(
                            { error: error },
                            "Error while attempty to send error message and workorder to orion" +
                                " alerts on autoSync to netsuite"
                        );
                    }
                });
            }
        });
    }

    /**
     *
     * @param passOnResolve
     * @returns {Promise<any>}
     */
    emailSyncs(passOnResolve) {
        return new Promise((resolve, reject) => {
            let mailer = new GmailMailer();
            let to;
            let synced = passOnResolve.reduce((acc, cur) => {
                if (
                    cur !== undefined &&
                    cur.netsuiteId !== "" &&
                    cur.netsuiteId !== null
                ) {
                    return acc.concat(cur);
                } else {
                    return acc;
                }
            }, []);
            let notSynced = passOnResolve.reduce((acc, cur) => {
                if (
                    cur !== undefined &&
                    (cur.netsuiteId === "" || cur.netsuiteId === null)
                ) {
                    return acc.concat(cur);
                } else {
                    return acc;
                }
            }, []);
            if (
                process.env.NODE_ENV !== "production" ||
                process.env.NODE_ENV === undefined
            ) {
                to = "mwhelan@parkenergyservices.com";
            } else {
                to = "orionalerts@parkenergyservices.com";
                // to = 'mwhelan@parkenergyservices.com'
            }
            if (synced.length > 0) {
                mailer.transport.verify(function (error, success) {
                    if (error) {
                        log.error(
                            { error: error },
                            "Issue verifying mailer in resync workorders"
                        );
                        log.info("failed to verify mail");
                        return reject(error);
                    } else {
                        let mailOptions = {
                            from:
                                '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                            to: to,
                            subject: `Synced WOs from Auto sync. # Synced: ${synced.length}, not Synced: ${notSynced.length}`,
                            html: `
                            <body>
                                <p>Synced Links</p>
                                ${WOSync.syncedLinks(synced)}
                                <p>Not Synced</p>
                                ${WOSync.notSynced(notSynced)}
                            </body>                            
                            `,
                        };
                        mailer.transport.sendMail(
                            mailOptions,
                            (error, info) => {
                                if (error) {
                                    log.error(
                                        { error: error },
                                        "Error sending mail from resync"
                                    );
                                    log.info("failed to mail");
                                    return reject(error);
                                }
                                resolve(passOnResolve);
                            }
                        );
                    }
                });
            } else {
                resolve(passOnResolve);
            }
        });
    }

    /**
     * Init method for the resync task
     * @returns {Promise<any>}
     added sort by timestarted 11/7/2024 -rr
     */
    syncWOs() {
        return new Promise((resolve, reject) => {
            let workOrders = [];
            this.WorkOrders.find({
                type: { $ne: "Indirect" },
                netsuiteId: "",
                netsuiteSyned: false,
            }).sort({ timeStarted: -1 })
                .lean()
                .exec()
                .then((res) => {
                    log.info("returned wos");
                    log.info(res.length);
                    workOrders = res;
                    return this.woCreateGetContentChecksumReTry(res);
                })
                .then((res) => {
                    log.info("returned from WO create get content.");
                    // [[units], [swapUnits]]
                    return this.canReSync(res, workOrders);
                })
                .then((res) => {
                    log.info("returned from canReSync.");

                    // [{obj: wo, sync: false}],
                    return this.setUpWOsForSync(res);
                })
                .then((res) => {
                    // [{returnOnly: bool, nswo: formattedDoc, woDoc: unformattedDoc, sync: bool}]
                    log.info("succesffuly finished setUpWOsForSync");
                    return WOSync.setUpFormattedDocWithsyncInfo(res);
                })
                .then((res) => {
                    log.info(
                        "succesffuly finished setUPFormattedDOcWithSyncInfo"
                    );
                    /*
                     * obj = {
                     *           returnOnly: bool,
                     *           formattedWO: nswo,
                     *           unformattedWO: woDoc,
                     *           backoff: 200,
                     *           retries: 30,
                     *           repeats: 30,
                     *           synced: false,
                     *           NSReturnObj: null,
                     *           cb: workOrderLink.postRequest
                     *   }
                     *
                     * */
                    // [obj, obj, obj]
                    if (res.length > 0) {
                        return this.ReTryAutoSyncAllToNetsuite(
                            res,
                            res.length - 1
                        );
                    } else {
                        return res;
                    }
                })
                .then((res) => {
                    log.info("finished RetryAutoSyncAllTONEtsuite");
                    return this.formatObjsToUpdateObjsAndUpdate(res);
                })
                .then((res) => {
                    // res = [...woDocs] after sync udpates
                    log.info("returned form TryResyncWos");
                    const emailDocs = res.reduce((acc, cur) => {
                        if (cur === undefined) {
                            return acc;
                        } else {
                            return acc.concat(cur);
                        }
                    }, []);
                    return this.emailSyncs(emailDocs);
                })
                .then(resolve)
                .catch((err) => {
                    log.info("Failed in syncWOs");
                    reject(err);
                });
        });
    }
}

module.exports = WOSync;
