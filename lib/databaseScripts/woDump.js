module.exports = (db, query) => {
    return new Promise((resolve, reject) => {
        const TH = require('../helpers/task_helper');
        try {

            function fixJSA (jsa, hazard, item) {
                if (jsa !== undefined) {
                    if (jsa[hazard] !== undefined) {
                        if (jsa[hazard][item] !== undefined) {
                            return jsa[hazard][item] ? 'true' : 'false'
                        } else {
                            return 'false'
                        }
                    } else {
                        return 'false'
                    }
                } else {
                    return 'false'
                }
            }

            const cursor = db.find(query)
                             .lean()
                             .cursor()

            let docs = []
            cursor.eachAsync((doc) => {
                const thisWo = doc
                const timeObj = TH.getTotalWOTimeNoPromise(thisWo)
                thisWo.totalWOTimeHours = timeObj.time
                thisWo.totalWOTimebase10 = timeObj.decimal.toFixed(2)
                const endMileage = thisWo.header.endMileage ? +thisWo.header.endMileage : 0
                const startMileage = thisWo.header.startMileage ? +thisWo.header.startMileage : 0
                if (thisWo.totalMileage === undefined || thisWo.totalMileage === null || thisWo.totalMileage === 0) {
                    thisWo.totalMileage = endMileage - startMileage
                }
                docs.push(thisWo)
                return new Promise((res) => res())
            })
                  .then(() => {
                      console.log('WO TIME CALCULATED')
                      return docs.reduce((csv, row) => {
                          const timeStarted = TH.toExcelTime(row.timeStarted)
                          const timeSubmitted = TH.toExcelTime(row.timeSubmitted)
                          const timeApproved = TH.toExcelTime(row.timeApproved)
                          const timeSynced = TH.toExcelTime(row.timeSynced)
                          const timePosted = TH.toExcelTime(row.timePosted)
                          let lastCalibration = null
                          if (row.emissionsReadings.spotCheck && row.emissionsReadings.lastCalibration !== null &&
                              row.emissionsReadings.lastCalibration !== undefined) {
                              lastCalibration = TH.toExcelTime(row.emissionsReadings.lastCalibration)
                          }
                          const safety = row.laborCodes.basic.safety.hours +
                              (row.laborCodes.basic.safety.minutes / 60)
                          const positiveAdj = row.laborCodes.basic.positiveAdj.hours +
                              (row.laborCodes.basic.positiveAdj.minutes / 60)
                          const negativeAdj = row.laborCodes.basic.negativeAdj.hours +
                              (row.laborCodes.basic.negativeAdj.minutes / 60)
                          const lunch = row.laborCodes.basic.lunch.hours +
                              (row.laborCodes.basic.lunch.minutes / 60)
                          const custRelations = row.laborCodes.basic.custRelations.hours +
                              (row.laborCodes.basic.custRelations.minutes / 60)
                          const telemetry = row.laborCodes.basic.telemetry.hours +
                              (row.laborCodes.basic.telemetry.minutes / 60)
                          const environmental = row.laborCodes.basic.environmental.hours +
                              (row.laborCodes.basic.environmental.minutes / 60)
                          const diagnostic = row.laborCodes.basic.diagnostic.hours +
                              (row.laborCodes.basic.diagnostic.minutes / 60)
                          const serviceTravel = row.laborCodes.basic.serviceTravel.hours +
                              (row.laborCodes.basic.serviceTravel.minutes / 60)
                          const optimizeUnit = row.laborCodes.basic.optimizeUnit.hours +
                              (row.laborCodes.basic.optimizeUnit.minutes / 60)
                          const pm = row.laborCodes.basic.pm.hours +
                              (row.laborCodes.basic.pm.minutes / 60)
                          const washUnit = row.laborCodes.basic.washUnit.hours +
                              (row.laborCodes.basic.washUnit.minutes / 60)
                          const inventory = (row.laborCodes.basic.inventory
                                             ? row.laborCodes.basic.inventory.hours
                                             : 0) + ((row.laborCodes.basic.inventory
                                                      ? row.laborCodes.basic.inventory.minutes
                                                      : 0) / 60)
                          const training = row.laborCodes.basic.training.hours +
                              (row.laborCodes.basic.training.minutes / 60)
                          const oilAndFilter = row.laborCodes.engine.oilAndFilter.hours +
                              (row.laborCodes.engine.oilAndFilter.minutes / 60)
                          const addEngineOil = row.laborCodes.engine.addOil.hours +
                              (row.laborCodes.engine.addOil.minutes / 60)
                          const compression = row.laborCodes.engine.compression.hours +
                              (row.laborCodes.engine.compression.minutes / 60)
                          const replaceEngine = row.laborCodes.engine.replaceEngine.hours +
                              (row.laborCodes.engine.replaceEngine.minutes / 60)
                          const replaceCylHead = row.laborCodes.engine.replaceCylHead.hours +
                              (row.laborCodes.engine.replaceCylHead.minutes / 60)
                          const coolingSystem = (row.laborCodes.engine.coolingSystem
                                                 ? row.laborCodes.engine.coolingSystem.hours
                                                 : 0) + ((row.laborCodes.engine.coolingSystem
                                                          ? row.laborCodes.engine.coolingSystem.minutes
                                                          : 0) / 60)
                          const fuelSystem = row.laborCodes.engine.fuelSystem.hours +
                              (row.laborCodes.engine.fuelSystem.minutes / 60)
                          const ignition = row.laborCodes.engine.ignition.hours +
                              (row.laborCodes.engine.ignition.minutes / 60)
                          const starter = row.laborCodes.engine.starter.hours +
                              (row.laborCodes.engine.starter.minutes / 60)
                          const lubrication = row.laborCodes.engine.lubrication.hours +
                              (row.laborCodes.engine.lubrication.minutes / 60)
                          const exhaust = row.laborCodes.engine.exhaust.hours +
                              (row.laborCodes.engine.exhaust.minutes / 60)
                          const alternator = row.laborCodes.engine.alternator.hours +
                              (row.laborCodes.engine.alternator.minutes / 60)
                          const driveOrCoupling = row.laborCodes.engine.driveOrCoupling.hours +
                              (row.laborCodes.engine.driveOrCoupling.minutes / 60)
                          const sealsAndGaskets = row.laborCodes.engine.sealsAndGaskets.hours +
                              (row.laborCodes.engine.sealsAndGaskets.minutes / 60)
                          const install = row.laborCodes.emissions.install.hours +
                              (row.laborCodes.emissions.install.minutes / 60)
                          const test = row.laborCodes.emissions.test.hours +
                              (row.laborCodes.emissions.test.minutes / 60)
                          const repair = row.laborCodes.emissions.repair.hours +
                              (row.laborCodes.emissions.repair.minutes / 60)
                          const panel = row.laborCodes.panel.panel.hours +
                              (row.laborCodes.panel.panel.minutes / 60)
                          const electrical = row.laborCodes.panel.electrical.hours +
                              (row.laborCodes.panel.electrical.minutes / 60)
                          const inspect = row.laborCodes.compressor.inspect.hours +
                              (row.laborCodes.compressor.inspect.minutes / 60)
                          const replace = row.laborCodes.compressor.replace.hours +
                              (row.laborCodes.compressor.replace.minutes / 60)
                          const addCompOil = (row.laborCodes.compressor.addOil
                                              ? row.laborCodes.compressor.addOil.hours
                                              : 0) + (row.laborCodes.compressor.addOil
                                                      ? row.laborCodes.compressor.addOil.minutes / 60
                                                      : 0)
                          const cooling = row.laborCodes.cooler.cooling.hours +
                              (row.laborCodes.cooler.cooling.minutes / 60)
                          const dumpControl = row.laborCodes.vessel.dumpControl.hours +
                              (row.laborCodes.vessel.dumpControl.minutes / 60)
                          const reliefValve = row.laborCodes.vessel.reliefValve.hours +
                              (row.laborCodes.vessel.reliefValve.minutes / 60)
                          const suctionValve = row.laborCodes.vessel.suctionValve.hours +
                              (row.laborCodes.vessel.suctionValve.minutes / 60)
                          if (row.unitReadings === undefined) {
                              console.log(row)
                          }
                          return csv + [
                              row._id,
                              timeStarted,
                              timeSubmitted,
                              timeApproved,
                              timeSynced,
                              timePosted,
                              row.techId,
                              row.truckId,
                              row.truckNSID,
                              row.totalWOTimeHours,
                              row.totalWOTimebase10,
                              row.totalMileage,
                              row.version,
                              row.assetType,
                              row.netsuiteId,
                              row.managerApproved ? 'true' : 'false',
                              row.approvedBy,
                              row.syncedBy,
                              row.pm ? 'true' : 'false',
                              row.pm2 ? 'true' : 'false',
                              row.pm3 ? 'true' : 'false',
                              row.pm4 ? 'true' : 'false',
                              row.pm5 ? 'true' : 'false',
                              row.type,
                              row.atShop ? 'true' : 'false',
                              // Header
                              row.header.unitNumber,
                              TH.sanitize(row.header.customerName),
                              TH.sanitize(row.header.contactName),
                              row.header.county,
                              row.header.state,
                              TH.sanitize(row.header.leaseName),
                              row.header.rideAlong,
                              row.header.startMileage,
                              row.header.endMileage,
                              row.header.applicationtype,
                              // Unit Change Info
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.releaseDestination)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.transferLease)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.transferCounty)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.transferState)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.swapUnitNSID)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.swapUnitNumber)
                              : '',
                              TH.sanitize(row.unitChangeInfo)
                              ? TH.sanitize(row.unitChangeInfo.swapDestination)
                              : '',
                              // Unit Ownership
                              row.unitOwnership.isRental ? 'true' : 'false',
                              row.unitOwnership.isCustomerUnit ? 'true' : 'false',
                              // Billing Info
                              row.billingInfo.billableToCustomer ? 'true' : 'false',
                              row.billingInfo.billed ? 'true' : 'false',
                              row.billingInfo.warrantyWork ? 'true' : 'false',
                              row.billingInfo.AFE,
                              row.billingInfo.AFENumber,
                              // Misc
                              TH.sanitize(row.misc.leaseNotes),
                              TH.sanitize(row.misc.unitNotes),
                              row.misc.typeOfAsset,
                              row.misc.isUnitRunningOnDeparture ? 'true' : 'false',
                              // Unit Readings
                              row.unitReadings.displayEngineModel
                              ? row.unitReadings.displayEngineModel
                              : '',
                              row.unitReadings.displayFrameModel
                              ? row.unitReadings.displayFrameModel
                              : '',
                              // Engine
                              row.unitReadings.engineModel ? row.unitReadings.engineModel : '',
                              row.unitReadings.engineSerial ? row.unitReadings.engineSerial : '',
                              row.unitReadings.engBattery ? row.unitReadings.engBattery : '',
                              row.unitReadings.engOilTemp ? row.unitReadings.engOilTemp : '',
                              row.unitReadings.engOilTempKill
                              ? row.unitReadings.engOilTempKill
                              : '',
                              row.unitReadings.engineJWTemp ? row.unitReadings.engineJWTemp : '',
                              row.unitReadings.engineJWTempKill
                              ? row.unitReadings.engineJWTempKill
                              : '',
                              row.unitReadings.engineOilPressure
                              ? row.unitReadings.engineOilPressure
                              : '',
                              row.unitReadings.engOilPressureKill
                              ? row.unitReadings.engOilPressureKill
                              : '',
                              row.unitReadings.alternatorOutput
                              ? row.unitReadings.alternatorOutput
                              : '',
                              row.unitReadings.hourReading ? row.unitReadings.hourReading : '',
                              row.unitReadings.engAirInletTemp
                              ? row.unitReadings.engAirInletTemp
                              : '',
                              row.unitReadings.engAirInletTempKill
                              ? row.unitReadings.engAirInletTempKill
                              : '',
                              row.unitReadings.engJWPress ? row.unitReadings.engJWPress : '',
                              row.unitReadings.engJWPressKill
                              ? row.unitReadings.engJWPressKill
                              : '',
                              row.unitReadings.engTurboExhTempR
                              ? row.unitReadings.engTurboExhTempR
                              : '',
                              row.unitReadings.engTurboExhTempRKill
                              ? row.unitReadings.engTurboExhTempRKill
                              : '',
                              row.unitReadings.engTurboExhTempL
                              ? row.unitReadings.engTurboExhTempL
                              : '',
                              row.unitReadings.engTurboExhTempLKill
                              ? row.unitReadings.engTurboExhTempLKill
                              : '',
                              row.unitReadings.rpm ? row.unitReadings.rpm : '',
                              row.unitReadings.engIgnitionTiming
                              ? row.unitReadings.engIgnitionTiming
                              : '',
                              row.unitReadings.engVacuumBoostR
                              ? row.unitReadings.engVacuumBoostR
                              : '',
                              row.unitReadings.engVacuumBoostRKill
                              ? row.unitReadings.engVacuumBoostRKill
                              : '',
                              row.unitReadings.engVacuumBoostL
                              ? row.unitReadings.engVacuumBoostL
                              : '',
                              row.unitReadings.engVacuumBoostLKill
                              ? row.unitReadings.engVacuumBoostLKill
                              : '',
                              row.unitReadings.engManifoldTempR
                              ? row.unitReadings.engManifoldTempR
                              : '',
                              row.unitReadings.engManifoldTempRKill
                              ? row.unitReadings.engManifoldTempRKill
                              : '',
                              row.unitReadings.engManifoldTempL
                              ? row.unitReadings.engManifoldTempL
                              : '',
                              row.unitReadings.engManifoldTempLKill
                              ? row.unitReadings.engManifoldTempLKill
                              : '',
                              row.unitReadings.engineManifoldVac
                              ? row.unitReadings.engineManifoldVac
                              : '',
                              // Compressor
                              row.unitReadings.compressorModel
                              ? row.unitReadings.compressorModel
                              : '',
                              row.unitReadings.compressorSerial
                              ? row.unitReadings.compressorSerial
                              : '',
                              row.unitReadings.suctionPressure
                              ? row.unitReadings.suctionPressure
                              : '',
                              row.unitReadings.compInterPress1
                              ? row.unitReadings.compInterPress1
                              : '',
                              row.unitReadings.compInterPress1Low
                              ? row.unitReadings.compInterPress1Low
                              : '',
                              row.unitReadings.compInterPress1High
                              ? row.unitReadings.compInterPress1High
                              : '',
                              row.unitReadings.compInterPress2
                              ? row.unitReadings.compInterPress2
                              : '',
                              row.unitReadings.compInterPress2Low
                              ? row.unitReadings.compInterPress2Low
                              : '',
                              row.unitReadings.compInterPress2High
                              ? row.unitReadings.compInterPress2High
                              : '',
                              row.unitReadings.compInterPress3
                              ? row.unitReadings.compInterPress3
                              : '',
                              row.unitReadings.compInterPress3Low
                              ? row.unitReadings.compInterPress3Low
                              : '',
                              row.unitReadings.compInterPress3High
                              ? row.unitReadings.compInterPress3High
                              : '',
                              row.unitReadings.dischargePressure
                              ? row.unitReadings.dischargePressure
                              : '',
                              row.unitReadings.dischargeTemp1
                              ? row.unitReadings.dischargeTemp1
                              : '',
                              row.unitReadings.dischargeTemp2
                              ? row.unitReadings.dischargeTemp2
                              : '',
                              row.unitReadings.dischargeStg1Temp
                              ? row.unitReadings.dischargeStg1Temp
                              : '',
                              row.unitReadings.dischargeStg1TempKill
                              ? row.unitReadings.dischargeStg1TempKill
                              : '',
                              row.unitReadings.dischargeStg2Temp
                              ? row.unitReadings.dischargeStg2Temp
                              : '',
                              row.unitReadings.dischargeStg2TempKill
                              ? row.unitReadings.dischargeStg2TempKill
                              : '',
                              row.unitReadings.dischargeStg3Temp
                              ? row.unitReadings.dischargeStg3Temp
                              : '',
                              row.unitReadings.dischargeStg3TempKill
                              ? row.unitReadings.dischargeStg3TempKill
                              : '',
                              row.unitReadings.dischargeStg4Temp
                              ? row.unitReadings.dischargeStg4Temp
                              : '',
                              row.unitReadings.dischargeStg4TempKill
                              ? row.unitReadings.dischargeStg4TempKill
                              : '',
                              row.unitReadings.dischargeTemp4Kill
                              ? row.unitReadings.dischargeTemp4Kill
                              : '',
                              row.unitReadings.compressorOilPressure
                              ? row.unitReadings.compressorOilPressure
                              : '',
                              row.unitReadings.compOilPressKill
                              ? row.unitReadings.compOilPressKill
                              : '',
                              row.unitReadings.compOilTemp ? row.unitReadings.compOilTemp : '',
                              row.unitReadings.compOilTempKill
                              ? row.unitReadings.compOilTempKill
                              : '',
                              row.unitReadings.compDiffPCFilter
                              ? row.unitReadings.compDiffPCFilter
                              : '',
                              row.unitReadings.compDiffPCFilterKill
                              ? row.unitReadings.compDiffPCFilterKill
                              : '', row.unitReadings.lubeRate ? row.unitReadings.lubeRate : '',
                              row.unitReadings.flowMCF ? row.unitReadings.flowMCF : '',
                              // Emissions Readings
                              row.emissionsReadings.afrmvTarget
                              ? row.emissionsReadings.afrmvTarget
                              : '',
                              row.emissionsReadings.catalystTempPre
                              ? row.emissionsReadings.catalystTempPre
                              : '',
                              row.emissionsReadings.catalystTempPreCatKill
                              ? row.emissionsReadings.catalystTempPreCatKill
                              : '',
                              row.emissionsReadings.catalystTempPost
                              ? row.emissionsReadings.catalystTempPost
                              : '',
                              row.emissionsReadings.catalystTempPostCatKill
                              ? row.emissionsReadings.catalystTempPostCatKill
                              : '',
                              row.emissionsReadings.permitNumber
                              ? row.emissionsReadings.permitNumber
                              : '',
                              row.emissionsReadings.afrMake ? row.emissionsReadings.afrMake : '',
                              row.emissionsReadings.afrModel ? row.emissionsReadings.afrModel : '',
                              row.emissionsReadings.afrSN ? row.emissionsReadings.afrSN : '',
                              row.emissionsReadings.EICSCPUSoftware
                              ? row.emissionsReadings.EICSCPUSoftware
                              : '',
                              row.emissionsReadings.EICSDisplaySoftware
                              ? row.emissionsReadings.EICSDisplaySoftware
                              : '',
                              row.emissionsReadings.catalystHousingSN
                              ? row.emissionsReadings.catalystHousingSN
                              : '',
                              row.emissionsReadings.catalystHousingMake
                              ? row.emissionsReadings.catalystHousingMake
                              : '',
                              row.emissionsReadings.catalystHousingModel
                              ? row.emissionsReadings.catalystHousingModel
                              : '',
                              row.emissionsReadings.catalystElementMake
                              ? row.emissionsReadings.catalystElementMake
                              : '',
                              row.emissionsReadings.catalystElementSN1
                              ? row.emissionsReadings.catalystElementSN1
                              : '',
                              row.emissionsReadings.catalystElementSN2
                              ? row.emissionsReadings.catalystElementSN2
                              : '',
                              row.emissionsReadings.o2Sensors
                              ? row.emissionsReadings.o2Sensors
                              : '',
                              row.emissionsReadings.NOxSensor
                              ? row.emissionsReadings.NOxSensor
                              : '',
                              row.emissionsReadings.testPInchesH2O
                              ? row.emissionsReadings.testPInchesH2O
                              : '',
                              row.emissionsReadings.spotCheck === undefined ? false : row.emissionsReadings.spotCheck,
                              row.emissionsReadings.noSpotCheck === undefined ? false : row.emissionsReadings.noSpotCheck,
                              lastCalibration ? lastCalibration : '',
                              row.emissionsReadings.NOxGrams ? row.emissionsReadings.NOxGrams : '',
                              row.emissionsReadings.COGrams ? row.emissionsReadings.COGrams : '',
                              row.emissionsReadings.NOxAllowable ? row.emissionsReadings.NOxAllowable : '',
                              row.emissionsReadings.COAllowable ? row.emissionsReadings.COAllowable : '',

                              // PM Check List
                              //   - kill settings
                              row.pmChecklist.killSettings.highSuctionKill,
                              row.pmChecklist.killSettings.highDischargeKill,
                              row.pmChecklist.killSettings.lowSuctionKill,
                              row.pmChecklist.killSettings.lowDischargeKill,
                              row.pmChecklist.killSettings.highDischargeTempKill,
                              //   - engine checks
                              row.pmChecklist.engineChecks.battery ? 'true' : 'false',
                              row.pmChecklist.engineChecks.capAndRotor ? 'true' : 'false',
                              row.pmChecklist.engineChecks.airFilter ? 'true' : 'false',
                              row.pmChecklist.engineChecks.oilAndFilters ? 'true' : 'false',
                              row.pmChecklist.engineChecks.magPickup ? 'true' : 'false',
                              row.pmChecklist.engineChecks.belts ? 'true' : 'false',
                              row.pmChecklist.engineChecks.guardsAndBrackets ? 'true' : 'false',
                              row.pmChecklist.engineChecks.sparkPlugs ? 'true' : 'false',
                              row.pmChecklist.engineChecks.plugWires ? 'true' : 'false',
                              row.pmChecklist.engineChecks.driveLine ? 'true' : 'false',
                              row.pmChecklist.engineChecks.batteryNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.capAndRotorNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.airFilterNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.oilAndFiltersNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.magPickupNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.beltsNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.guardsAndBracketsNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.sparkPlugsNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.plugWiresNa ? 'true' : 'false',
                              row.pmChecklist.engineChecks.driveLineNa ? 'true' : 'false',
                              //   - general checks
                              row.pmChecklist.generalChecks.kills ? 'true' : 'false',
                              row.pmChecklist.generalChecks.airHoses ? 'true' : 'false',
                              row.pmChecklist.generalChecks.coolerForCracks ? 'true' : 'false',
                              row.pmChecklist.generalChecks.coolerLouverMovement ? 'true' : 'false',
                              row.pmChecklist.generalChecks.coolerLouverCleaned ? 'true' : 'false',
                              row.pmChecklist.generalChecks.scrubberDump ? 'true' : 'false',
                              row.pmChecklist.generalChecks.plugInSkid ? 'true' : 'false',
                              row.pmChecklist.generalChecks.filledDayTank ? 'true' : 'false',
                              row.pmChecklist.generalChecks.fanForCracking ? 'true' : 'false',
                              row.pmChecklist.generalChecks.panelWires ? 'true' : 'false',
                              row.pmChecklist.generalChecks.oilPumpBelt ? 'true' : 'false',
                              row.pmChecklist.generalChecks.killsNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.airHosesNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.coolerForCracksNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.coolerLouverMovementNa
                              ? 'true'
                              : 'false',
                              row.pmChecklist.generalChecks.coolerLouverCleanedNa
                              ? 'true'
                              : 'false',
                              row.pmChecklist.generalChecks.scrubberDumpNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.plugInSkidNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.filledDayTankNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.fanForCrackingNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.panelWiresNa ? 'true' : 'false',
                              row.pmChecklist.generalChecks.oilPumpBeltNa ? 'true' : 'false',
                              //  fuel
                              row.pmChecklist.fuelPressureFirstCut,
                              row.pmChecklist.fuelPressureSecondCut,
                              row.pmChecklist.fuelPressureThirdCut
                              ? row.pmChecklist.fuelPressureThirdCut
                              : '',
                              TH.sanitize(row.pmChecklist.visibleLeaksNotes),
                              //   - engine compression
                              row.pmChecklist.engineCompression.cylinder1,
                              row.pmChecklist.engineCompression.cylinder2,
                              row.pmChecklist.engineCompression.cylinder3,
                              row.pmChecklist.engineCompression.cylinder4,
                              row.pmChecklist.engineCompression.cylinder5,
                              row.pmChecklist.engineCompression.cylinder6,
                              row.pmChecklist.engineCompression.cylinder7,
                              row.pmChecklist.engineCompression.cylinder8,
                              row.pmChecklist.engineCompression.cylinder9
                              ? row.pmChecklist.engineCompression.cylinder9
                              : '',
                              row.pmChecklist.engineCompression.cylinder10
                              ? row.pmChecklist.engineCompression.cylinder10
                              : '',
                              row.pmChecklist.engineCompression.cylinder11
                              ? row.pmChecklist.engineCompression.cylinder11
                              : '',
                              row.pmChecklist.engineCompression.cylinder12
                              ? row.pmChecklist.engineCompression.cylinder12
                              : '',
                              row.pmChecklist.engineCompression.cylinder13
                              ? row.pmChecklist.engineCompression.cylinder13
                              : '',
                              row.pmChecklist.engineCompression.cylinder14
                              ? row.pmChecklist.engineCompression.cylinder14
                              : '',
                              row.pmChecklist.engineCompression.cylinder15
                              ? row.pmChecklist.engineCompression.cylinder15
                              : '',
                              row.pmChecklist.engineCompression.cylinder16
                              ? row.pmChecklist.engineCompression.cylinder16
                              : '',

                              // Comments
                              TH.sanitize(row.comments.repairsDescription),
                              TH.sanitize(row.comments.repairsReason),
                              TH.sanitize(row.comments.calloutReason),
                              TH.sanitize(row.comments.swapReason)
                              ? TH.sanitize(row.comments.swapReason)
                              : '',
                              TH.sanitize(row.comments.transferReason)
                              ? TH.sanitize(row.comments.transferReason)
                              : '',
                              TH.sanitize(row.comments.newsetNotes),
                              TH.sanitize(row.comments.releaseNotes),
                              TH.sanitize(row.comments.indirectNotes),
                              TH.sanitize(row.comments.timeAdjustmentNotes),
                              // Labor Codes
                              safety,
                              positiveAdj,
                              negativeAdj,
                              lunch,
                              custRelations,
                              telemetry,
                              environmental,
                              diagnostic,
                              serviceTravel,
                              optimizeUnit,
                              pm,
                              washUnit,
                              inventory,
                              training,
                              oilAndFilter,
                              addEngineOil,
                              compression,
                              replaceEngine,
                              replaceCylHead,
                              coolingSystem,
                              fuelSystem,
                              ignition,
                              starter,
                              lubrication,
                              exhaust,
                              alternator,
                              driveOrCoupling,
                              sealsAndGaskets,
                              install,
                              test,
                              repair,
                              panel,
                              electrical,
                              inspect,
                              replace,
                              addCompOil,
                              cooling,
                              dumpControl,
                              reliefValve,
                              suctionValve,
                              // JSA
                              TH.sanitize(row.jsa
                                          ? (row.jsa.location ? row.jsa.location : '')
                                          : ''),
                              TH.sanitize(row.jsa
                                          ? (row.jsa.customer ? row.jsa.customer : '')
                                          : ''),
                              TH.sanitize(row.jsa ? (row.jsa.descriptionOfWork
                                                     ? row.jsa.descriptionOfWork
                                                     : '') : ''),
                              TH.sanitize(row.jsa ? (row.jsa.emergencyEvac
                                                     ? row.jsa.emergencyEvac
                                                     : '') : ''),
                              TH.sanitize(row.jsa ? (row.jsa.hazardPlanning
                                                     ? row.jsa.hazardPlanning
                                                     : '') : ''),
                              row.jsa ? (row.jsa.agree ? 'true' : 'false') : 'false',
                              fixJSA(row.jsa, 'potentialHazards', 'bodyPosition'),
                              fixJSA(row.jsa, 'potentialHazards', 'pinch'),
                              fixJSA(row.jsa, 'potentialHazards', 'curshOrStriking'),
                              fixJSA(row.jsa, 'potentialHazards', 'sharpEdges'),
                              fixJSA(row.jsa, 'potentialHazards', 'materialHandling'),
                              fixJSA(row.jsa, 'potentialHazards', 'environmental'),
                              fixJSA(row.jsa, 'potentialHazards', 'lifting'),
                              fixJSA(row.jsa, 'potentialHazards', 'elevatedBodyTemp'),
                              fixJSA(row.jsa, 'potentialHazards', 'h2s'),
                              fixJSA(row.jsa, 'potentialHazards', 'hotColdSurfaces'),
                              fixJSA(row.jsa, 'potentialHazards', 'laceration'),
                              fixJSA(row.jsa, 'potentialHazards', 'chemExposure'),
                              fixJSA(row.jsa, 'potentialHazards', 'fallFromElevation'),
                              fixJSA(row.jsa, 'potentialHazards', 'slickSurfaces'),
                              fixJSA(row.jsa, 'potentialHazards', 'excavation'),
                              fixJSA(row.jsa, 'potentialHazards', 'slips'),
                              fixJSA(row.jsa, 'potentialHazards', 'trips'),
                              fixJSA(row.jsa, 'potentialHazards', 'falls'),
                              fixJSA(row.jsa, 'potentialHazards', 'equipment'),
                              fixJSA(row.jsa, 'potentialHazards', 'fireExplosionPotential'),
                              fixJSA(row.jsa, 'potentialHazards', 'eletricShock'),
                              fixJSA(row.jsa, 'potentialHazards', 'confinedSpace'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'confinedSpaceEntry'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'spillKit'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'restrictAccess'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'cutResistantGloves'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'ppe'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'reviewEmergencyActionPlan'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'drinkWater'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'electrician'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'heatResistantGloves'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'lockoutTagout'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'depressurize'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'chemExposure'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'siteJobOrientation'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'samplingMonitoring'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'equipmentCooldown'),
                              fixJSA(row.jsa, 'controlsAndPractices', 'fireExtinguisher'),
                          ].join(',') + '\n'
                          },
                          '_ID,TimeStarted,TimeSubmitted,TimeApproved,TimeSynced,TimePosted,TechId,TruckId,TruckNSID,Total Hours in time,Total Hours Decimal,Total Mileage,version,assetType,netsuiteId,ManagerApproved,ApprovedBy,SyncedBy,PM,PM2,PM3,PM4,PM5,Type,AtShop,Header.unitNumber,Header.customer,Header.contact,Header.county,Header.state,Header.lease,Header.rideAlong,Header.startMileage,Header.endMileage,Header.applicationType,unitChangeInfo.releaseDestination,unitChangeInfo.transferLease,unitChangeInfo.transferCounty,unitChangeInfo.transferState,unitChangeInfo.swapUnitNSID,unitChangeInfo.swapUnitNumber,unitChangeInfo.swapDestination,UnitOwnership.is,UnitOwnership.isCustomerUnit,Billing.billableToCustomer,Billing.billed,Billing.warrantyWork,Billing.AFE,Billing.AFENumber,Misc.leaseNotes,Misc.unitNotes,Misc.typeOfAsset,Misc.isUnitRunningOnDeparture,UnitReadings.displayEngineModel,UnitReadings.displayFrameModel,UnitReadings.engineModel,UnitReadings.engineSerial,UnitReadings.engBattery,UnitReadings.engOilTemp,UnitReadings.engOilTempKill,UnitReadings.engineJWTemp,UnitReadings.engineJWTempKill,UnitReadings.engineOilPressure,UnitReadings.engOilPressureKill,UnitReadings.alternatorOutput,UnitReadings.hourReading,UnitReadings.engAirInletTemp,UnitReadings.engAirInletTempKill,UnitReadings.engJWPress,UnitReadings.engJWPressKill,UnitReadings.engTurboExhTempR,UnitReadings.engTurboExhTempRKill,UnitReadings.engTurboExhTempL,UnitReadings.engTurboExhTempLKill,UnitReadings.rpm,UnitReadings.engIgnitionTiming,UnitReadings.engVacuumBoostR,UnitReadings.engVacuumBoostRKill,UnitReadings.engVacuumBoostL,UnitReadings.engVacuumBoostLKill,UnitReadings.engManifoldTempR,UnitReadings.engManifoldTempRKill,UnitReadings.engManifoldTempL,UnitReadings.engManifoldTempLKill,UnitReadings.engineManifoldVac,UnitReadings.compressorModel,UnitReadings.compressorSerial,UnitReadings.suctionPressure,UnitReadings.compInterPress1,UnitReadings.compInterPress1Low,UnitReadings.compInterPress1High,UnitReadings.compInterPress2,UnitReadings.compInterPress2Low,UnitReadings.compInterPress2High,UnitReadings.compInterPress3,UnitReadings.compInterPress3Low,UnitReadings.compInterPress3High,UnitReadings.dischargePressure,UnitReadings.dischargeTemp1,UnitReadings.dischargeTemp2,UnitReadings.dischargeStg1Temp,UnitReadings.dischargeStg1TempKill,UnitReadings.dischargeStg2Temp,UnitReadings.dischargeStg2TempKill,UnitReadings.dischargeStg3Temp,UnitReadings.dischargeStg3TempKill,UnitReadings.dischargeStg4Temp,UnitReadings.dischargeStg4TempKill,UnitReadings.dischargeTemp4Kill,UnitReadings.compressorOilPressure,UnitReadings.compOilPressKill,UnitReadings.compOilTemp,UnitReadings.compOilTempKill,UnitReadings.compDiffPCFilter,UnitReadings.compDiffPCFilterKill,UnitReadings.lubeRate,UnitReadings.flowMCF,EmissionsReadings.afrmvTarget,EmissionsReadings.catalystTempPre,EmissionsReadings.catalystTempPreCatKill,EmissionsReadings.catalystTempPost,EmissionsReadings.catalystTempPostCatKill,EmissionsReadings.permitNumber,EmissionsReadings.afrMake,EmissionsReadings.afrModel,EmissionsReadings.afrSN,EmissionsReadings.EICSCPUSoftware,EmissionsReadings.EICSDisplaySoftware,EmissionsReadings.catalystHousingSN,EmissionsReadings.catalystHousingMake,EmissionsReadings.catalystHousingModel,EmissionsReadings.catalystElementMake,EmissionsReadings.catalystElementSN1,EmissionsReadings.catalystElementSN2,EmissionsReadings.o2Sensors,EmissionsReadings.NOxSensor,EmissionsReadings.testPInchesH2O,EmissionsReadings.spotCheck,EmissionsReadings.noSpotCheck,EmissionsReadings.lastCalibration,EmissionsReadings.NOxGrams,EmissionsReadings.COGrams,EmissionsReadings.NOxAllowable,EmissionsReadings.COAllowable,pmChecklist.KillSettings.highSuctionKill,pmChecklist.KillSettings.highDischargeKill,pmChecklist.KillSettings.lowSuctionKill,pmChecklist.KillSettings.lowDischargeKill,pmChecklist.KillSettings.highDischargeTempKill,pmChecklist.engineChecks.battery,pmChecklist.engineChecks.capAndRotor,pmChecklist.engineChecks.airFilter,pmChecklist.engineChecks.oilAndFilters,pmChecklist.engineChecks.magPickup,pmChecklist.engineChecks.belts,pmChecklist.engineChecks.guardsAndBrackets,pmChecklist.engineChecks.sparkPlugs,pmChecklist.engineChecks.plugWires,pmChecklist.engineChecks.driveLine,pmChecklist.engineChecks.batteryNa,pmChecklist.engineChecks.capAndRotorNa,pmChecklist.engineChecks.airFilterNa,pmChecklist.engineChecks.oilAndFiltersNa,pmChecklist.engineChecks.magPickupNa,pmChecklist.engineChecks.beltsNa,pmChecklist.engineChecks.guardsAndBracketsNa,pmChecklist.engineChecks.sparkPlugsNa,pmChecklist.engineChecks.plugWiresNa,pmChecklist.engineChecks.driveLineNa,pmChecklist.generalChecks.kills,pmChecklist.generalChecks.airHoses,pmChecklist.generalChecks.coolerForCracks,pmChecklist.generalChecks.coolerLouverMovement,pmChecklist.generalChecks.coolerLouverCleaned,pmChecklist.generalChecks.scrubberDump,pmChecklist.generalChecks.plugInSkid,pmChecklist.generalChecks.filledDayTank,pmChecklist.generalChecks.fanForCracking,pmChecklist.generalChecks.panelWires,pmChecklist.generalChecks.oilPumpBelt,pmChecklist.generalChecks.killsNa,pmChecklist.generalChecks.airHosesNa,pmChecklist.generalChecks.coolerForCracksNa,pmChecklist.generalChecks.coolerLouverMovementNa,pmChecklist.generalChecks.coolerLouverCleanedNa,pmChecklist.generalChecks.scrubberDumpNa,pmChecklist.generalChecks.plugInSkidNa,pmChecklist.generalChecks.filledDayTankNa,pmChecklist.generalChecks.fanForCrackingNa,pmChecklist.generalChecks.panelWiresNa,pmChecklist.generalChecks.oilPumpBeltNa,pmChecklist.fuelPressureFirstCut,pmChecklist.fuelPressureSecondCut,pmChecklist.fuelPressureThirdCut,pmChecklist.visibleLeaksNotes,pmChecklist.engineCompression.cylinder1,pmChecklist.engineCompression.cylinder2,pmChecklist.engineCompression.cylinder3,pmChecklist.engineCompression.cylinder4,pmChecklist.engineCompression.cylinder5,pmChecklist.engineCompression.cylinder6,pmChecklist.engineCompression.cylinder7,pmChecklist.engineCompression.cylinder8,pmChecklist.engineCompression.cylinder9,pmChecklist.engineCompression.cylinder10,pmChecklist.engineCompression.cylinder11,pmChecklist.engineCompression.cylinder12,pmChecklist.engineCompression.cylinder13,pmChecklist.engineCompression.cylinder14,pmChecklist.engineCompression.cylinder15,pmChecklist.engineCompression.cylinder16,Comments.repairsDescription,Comments.repairsReason,Comments.calloutReason,Comments.swapReason,Comments.transferReason,Comments.newsetNotes,Comments.releaseNotes,Comments.indirectNotes,Comments.timeAdj,LC.basic.Safety.H,LC.basic.positiveAdj.H,LC.basic.negativeAdj.H,LC.basic.lunch.H,LC.basic.custRelations.H,LC.basic.telemetry.H,LC.basic.environment.H,LC.basic.diagnostic.H,LC.basic.serviceTravel.H,LC.basic.optimizeUnit.H,LC.basic.pm.H,LC.basic.washUnit.H,LC.basic.inventory.H,LC.basic.training.H,LC.engine.oilAndFilter.H,LC.engine.addOil.H,LC.engine.compression.H,LC.engine.replaceEngine.H,LC.engine.replaceCylHead.H,LC.engine.coolingSystem.H,LC.engine.fuelSystem.H,LC.engine.ignition.H,LC.engine.starter.H,LC.engine.lubrication.H,LC.engine.exhaust.H,LC.engine.alternator.H,LC.engine.driveOrCoupling.H,LC.engine.sealsAndGaskets.H,LC.emissions.install.H,LC.emissions.test.H,LC.emissions.repair.H,LC.panel.panel.H,LC.panel.electrical.H,LC.compressor.inspect.H,LC.compressor.replace.H,LC.compressor.addOil.H,LC.cooler.cooling.H,LC.vessel.dumpControl.H,LC.vessel.reliefValve.H,LC.vessel.suctionValve.H,JSA.Location,JSA.customer,JSA.descriptionOfWork,JSA.emergencyEvac,JSA.hazardPlanning,JSA.agree,JSA.potentialHazards.bodyPosition,JSA.potentialHazards.pinch,JSA.potentialHazards.crushOrStriking,JSA.potentialHazards.sharpEdges,JSA.potentialHazards.materialHandling,JSA.potentialHazards.environment,JSA.potentialHazards.lifting,JSA.potentialHazards.elevatedBodyTemp,JSA.potentialHazards.h2s,JSA.potentialHazards.hotColdSurfaces,JSA.potentialHazards.laceration,JSA.potentialHazards.chemExposure,JSA.potentialHazards.fallFromElevation,JSA.potentialHazards.slickSurfaces,JSA.potentialHazards.excavation,JSA.potentialHazards.slips,JSA.potentialHazards.trips,JSA.potentialHazards.falls,JSA.potentialHazards.equipment,JSA.potentialHazards.fireExplosionPotential,JSA.potentialHazards.electricShock,JSA.potentialHazards.confinedSpace,JSA.controlsAndPractices.confinedSpaceEntry,JSA.controlsAndPractices.spillKit,JSA.controlsAndPractices.restrictAccess,JSA.controlsAndPractices.cutResistantGloves,JSA.controlsAndPractices.ppe,JSA.controlsAndPractices.reviewEmergencyActionPlan,JSA.controlsAndPractices.drinkWater,JSA.controlsAndPractices.electrician,JSA.controlsAndPractices.heatResistantGloves,JSA.controlsAndPractices.lockoutTagOut,JSA.controlsAndPractices.depressurize,JSA.controlsAndPractices.chemGloves,JSA.controlsAndPractices.siteJobOrientation,JSA.controlsAndPractices.samplingMonitoring,JSA.controlsAndPractices.equipmentCooldown,JSA.controlsAndPractices.fireExtinguisher\n')
                  })
                  .then((r) => {
                      resolve(r)
                  })
                  .catch((err) => {
                      console.log('REJECT IN CATCH OF REDUCE')
                      return reject(err)
                  })
        } catch (e) {
            console.log('REJECT IN CATCH')
            return reject(e);
        }
    });
};
