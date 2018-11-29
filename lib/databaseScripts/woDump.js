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
                      thisWo.totalMileage = endMileage - startMileage
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
                                  : '',
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
                          ].join('\t') + '\n'
                      }, '_ID\tTimeStarted\tTimeSubmitted\tTimeApproved\tTimeSynced\tTimePosted\tTechId\tTruckId\tTruckNSID\tTotal Hours in time\tTotal Hours Decimal\tTotal Mileage\tversion\tassetType\tnetsuiteId\tManagerApproved\tApprovedBy\tSyncedBy\tPM\tPM2\tPM3\tPM4\tPM5\tType\tAtShop\tHeader.unitNumber\tHeader.customer\tHeader.contact\tHeader.county\tHeader.state\tHeader.lease\tHeader.rideAlong\tHeader.startMileage\tHeader.endMileage\tHeader.applicationType\tunitChangeInfo.releaseDestination\tunitChangeInfo.transferLease\tunitChangeInfo.transferCounty\tunitChangeInfo.transferState\tunitChangeInfo.swapUnitNSID\tunitChangeInfo.swapUnitNumber\tunitChangeInfo.swapDestination\tUnitOwnership.is\tUnitOwnership.isCustomerUnit\tBilling.billableToCustomer\tBilling.billed\tBilling.warrantyWork\tBilling.AFE\tBilling.AFENumber\tMisc.leaseNotes\tMisc.unitNotes\tMisc.typeOfAsset\tMisc.isUnitRunningOnDeparture\tUnitReadings.displayEngineModel\tUnitReadings.displayFrameModel\tUnitReadings.engineModel\tUnitReadings.engineSerial\tUnitReadings.engBattery\tUnitReadings.engOilTemp\tUnitReadings.engOilTempKill\tUnitReadings.engineJWTemp\tUnitReadings.engineJWTempKill\tUnitReadings.engineOilPressure\tUnitReadings.engOilPressureKill\tUnitReadings.alternatorOutput\tUnitReadings.hourReading\tUnitReadings.engAirInletTemp\tUnitReadings.engAirInletTempKill\tUnitReadings.engJWPress\tUnitReadings.engJWPressKill\tUnitReadings.engTurboExhTempR\tUnitReadings.engTurboExhTempRKill\tUnitReadings.engTurboExhTempL\tUnitReadings.engTurboExhTempLKill\tUnitReadings.rpm\tUnitReadings.engIgnitionTiming\tUnitReadings.engVacuumBoostR\tUnitReadings.engVacuumBoostRKill\tUnitReadings.engVacuumBoostL\tUnitReadings.engVacuumBoostLKill\tUnitReadings.engManifoldTempR\tUnitReadings.engManifoldTempRKill\tUnitReadings.engManifoldTempL\tUnitReadings.engManifoldTempLKill\tUnitReadings.engineManifoldVac\tUnitReadings.compressorModel\tUnitReadings.compressorSerial\tUnitReadings.suctionPressure\tUnitReadings.compInterPress1\tUnitReadings.compInterPress1Low\tUnitReadings.compInterPress1High\tUnitReadings.compInterPress2\tUnitReadings.compInterPress2Low\tUnitReadings.compInterPress2High\tUnitReadings.compInterPress3\tUnitReadings.compInterPress3Low\tUnitReadings.compInterPress3High\tUnitReadings.dischargePressure\tUnitReadings.dischargeTemp1\tUnitReadings.dischargeTemp2\tUnitReadings.dischargeStg1Temp\tUnitReadings.dischargeStg1TempKill\tUnitReadings.dischargeStg2Temp\tUnitReadings.dischargeStg2TempKill\tUnitReadings.dischargeStg3Temp\tUnitReadings.dischargeStg3TempKill\tUnitReadings.dischargeStg4Temp\tUnitReadings.dischargeStg4TempKill\tUnitReadings.dischargeTemp4Kill\tUnitReadings.compressorOilPressure\tUnitReadings.compOilPressKill\tUnitReadings.compOilTemp\tUnitReadings.compOilTempKill\tUnitReadings.compDiffPCFilter\tUnitReadings.compDiffPCFilterKill\tUnitReadings.flowMCF\tEmissionsReadings.afrmvTarget\tEmissionsReadings.catalystTempPre\tEmissionsReadings.catalystTempPreCatKill\tEmissionsReadings.catalystTempPost\tEmissionsReadings.catalystTempPostCatKill\tEmissionsReadings.permitNumber\tEmissionsReadings.afrMake\tEmissionsReadings.afrModel\tEmissionsReadings.afrSN\tEmissionsReadings.EICSCPUSoftware\tEmissionsReadings.EICSDisplaySoftware\tEmissionsReadings.catalystHousingSN\tEmissionsReadings.catalystHousingMake\tEmissionsReadings.catalystHousingModel\tEmissionsReadings.catalystElementMake\tEmissionsReadings.catalystElementSN1\tEmissionsReadings.catalystElementSN2\tEmissionsReadings.o2Sensors\tEmissionsReadings.NOxSensor\tEmissionsReadings.testPInchesH2O\tpmChecklist.KillSettings.highSuctionKill\tpmChecklist.KillSettings.highDischargeKill\tpmChecklist.KillSettings.lowSuctionKill\tpmChecklist.KillSettings.lowDischargeKill\tpmChecklist.KillSettings.highDischargeTempKill\tpmChecklist.engineChecks.battery\tpmChecklist.engineChecks.capAndRotor\tpmChecklist.engineChecks.airFilter\tpmChecklist.engineChecks.oilAndFilters\tpmChecklist.engineChecks.magPickup\tpmChecklist.engineChecks.belts\tpmChecklist.engineChecks.guardsAndBrackets\tpmChecklist.engineChecks.sparkPlugs\tpmChecklist.engineChecks.plugWires\tpmChecklist.engineChecks.driveLine\tpmChecklist.engineChecks.batteryNa\tpmChecklist.engineChecks.capAndRotorNa\tpmChecklist.engineChecks.airFilterNa\tpmChecklist.engineChecks.oilAndFiltersNa\tpmChecklist.engineChecks.magPickupNa\tpmChecklist.engineChecks.beltsNa\tpmChecklist.engineChecks.guardsAndBracketsNa\tpmChecklist.engineChecks.sparkPlugsNa\tpmChecklist.engineChecks.plugWiresNa\tpmChecklist.engineChecks.driveLineNa\tpmChecklist.generalChecks.kills\tpmChecklist.generalChecks.airHoses\tpmChecklist.generalChecks.coolerForCracks\tpmChecklist.generalChecks.coolerLouverMovement\tpmChecklist.generalChecks.coolerLouverCleaned\tpmChecklist.generalChecks.scrubberDump\tpmChecklist.generalChecks.plugInSkid\tpmChecklist.generalChecks.filledDayTank\tpmChecklist.generalChecks.fanForCracking\tpmChecklist.generalChecks.panelWires\tpmChecklist.generalChecks.oilPumpBelt\tpmChecklist.generalChecks.killsNa\tpmChecklist.generalChecks.airHosesNa\tpmChecklist.generalChecks.coolerForCracksNa\tpmChecklist.generalChecks.coolerLouverMovementNa\tpmChecklist.generalChecks.coolerLouverCleanedNa\tpmChecklist.generalChecks.scrubberDumpNa\tpmChecklist.generalChecks.plugInSkidNa\tpmChecklist.generalChecks.filledDayTankNa\tpmChecklist.generalChecks.fanForCrackingNa\tpmChecklist.generalChecks.panelWiresNa\tpmChecklist.generalChecks.oilPumpBeltNa\tpmChecklist.fuelPressureFirstCut\tpmChecklist.fuelPressureSecondCut\tpmChecklist.fuelPressureThirdCut\tpmChecklist.visibleLeaksNotes\tpmChecklist.engineCompression.cylinder1\tpmChecklist.engineCompression.cylinder2\tpmChecklist.engineCompression.cylinder3\tpmChecklist.engineCompression.cylinder4\tpmChecklist.engineCompression.cylinder5\tpmChecklist.engineCompression.cylinder6\tpmChecklist.engineCompression.cylinder7\tpmChecklist.engineCompression.cylinder8\tpmChecklist.engineCompression.cylinder9\tpmChecklist.engineCompression.cylinder10\tpmChecklist.engineCompression.cylinder11\tpmChecklist.engineCompression.cylinder12\tpmChecklist.engineCompression.cylinder13\tpmChecklist.engineCompression.cylinder14\tpmChecklist.engineCompression.cylinder15\tpmChecklist.engineCompression.cylinder16\tComments.repairsDescription\tComments.repairsReason\tComments.calloutReason\tComments.swapReason\tComments.transferReason\tComments.newsetNotes\tComments.releaseNotes\tComments.indirectNotes\tComments.timeAdj\tLC.basic.Safety.H\tLC.basic.positiveAdj.H\tLC.basic.negativeAdj.H\tLC.basic.lunch.H\tLC.basic.custRelations.H\tLC.basic.telemetry.H\tLC.basic.environment.H\tLC.basic.diagnostic.H\tLC.basic.serviceTravel.H\tLC.basic.optimizeUnit.H\tLC.basic.pm.H\tLC.basic.washUnit.H\tLC.basic.inventory.H\tLC.basic.training.H\tLC.engine.oilAndFilter.H\tLC.engine.addOil.H\tLC.engine.compression.H\tLC.engine.replaceEngine.H\tLC.engine.replaceCylHead.H\tLC.engine.coolingSystem.H\tLC.engine.fuelSystem.H\tLC.engine.ignition.H\tLC.engine.starter.H\tLC.engine.lubrication.H\tLC.engine.exhaust.H\tLC.engine.alternator.H\tLC.engine.driveOrCoupling.H\tLC.engine.sealsAndGaskets.H\tLC.emissions.install.H\tLC.emissions.test.H\tLC.emissions.repair.H\tLC.panel.panel.H\tLC.panel.electrical.H\tLC.compressor.inspect.H\tLC.compressor.replace.H\tLC.compressor.addOil.H\tLC.cooler.cooling.H\tLC.vessel.dumpControl.H\tLC.vessel.reliefValve.H\tLC.vessel.suctionValve.H\tJSA.Location\tJSA.customer\tJSA.descriptionOfWork\tJSA.emergencyEvac\tJSA.hazardPlanning\tJSA.agree\tJSA.potentialHazards.bodyPosition\tJSA.potentialHazards.pinch\tJSA.potentialHazards.crushOrStriking\tJSA.potentialHazards.sharpEdges\tJSA.potentialHazards.materialHandling\tJSA.potentialHazards.environment\tJSA.potentialHazards.lifting\tJSA.potentialHazards.elevatedBodyTemp\tJSA.potentialHazards.h2s\tJSA.potentialHazards.hotColdSurfaces\tJSA.potentialHazards.laceration\tJSA.potentialHazards.chemExposure\tJSA.potentialHazards.fallFromElevation\tJSA.potentialHazards.slickSurfaces\tJSA.potentialHazards.excavation\tJSA.potentialHazards.slips\tJSA.potentialHazards.trips\tJSA.potentialHazards.falls\tJSA.potentialHazards.equipment\tJSA.potentialHazards.fireExplosionPotential\tJSA.potentialHazards.electricShock\tJSA.potentialHazards.confinedSpace\tJSA.controlsAndPractices.confinedSpaceEntry\tJSA.controlsAndPractices.spillKit\tJSA.controlsAndPractices.restrictAccess\tJSA.controlsAndPractices.cutResistantGloves\tJSA.controlsAndPractices.ppe\tJSA.controlsAndPractices.reviewEmergencyActionPlan\tJSA.controlsAndPractices.drinkWater\tJSA.controlsAndPractices.electrician\tJSA.controlsAndPractices.heatResistantGloves\tJSA.controlsAndPractices.lockoutTagOut\tJSA.controlsAndPractices.depressurize\tJSA.controlsAndPractices.chemGloves\tJSA.controlsAndPractices.siteJobOrientation\tJSA.controlsAndPractices.samplingMonitoring\tJSA.controlsAndPractices.equipmentCooldown\tJSA.controlsAndPractices.fireExtinguisher\n')
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
