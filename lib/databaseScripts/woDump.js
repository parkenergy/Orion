module.exports = (db, query) => {
  return new Promise((resolve, reject) => {
    const TH = require('../helpers/task_helper');
    try {
      // update nested object
      const update = function(obj, value, path){
        //var stack = path.split('.');
        let stack;
        if(path !== '_id'){
          if(path.split('_')) {
            stack = path.split('_');
          } else if(path.split('.')){
            stack = path.split('.');
          }
        } else {
          // const m = [];
          stack = [].concat(path);
        }
        while(stack.length > 1){
          obj = obj[stack.shift()];
        }
        //print(obj);
        obj[stack.shift()] = value;
      };

      function WOs() {
        return {
          _id: null,
          timeStarted: null,
          timeSubmitted: null,
          timeApproved: null,
          timeSynced: null,
          timePosted: null,

          techId: '',
          truckId: '',
          truckNSID: '',
          version: '',
          assetType: '',
          netsuiteId: '',
          managerApproved: false,
          approvedBy: '',
          syncedBy: '',
          pm: false,
          type: '',
          atShop: '',

          header: {
            unitNumber: '',
            customerName: '',
            contactName: '',
            county: '',
            state: '',
            leaseName: '',
            rideAlong: '',
            startMileage: '',
            endMileage: '',
            applicationtype: ''
          },
          unitChangeInfo: {
            releaseDestination:   '',
            transferLease:        '',
            transferCounty:       '',
            transferState:        '',
            swapUnitNSID:         '',
            swapUnitNumber:       '',
            swapDestination:      ''
          },
          unitOwnership: {
            isRental: false,
            isCustomerUnit: false
          },
          billingInfo: {
            billableToCustomer: false,
            billed: false,
            warrantyWork: false,
            AFE: false,
            AFENumber: ''
          },
          misc: {
            leaseNotes: '',
            unitNotes: '',
            typeOfAsset: '',
            isUnitRunningOnDeparture: false
          },
          unitReadings: {
            suctionPressure:        '',
            dischargePressure:      '',
            flowMCF:                '',
            rpm:                    '',
            dischargeTemp1:         '',
            dischargeTemp2:         '',
            hourReading:            '',
            compressorSerial:       '',
            engineSerial:           '',
            engineOilPressure:      '',
            alternatorOutput:       '',
            compressorOilPressure:  '',
            engineJWTemp:           '',
            engineManifoldVac:      ''
          },
          emissionsReadings: {
            afrmvTarget:      '',
            catalystTempPre:  '',
            catalystTempPost: '',
            permitNumber:     ''
          },
          pmChecklist: {
            killSettings: {
              highSuctionKill:        '',
              highDischargeKill:      '',
              lowSuctionKill:         '',
              lowDischargeKill:       '',
              highDischargeTempKill:  ''
            },
            engineChecks: {
              battery:            false,
              capAndRotor:        false,
              airFilter:          false,
              oilAndFilters:      false,
              magPickup:          false,
              belts:              false,
              guardsAndBrackets:  false,
              sparkPlugs:         false,
              plugWires:          false,
              driveLine:          false,
              batteryNa:            false,
              capAndRotorNa:        false,
              airFilterNa:          false,
              oilAndFiltersNa:      false,
              magPickupNa:          false,
              beltsNa:              false,
              guardsAndBracketsNa:  false,
              sparkPlugsNa:         false,
              plugWiresNa:          false,
              driveLineNa:          false
            },
            generalChecks: {
              kills:                false,
              airHoses:             false,
              coolerForCracks:      false,
              coolerLouverMovement: false,
              coolerLouverCleaned:  false,
              scrubberDump:         false,
              plugInSkid:           false,
              filledDayTank:        false,
              fanForCracking:       false,
              panelWires:           false,
              oilPumpBelt:          false,
              killsNa:                false,
              airHosesNa:             false,
              coolerForCracksNa:      false,
              coolerLouverMovementNa: false,
              coolerLouverCleanedNa:  false,
              scrubberDumpNa:         false,
              plugInSkidNa:           false,
              filledDayTankNa:        false,
              fanForCrackingNa:       false,
              panelWiresNa:           false,
              oilPumpBeltNa:          false
            },
            fuelPressureFirstCut:   '',
            fuelPressureSecondCut:  '',
            visibleLeaksNotes:      '',
            engineCompression: {
              cylinder1: '',
              cylinder2: '',
              cylinder3: '',
              cylinder4: '',
              cylinder5: '',
              cylinder6: '',
              cylinder7: '',
              cylinder8: ''
            }
          },
          comments: {
            repairsDescription:  '',
            repairsReason:       '',
            calloutReason:       '',
            swapReason:          '',
            transferReason:      '',
            newsetNotes:         '',
            releaseNotes:        '',
            indirectNotes:       '',
            timeAdjustmentNotes: ''
          },
          laborCodes: {
            basic: {
              safety:         { hours: 0, minutes: 0 },
              positiveAdj:    { hours: 0, minutes: 0 },
              negativeAdj:    { hours: 0, minutes: 0 },
              lunch:          { hours: 0, minutes: 0 },
              custRelations:  { hours: 0, minutes: 0 },
              telemetry:      { hours: 0, minutes: 0 },
              environmental:  { hours: 0, minutes: 0 },
              diagnostic:     { hours: 0, minutes: 0 },
              serviceTravel:  { hours: 0, minutes: 0 },
              optimizeUnit:   { hours: 0, minutes: 0 },
              pm:             { hours: 0, minutes: 0 },
              washUnit:       { hours: 0, minutes: 0 },
              inventory:      { hours: 0, minutes: 0 },
              training:       { hours: 0, minutes: 0 }
            },
            engine: {
              oilAndFilter:     { hours: 0, minutes: 0 },
              addOil:           { hours: 0, minutes: 0 },
              compression:      { hours: 0, minutes: 0 },
              replaceEngine:    { hours: 0, minutes: 0 },
              replaceCylHead:   { hours: 0, minutes: 0 },
              coolingSystem:    { hours: 0, minutes: 0 },
              fuelSystem:       { hours: 0, minutes: 0 },
              ignition:         { hours: 0, minutes: 0 },
              starter:          { hours: 0, minutes: 0 },
              lubrication:      { hours: 0, minutes: 0 },
              exhaust:          { hours: 0, minutes: 0 },
              alternator:       { hours: 0, minutes: 0 },
              driveOrCoupling:  { hours: 0, minutes: 0 },
              sealsAndGaskets:  { hours: 0, minutes: 0 }
            },
            emissions: {
              install: { hours: 0, minutes: 0 },
              test:    { hours: 0, minutes: 0 },
              repair:  { hours: 0, minutes: 0 }
            },
            panel: {
              panel:         { hours: 0, minutes: 0 },
              electrical:    { hours: 0, minutes: 0 }
            },
            compressor: {
              inspect:  { hours: 0, minutes: 0 },
              replace:  { hours: 0, minutes: 0 },
              addOil:   { hours: 0, minutes: 0 }
            },
            cooler: {
              cooling:  { hours: 0, minutes: 0 }
            },
            vessel: {
              dumpControl:  { hours: 0, minutes: 0 },
              reliefValve:  { hours: 0, minutes: 0 },
              suctionValve: { hours: 0, minutes: 0 }
            }

          },
          jsa: {
            location:           '',
            customer:           '',
            descriptionOfWork:  '',
            emergencyEvac:      '',
            potentialHazards: {
              bodyPosition:           false,
              pinch:                  false,
              crushOrStriking:        false,
              sharpEdges:             false,
              materialHandling:       false,
              environmental:          false,
              lifting:                false,
              elevatedBodyTemp:       false,
              h2s:                    false,
              hotColdSurfaces:        false,
              laceration:             false,
              chemExposure:           false,
              fallFromElevation:      false,
              slickSurfaces:          false,
              excavation:             false,
              slips:                  false,
              trips:                  false,
              falls:                  false,
              equipment:              false,
              fireExplosionPotential: false,
              eletricShock:           false,
              confinedSpace:          false
            },
            controlsAndPractices: {
              confinedSpaceEntry:         false,
              spillKit:                   false,
              restrictAccess:             false,
              cutResistantGloves:         false,
              ppe:                        false,
              reviewEmergencyActionPlan:  false,
              drinkWater:                 false,
              electrician:                false,
              heatResistantGloves:        false,
              lockoutTagout:              false,
              depressurize:               false,
              chemGloves:                 false,
              siteJobOrientation:         false,
              samplingMonitoring:         false,
              equipmentCooldown:          false,
              fireExtinguisher:           false
            },
            hazardPlanning: '',
            agree:          false
          }
        }
      }
      db.aggregate()
        .match(query)
        .project({
          "_id": "$_id",

          "timeStarted": "$timeStarted",
          "timeSubmitted": "$timeSubmitted",
          "timeApproved": "$timeApproved",
          "timeSynced": "$timeSynced",
          "timePosted": "$timePosted",

          "pm": "$pm",
          "type": "$type",
          "atShop": "$atShop",

          "techId": "$techId",
          "truckId": "$truckId",
          "truckNSID": "$truckNSID",
          "version": "$version",
          "assetType": "$assetType",
          "netsuiteId": "$netsuiteId",
          "managerApproved": "$managerApproved",
          "approvedBy": "$approvedBy",
          "syncedBy": "$syncedBy",

          "header_unitNumber": "$header.unitNumber",
          "header_customerName": "$header.customerName",
          "header_contactName": "$header.contactName",
          "header_county": "$header.county",
          "header_state": "$header.state",
          "header_leaseName": "$header.leaseName",
          "header_rideAlong": "$header.rideAlong",
          "header_startMileage": "$header.startMileage",
          "header_endMileage": "$header.endMileage",
          "header_applicationtype": "$header.applicatintype",

          "unitChangeInfo_releaseDestination": '$unitChangeInfo.releaseDestination',
          "unitChangeInfo_transferLease": '$unitChangeInfo.transferLease',
          "unitChangeInfo_transferCounty": '$unitChangeInfo.transferCounty',
          "unitChangeInfo_transferState": '$unitChangeInfo.transferState',
          "unitChangeInfo_swapUnitNSID": '$unitChangeInfo.swapUnitNSID',
          "unitChangeInfo_swapUnitNumber": '$unitChangeInfo.swapUnitNumber',
          "unitChangeInfo_swapDestination": '$unitChangeInfo.swapDestination',

          "unitOwnership_isRental": "$unitOwnership.isRental",
          "unitOwnership_isCustomerUnit": "$unitOwnership.isCustomerUnit",

          "billingInfo_billableToCustomer": "$billingInfo.billableToCustomer",
          "billingInfo_billed": "$billingInfo.billed",
          "billingInfo_warrantyWork": "$billingInfo.warrantyWork",
          "billingInfo_AFE": "$billingInfo.AFE",
          "billingInfo_AFENumber": "$billingInfo.AFENumber",

          "misc_leaseNotes": "$misc.leaseNotes",
          "misc_unitNotes": "$misc.unitNotes",
          "misc_typeOfAsset": "$misc.typeOfAsset",
          "misc_isUnitRunningOnDeparture": "$misc.isUnitRunningOnDeparture",

          "unitReadings_suctionPressure": "$unitReadings.suctionPressure",
          "unitReadings_dischargePressure": "$unitReadings.dischargePressure",
          "unitReadings_flowMCF": "$unitReadings.flowMCF",
          "unitReadings_rpm": "$unitReadings.rpm",
          "unitReadings_dischargeTemp1": "$unitReadings.dischargeTemp1",
          "unitReadings_dischargeTemp2": "$unitReadings.dischargeTemp2",
          "unitReadings_hourReading": "$unitReadings.hourReading",
          "unitReadings_compressorSerial": "$unitReadings.compressorSerial",
          "unitReadings_engineSerial": "$unitReadings.engineSerial",
          "unitReadings_engineOilPressure": "$unitReadings.engineOilPressure",
          "unitReadings_alternatorOutput": "$unitReadings.alternatorOutput",
          "unitReadings_compressorOilPressure": "$unitReadings.compressorOilPressure",
          "unitReadings_JWTemp": "$unitReadings.JWTemp",
          "unitReadings_engineManifoldVac": "$unitReadings.engineManifoldVac",

          "emissionsReadings_afrmvTarget": "$emissionsReadings.afrmvTarget",
          "emissionsReadings_catalystTempPre": "$emissionsReadings.catalystTempPre",
          "emissionsReadings_catalystTempPost": "$emissionsReadings.catalystTempPost",
          "emissionsReadings_permitNumber": "$emissionsReadings_permitNumber",

          "pmChecklist_killSettings_highSuctionKill": "$pmChecklist.killSettings.highSuctionKill",
          "pmChecklist_killSettings_highDischargeKill": "$pmChecklist.killSettings.highDischargeKill",
          "pmChecklist_killSettings_lowSuctionKill": "$pmChecklist.killSettings.lowSuctionKill",
          "pmChecklist_killSettings_lowDischargeKill": "$pmChecklist.killSettings.lowDischargeKill",

          "pmChecklist_engineChecks_battery":            "$pmChecklist.engineChecks.battery",
          "pmChecklist_engineChecks_capAndRotor":        "$pmChecklist.engineChecks.capAndRotor",
          "pmChecklist_engineChecks_airFilter":          "$pmChecklist.engineChecks.airFilter",
          "pmChecklist_engineChecks_oilAndFilters":      "$pmChecklist.engineChecks.oilAndFilters",
          "pmChecklist_engineChecks_magPickup":          "$pmChecklist.engineChecks.magPickup",
          "pmChecklist_engineChecks_belts":              "$pmChecklist.engineChecks.belts",
          "pmChecklist_engineChecks_guardsAndBrackets":  "$pmChecklist.engineChecks.guardsAndBrackets",
          "pmChecklist_engineChecks_sparkPlugs":         "$pmChecklist.engineChecks.sparkPlugs",
          "pmChecklist_engineChecks_plugWires":          "$pmChecklist.engineChecks.plugWires",
          "pmChecklist_engineChecks_driveLine":          "$pmChecklist.engineChecks.driveLine",
          "pmChecklist_engineChecks_batteryNa":            "$pmChecklist.engineChecks.batteryNa",
          "pmChecklist_engineChecks_capAndRotorNa":        "$pmChecklist.engineChecks.capAndRotorNa",
          "pmChecklist_engineChecks_airFilterNa":          "$pmChecklist.engineChecks.airFilterNa",
          "pmChecklist_engineChecks_oilAndFiltersNa":      "$pmChecklist.engineChecks.oilAndFiltersNa",
          "pmChecklist_engineChecks_magPickupNa":          "$pmChecklist.engineChecks.magPickupNa",
          "pmChecklist_engineChecks_beltsNa":              "$pmChecklist.engineChecks.beltsNa",
          "pmChecklist_engineChecks_guardsAndBracketsNa":  "$pmChecklist.engineChecks.guardsAndBracketsNa",
          "pmChecklist_engineChecks_sparkPlugsNa":         "$pmChecklist.engineChecks.sparkPlugsNa",
          "pmChecklist_engineChecks_plugWiresNa":          "$pmChecklist.engineChecks.plugWiresNa",
          "pmChecklist_engineChecks_driveLineNa":          "$pmChecklist.engineChecks.driveLineNa",

          "pmChecklist_generalChecks_kills":                "$pmChecklist.generalChecks.kills",
          "pmChecklist_generalChecks_airHoses":             "$pmChecklist.generalChecks.airHoses",
          "pmChecklist_generalChecks_coolerForCracks":      "$pmChecklist.generalChecks.coolerForCracks",
          "pmChecklist_generalChecks_coolerLouverMovement": "$pmChecklist.generalChecks.coolerLouverMovement",
          "pmChecklist_generalChecks_coolerLouverCleaned":  "$pmChecklist.generalChecks.coolerLouverCleaned",
          "pmChecklist_generalChecks_scrubberDump":         "$pmChecklist.generalChecks.scrubberDump",
          "pmChecklist_generalChecks_plugInSkid":           "$pmChecklist.generalChecks.plugInSkid",
          "pmChecklist_generalChecks_filledDayTank":        "$pmChecklist.generalChecks.filledDayTank",
          "pmChecklist_generalChecks_fanForCracking":       "$pmChecklist.generalChecks.fanForCracking",
          "pmChecklist_generalChecks_panelWires":           "$pmChecklist.generalChecks.panelWires",
          "pmChecklist_generalChecks_oilPumpBelt":          "$pmChecklist.generalChecks.oilPumpBelt",
          "pmChecklist_generalChecks_killsNa":                "$pmChecklist.generalChecks.killsNa",
          "pmChecklist_generalChecks_airHosesNa":             "$pmChecklist.generalChecks.airHosesNa",
          "pmChecklist_generalChecks_coolerForCracksNa":      "$pmChecklist.generalChecks.coolerForCracksNa",
          "pmChecklist_generalChecks_coolerLouverMovementNa": "$pmChecklist.generalChecks.coolerLouverMovementNa",
          "pmChecklist_generalChecks_coolerLouverCleanedNa":  "$pmChecklist.generalChecks.coolerLouverCleanedNa",
          "pmChecklist_generalChecks_scrubberDumpNa":         "$pmChecklist.generalChecks.scrubberDumpNa",
          "pmChecklist_generalChecks_plugInSkidNa":           "$pmChecklist.generalChecks.plugInSkidNa",
          "pmChecklist_generalChecks_filledDayTankNa":        "$pmChecklist.generalChecks.filledDayTankNa",
          "pmChecklist_generalChecks_fanForCrackingNa":       "$pmChecklist.generalChecks.fanForCrackingNa",
          "pmChecklist_generalChecks_panelWiresNa":           "$pmChecklist.generalChecks.panelWiresNa",
          "pmChecklist_generalChecks_oilPumpBeltNa":          "$pmChecklist.generalChecks.oilPumpBeltNa",

          "pmChecklist_fuelPressureFirstCut":   "$pmChecklist.fuelPressureFirstCut",
          "pmChecklist_fuelPressureSecondCut":  "$pmChecklist.fuelPressureSecondCut",
          "pmChecklist_visibleLeaksNotes":      "$pmChecklist.visibleLeaksNotes",

          "pmChecklist_engineCompression_cylinder1": "$pmChecklist.engineCompression.cylinder1",
          "pmChecklist_engineCompression_cylinder2": "$pmChecklist.engineCompression.cylinder2",
          "pmChecklist_engineCompression_cylinder3": "$pmChecklist.engineCompression.cylinder3",
          "pmChecklist_engineCompression_cylinder4": "$pmChecklist.engineCompression.cylinder4",
          "pmChecklist_engineCompression_cylinder5": "$pmChecklist.engineCompression.cylinder5",
          "pmChecklist_engineCompression_cylinder6": "$pmChecklist.engineCompression.cylinder6",
          "pmChecklist_engineCompression_cylinder7": "$pmChecklist.engineCompression.cylinder7",
          "pmChecklist_engineCompression_cylinder8": "$pmChecklist.engineCompression.cylinder8",

          "comments_repairsDescription": "$comments.repairsDescription",
          "comments_repairsReason": "$comments.repairsReason",
          "comments_calloutReason": "$comments.calloutReason",
          "comments_swapReason": "$comments.swapReason",
          "comments_transferReason": "$comments.transferReason",
          "comments_newsetNotes": "$comments.newsetNotes",
          "comments_releaseNotes": "$comments.releaseNotes",
          "comments_indirectNotes": "$comments.indirectNotes",
          "comments_timeAdjustmentNotes": "$comments.timeAdjustmentNotes",

          "laborCodes_basic_safety_hours":         "$laborCodes.basic.safety.hours",
          "laborCodes_basic_positiveAdj_hours":    "$laborCodes.basic.positiveAdj.hours",
          "laborCodes_basic_negativeAdj_hours":    "$laborCodes.basic.negativeAdj.hours",
          "laborCodes_basic_lunch_hours":          "$laborCodes.basic.lunch.hours",
          "laborCodes_basic_custRelations_hours":  "$laborCodes.basic.custRelations.hours",
          "laborCodes_basic_telemetry_hours":      "$laborCodes.basic.telemetry.hours",
          "laborCodes_basic_environmental_hours":  "$laborCodes.basic.environmental.hours",
          "laborCodes_basic_diagnostic_hours":     "$laborCodes.basic.diagnostic.hours",
          "laborCodes_basic_serviceTravel_hours":  "$laborCodes.basic.serviceTravel.hours",
          "laborCodes_basic_optimizeUnit_hours":   "$laborCodes.basic.optimizeUnit.hours",
          "laborCodes_basic_pm_hours":             "$laborCodes.basic.pm.hours",
          "laborCodes_basic_washUnit_hours":       "$laborCodes.basic.washUnit.hours",
          "laborCodes_basic_inventory_hours":      "$laborCodes.basic.inventory.hours",
          "laborCodes_basic_training_hours":       "$laborCodes.basic.training.hours",
          "laborCodes_basic_safety_minutes":         "$laborCodes.basic.safety.minutes",
          "laborCodes_basic_positiveAdj_minutes":    "$laborCodes.basic.positiveAdj.minutes",
          "laborCodes_basic_negativeAdj_minutes":    "$laborCodes.basic.negativeAdj.minutes",
          "laborCodes_basic_lunch_minutes":          "$laborCodes.basic.lunch.minutes",
          "laborCodes_basic_custRelations_minutes":  "$laborCodes.basic.custRelations.minutes",
          "laborCodes_basic_telemetry_minutes":      "$laborCodes.basic.telemetry.minutes",
          "laborCodes_basic_environmental_minutes":  "$laborCodes.basic.environmental.minutes",
          "laborCodes_basic_diagnostic_minutes":     "$laborCodes.basic.diagnostic.minutes",
          "laborCodes_basic_serviceTravel_minutes":  "$laborCodes.basic.serviceTravel.minutes",
          "laborCodes_basic_optimizeUnit_minutes":   "$laborCodes.basic.optimizeUnit.minutes",
          "laborCodes_basic_pm_minutes":             "$laborCodes.basic.pm.minutes",
          "laborCodes_basic_washUnit_minutes":       "$laborCodes.basic.washUnit.minutes",
          "laborCodes_basic_inventory_minutes":      "$laborCodes.basic.inventory.minutes",
          "laborCodes_basic_training_minutes":       "$laborCodes.basic.training.minutes",

          "laborCodes_engine_oilAndFilter_hours":     "$laborCodes.engine.oilAndFilter.hours",
          "laborCodes_engine_addOil_hours":           "$laborCodes.engine.addOil.hours",
          "laborCodes_engine_compression_hours":      "$laborCodes.engine.compression.hours",
          "laborCodes_engine_replaceEngine_hours":    "$laborCodes.engine.replaceEngine.hours",
          "laborCodes_engine_replaceCylHead_hours":   "$laborCodes.engine.replaceCylHead.hours",
          "laborCodes_engine_coolingSystem_hours":  "$laborCodes.engine.coolingSystem.hours",
          "laborCodes_engine_fuelSystem_hours":       "$laborCodes.engine.fuelSystem.hours",
          "laborCodes_engine_ignition_hours":         "$laborCodes.engine.ignition.hours",
          "laborCodes_engine_starter_hours":          "$laborCodes.engine.starter.hours",
          "laborCodes_engine_lubrication_hours":      "$laborCodes.engine.lubrication.hours",
          "laborCodes_engine_exhaust_hours":          "$laborCodes.engine.exhaust.hours",
          "laborCodes_engine_alternator_hours":       "$laborCodes.engine.alternator.hours",
          "laborCodes_engine_driveOrCoupling_hours":  "$laborCodes.engine.driveOrCoupling.hours",
          "laborCodes_engine_sealsAndGaskets_hours":  "$laborCodes.engine.sealsAndGaskets.hours",
          "laborCodes_engine_oilAndFilter_minutes":     "$laborCodes.engine.oilAndFilter.minutes",
          "laborCodes_engine_addOil_minutes":           "$laborCodes.engine.addOil.minutes",
          "laborCodes_engine_compression_minutes":      "$laborCodes.engine.compression.minutes",
          "laborCodes_engine_replaceEngine_minutes":    "$laborCodes.engine.replaceEngine.minutes",
          "laborCodes_engine_replaceCylHead_minutes":   "$laborCodes.engine.replaceCylHead.minutes",
          "laborCodes_engine_coolingSystem_minutes":  "$laborCodes.engine.coolingSystem.minutes",
          "laborCodes_engine_fuelSystem_minutes":       "$laborCodes.engine.fuelSystem.minutes",
          "laborCodes_engine_ignition_minutes":         "$laborCodes.engine.ignition.minutes",
          "laborCodes_engine_starter_minutes":          "$laborCodes.engine.starter.minutes",
          "laborCodes_engine_lubrication_minutes":      "$laborCodes.engine.lubrication.minutes",
          "laborCodes_engine_exhaust_minutes":          "$laborCodes.engine.exhaust.minutes",
          "laborCodes_engine_alternator_minutes":       "$laborCodes.engine.alternator.minutes",
          "laborCodes_engine_driveOrCoupling_minutes":  "$laborCodes.engine.driveOrCoupling.minutes",
          "laborCodes_engine_sealsAndGaskets_minutes":  "$laborCodes.engine.sealsAndGaskets.minutes",

          "laborCodes_emissions_install_hours": "$laborCodes.emissions.install.hours",
          "laborCodes_emissions_test_hours":    "$laborCodes.emissions.test.hours",
          "laborCodes_emissions_repair_hours":  "$laborCodes.emissions.repair.hours",
          "laborCodes_emissions_install_minutes": "$laborCodes.emissions.install.minutes",
          "laborCodes_emissions_test_minutes":    "$laborCodes.emissions.test.minutes",
          "laborCodes_emissions_repair_minutes":  "$laborCodes.emissions.repair.minutes",

          "laborCodes_panel_panel_hours":         "$laborCodes.panel.panel.hours",
          "laborCodes_panel_electrical_hours":    "$laborCodes.panel.electrical.hours",
          "laborCodes_panel_panel_minutes":         "$laborCodes.panel.panel.minutes",
          "laborCodes_panel_electrical_minutes":    "$laborCodes.panel.electrical.minutes",

          "laborCodes_compressor_inspect_hours":  "$laborCodes.compressor.inspect.hours",
          "laborCodes_compressor_replace_hours":  "$laborCodes.compressor.replace.hours",
          "laborCodes_compressor_addOil_hours":   "$laborCodes.compressor.addOil.hours",
          "laborCodes_compressor_inspect_minutes":  "$laborCodes.compressor.inspect.minutes",
          "laborCodes_compressor_replace_minutes":  "$laborCodes.compressor.replace.minutes",
          "laborCodes_compressor_addOil_minutes":   "$laborCodes.compressor.addOil.minutes",

          "laborCodes_cooler_cooling_hours": "$laborCodes.cooler.cooling.hours",
          "laborCodes_cooler_cooling_minutes": "$laborCodes.cooler.cooling.minutes",

          "laborCodes_vessel_dumpControl_hours":  "$laborCodes.vessel.dumpControl.hours",
          "laborCodes_vessel_reliefValve_hours":  "$laborCodes.vessel.reliefValve.hours",
          "laborCodes_vessel_suctionValve_hours": "$laborCodes.vessel.suctionValve.hours",
          "laborCodes_vessel_dumpControl_minutes":  "$laborCodes.vessel.dumpControl.minutes",
          "laborCodes_vessel_reliefValve_minutes":  "$laborCodes.vessel.reliefValve.minutes",
          "laborCodes_vessel_suctionValve_minutes": "$laborCodes.vessel.suctionValve.minutes",

          "jsa_location": "$jsa.location",
          "jsa_customer": "$jsa.customer",
          "jsa_descriptionOfWork": "$jsa.descriptionOfWork",
          "jsa_emergencyEvac": "$jsa.emergencyEvac",
          "jsa_hazardPlanning": "$jsa.hazardPlanning",
          "jsa_agree": "$jsa.agree",

          "jsa_potentialHazards_bodyPosition": "$jsa.potentialHazards.bodyPosition",
          "jsa_potentialHazards_pinch": "$jsa.potentialHazards.pinch",
          "jsa_potentialHazards_crushOrStriking": "$jsa.potentialHazards.crushOrStriking",
          "jsa_potentialHazards_sharpEdges": "$jsa.potentialHazards.sharpEdges",
          "jsa_potentialHazards_materialHandling": "$jsa.potentialHazards.materialHandling",
          "jsa_potentialHazards_environmental": "$jsa.potentialHazards.environmental",
          "jsa_potentialHazards_lifting": "$jsa.potentialHazards.lifting",
          "jsa_potentialHazards_elevatedBodyTemp": "$jsa.potentialHazards.elevatedBodyTemp",
          "jsa_potentialHazards_h2s": "$jsa.potentialHazards.h2s",
          "jsa_potentialHazards_hotColdSurfaces": "$jsa.potentialHazards.hotColdSurfaces",
          "jsa_potentialHazards_laceration": "$jsa.potentialHazards.laceration",
          "jsa_potentialHazards_chemExposure": "$jsa.potentialHazards.chemExposure",
          "jsa_potentialHazards_fallFromElevation": "$jsa.potentialHazards.fallFromElevation",
          "jsa_potentialHazards_slickSurfaces": "$jsa.potentialHazards.slickSurfaces",
          "jsa_potentialHazards_excavation": "$jsa.potentialHazards.excavation",
          "jsa_potentialHazards_slips": "$jsa.potentialHazards.slips",
          "jsa_potentialHazards_trips": "$jsa.potentialHazards.trips",
          "jsa_potentialHazards_falls": "$jsa.potentialHazards.falls",
          "jsa_potentialHazards_equipment": "$jsa.potentialHazards.equipment",
          "jsa_potentialHazards_fireExplosionPotential": "$jsa.potentialHazards.fireExplosionPotential",
          "jsa_potentialHazards_eletricShock": "$jsa.potentialHazards.eletricShock",
          "jsa_potentialHazards_confinedSpace": "$jsa.potentialHazards.confinedSpace",

          "jsa_controlsAndPractices_confinedSpaceEntry": "$jsa.controlsAndPractices.confinedSpaceEntry",
          "jsa_controlsAndPractices_spillKit": "$jsa.controlsAndPractices.spillKit",
          "jsa_controlsAndPractices_restrictAccess": "$jsa.controlsAndPractices.restrictAccess",
          "jsa_controlsAndPractices_cutResistantGloves": "$jsa.controlsAndPractices.cutResistantGloves",
          "jsa_controlsAndPractices_ppe": "$jsa.controlsAndPractices.ppe",
          "jsa_controlsAndPractices_reviewEmergencyActionPlan": "$jsa.controlsAndPractices.reviewEmergencyActionPlan",
          "jsa_controlsAndPractices_drinkWater": "$jsa.controlsAndPractices.drinkWater",
          "jsa_controlsAndPractices_electrician": "$jsa.controlsAndPractices.electrician",
          "jsa_controlsAndPractices_heatResistantGloves": "$jsa.controlsAndPractices.heatResistantGloves",
          "jsa_controlsAndPractices_lockoutTagout": "$jsa.controlsAndPractices.lockoutTagout",
          "jsa_controlsAndPractices_depressurize": "$jsa.controlsAndPractices.depressurize",
          "jsa_controlsAndPractices_chemGloves": "$jsa.controlsAndPractices.chemGloves",
          "jsa_controlsAndPractices_siteJobOrientation": "$jsa.controlsAndPractices.siteJobOrientation",
          "jsa_controlsAndPractices_samplingMonitoring": "$jsa.controlsAndPractices.samplingMonitoring",
          "jsa_controlsAndPractices_equipmentCooldown": "$jsa.controlsAndPractices.equipmentCooldown",
          "jsa_controlsAndPractices_fireExtinguisher": "$jsa.controlsAndPractices.fireExtinguisher"
        })
        .exec()
        .map((doc) => {
          const thisWo = WOs();
          const objKeys = Object.keys(doc);
          for(let i = 0; i < objKeys.length; i++){
            update(thisWo, doc[objKeys[i]], objKeys[i]);
          }
          const timeObj = TH.getTotalWOTimeNoPromise(thisWo);
          thisWo.totalWOTimeHours = timeObj.time;
          thisWo.totalWOTimebase10 = timeObj.decimal.toFixed(2);
          thisWo.totalMileage = thisWo.endMileage - thisWo.startMileage;
          return thisWo;
        })
        .reduce(function (csv,row,index,array) {
          const timeStarted = TH.toExcelTime(row.timeStarted);
          const timeSubmitted = TH.toExcelTime(row.timeSubmitted);
          const timeApproved = TH.toExcelTime(row.timeApproved);
          const timeSynced = TH.toExcelTime(row.timeSynced);
          const timePosted = TH.toExcelTime(row.timePosted);
          const safety = row.laborCodes.basic.safety.hours + (row.laborCodes.basic.safety.minutes / 60);
          const positiveAdj = row.laborCodes.basic.positiveAdj.hours + (row.laborCodes.basic.positiveAdj.minutes / 60);
          const negativeAdj = row.laborCodes.basic.negativeAdj.hours + (row.laborCodes.basic.negativeAdj.minutes / 60);
          const lunch = row.laborCodes.basic.lunch.hours + (row.laborCodes.basic.lunch.minutes / 60);
          const custRelations = row.laborCodes.basic.custRelations.hours + (row.laborCodes.basic.custRelations.minutes / 60);
          const telemetry = row.laborCodes.basic.telemetry.hours + (row.laborCodes.basic.telemetry.minutes / 60);
          const environmental = row.laborCodes.basic.environmental.hours + (row.laborCodes.basic.environmental.minutes / 60);
          const diagnostic = row.laborCodes.basic.diagnostic.hours + (row.laborCodes.basic.diagnostic.minutes / 60);
          const serviceTravel = row.laborCodes.basic.serviceTravel.hours + (row.laborCodes.basic.serviceTravel.minutes / 60);
          const optimizeUnit = row.laborCodes.basic.optimizeUnit.hours + (row.laborCodes.basic.optimizeUnit.minutes / 60);
          const pm = row.laborCodes.basic.pm.hours + (row.laborCodes.basic.pm.minutes / 60);
          const washUnit = row.laborCodes.basic.washUnit.hours + (row.laborCodes.basic.washUnit.minutes / 60);
          const inventory = (row.laborCodes.basic.inventory.hours ? row.laborCodes.basic.inventory.hours : 0) + ((row.laborCodes.basic.inventory.minutes ? row.laborCodes.basic.inventory.minutes : 0) / 60);
          const training = row.laborCodes.basic.training.hours + (row.laborCodes.basic.training.minutes / 60);
          const oilAndFilter = row.laborCodes.engine.oilAndFilter.hours + (row.laborCodes.engine.oilAndFilter.minutes / 60);
          const addEngineOil = row.laborCodes.engine.addOil.hours + (row.laborCodes.engine.addOil.minutes / 60);
          const compression = row.laborCodes.engine.compression.hours + (row.laborCodes.engine.compression.minutes / 60);
          const replaceEngine = row.laborCodes.engine.replaceEngine.hours + (row.laborCodes.engine.replaceEngine.minutes / 60);
          const replaceCylHead = row.laborCodes.engine.replaceCylHead.hours + (row.laborCodes.engine.replaceCylHead.minutes / 60);
          const coolingSystem = (row.laborCodes.engine.coolingSystem.hours ? row.laborCodes.engine.coolingSystem.hours : 0) + ((row.laborCodes.engine.coolingSystem.minutes ? row.laborCodes.engine.coolingSystem.minutes : 0) / 60);
          const fuelSystem = row.laborCodes.engine.fuelSystem.hours + (row.laborCodes.engine.fuelSystem.minutes / 60);
          const ignition = row.laborCodes.engine.ignition.hours + (row.laborCodes.engine.ignition.minutes / 60);
          const starter = row.laborCodes.engine.starter.hours + (row.laborCodes.engine.starter.minutes / 60);
          const lubrication = row.laborCodes.engine.lubrication.hours + (row.laborCodes.engine.lubrication.minutes / 60);
          const exhaust = row.laborCodes.engine.exhaust.hours + (row.laborCodes.engine.exhaust.minutes / 60);
          const alternator = row.laborCodes.engine.alternator.hours + (row.laborCodes.engine.alternator.minutes / 60);
          const driveOrCoupling = row.laborCodes.engine.driveOrCoupling.hours + (row.laborCodes.engine.driveOrCoupling.minutes / 60);
          const sealsAndGaskets = row.laborCodes.engine.sealsAndGaskets.hours + (row.laborCodes.engine.sealsAndGaskets.minutes / 60);
          const install = row.laborCodes.emissions.install.hours + (row.laborCodes.emissions.install.minutes / 60);
          const test = row.laborCodes.emissions.test.hours + (row.laborCodes.emissions.test.minutes / 60);
          const repair = row.laborCodes.emissions.repair.hours + (row.laborCodes.emissions.repair.minutes / 60);
          const panel = row.laborCodes.panel.panel.hours + (row.laborCodes.panel.panel.minutes / 60);
          const electrical = row.laborCodes.panel.electrical.hours + (row.laborCodes.panel.electrical.minutes / 60);
          const inspect = row.laborCodes.compressor.inspect.hours + (row.laborCodes.compressor.inspect.minutes / 60);
          const replace = row.laborCodes.compressor.replace.hours + (row.laborCodes.compressor.replace.minutes / 60);
          const addCompOil = row.laborCodes.compressor.addOil.hours + (row.laborCodes.compressor.addOil.minutes / 60);
          const cooling = row.laborCodes.cooler.cooling.hours + (row.laborCodes.cooler.cooling.minutes / 60);
          const dumpControl = row.laborCodes.vessel.dumpControl.hours + (row.laborCodes.vessel.dumpControl.minutes / 60);
          const reliefValve = row.laborCodes.vessel.reliefValve.hours + (row.laborCodes.vessel.reliefValve.minutes / 60);
          const suctionValve = row.laborCodes.vessel.suctionValve.hours + (row.laborCodes.vessel.suctionValve.minutes / 60);
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
            row.managerApproved,
            row.approvedBy,
            row.syncedBy,
            row.pm,
            row.type,
            row.atShop ? row.atShop : false,
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
            TH.sanitize(row.unitChangeInfo.releaseDestination) ? TH.sanitize(row.unitChangeInfo.releaseDestination) : '',
            TH.sanitize(row.unitChangeInfo.transferLease) ? TH.sanitize(row.unitChangeInfo.transferLease) : '',
            TH.sanitize(row.unitChangeInfo.transferCounty) ? TH.sanitize(row.unitChangeInfo.transferCounty) : '',
            TH.sanitize(row.unitChangeInfo.transferState) ? TH.sanitize(row.unitChangeInfo.transferState) : '',
            TH.sanitize(row.unitChangeInfo.swapUnitNSID) ? TH.sanitize(row.unitChangeInfo.swapUnitNSID) : '',
            TH.sanitize(row.unitChangeInfo.swapUnitNumber) ? TH.sanitize(row.unitChangeInfo.swapUnitNumber) : '',
            TH.sanitize(row.unitChangeInfo.swapDestination) ? TH.sanitize(row.unitChangeInfo.swapDestination) : '',
            // Unit Ownership
            row.unitOwnership.isRental,
            row.unitOwnership.isCustomerUnit,
            // Billing Info
            row.billingInfo.billableToCustomer,
            row.billingInfo.billed,
            row.billingInfo.warrantyWork,
            row.billingInfo.AFE,
            row.billingInfo.AFENumber,
            // Misc
            TH.sanitize(row.misc.leaseNotes),
            TH.sanitize(row.misc.unitNotes),
            row.misc.typeOfAsset,
            row.misc.isUnitRunningOnDeparture,
            // Unit Readings
            row.unitReadings.suctionPressure,
            row.unitReadings.dischargePressure,
            row.unitReadings.flowMCF,
            row.unitReadings.rpm,
            row.unitReadings.dischargeTemp1,
            row.unitReadings.dischargeTemp2,
            row.unitReadings.hourReading,
            row.unitReadings.compressorSerial,
            row.unitReadings.engineSerial,
            row.unitReadings.engineOilPressure,
            row.unitReadings.alternatorOutput,
            row.unitReadings.compressorOilPressure,
            row.unitReadings.engineJWTemp,
            row.unitReadings.engineManifoldVac,
            // Emissions Readings
            row.emissionsReadings.afrmvTarget,
            row.emissionsReadings.catalystTempPre,
            row.emissionsReadings.catalystTempPost,
            row.emissionsReadings.permitNumber,
            // PM Check List
            //   - kill settings
            row.pmChecklist.killSettings.highSuctionKill,
            row.pmChecklist.killSettings.highDischargeKill,
            row.pmChecklist.killSettings.lowSuctionKill,
            row.pmChecklist.killSettings.lowDischargeKill,
            row.pmChecklist.killSettings.highDischargeTempKill,
            //   - engine checks
            row.pmChecklist.engineChecks.battery,
            row.pmChecklist.engineChecks.capAndRotor,
            row.pmChecklist.engineChecks.airFilter,
            row.pmChecklist.engineChecks.oilAndFilters,
            row.pmChecklist.engineChecks.magPickup,
            row.pmChecklist.engineChecks.belts,
            row.pmChecklist.engineChecks.guardsAndBrackets,
            row.pmChecklist.engineChecks.sparkPlugs,
            row.pmChecklist.engineChecks.plugWires,
            row.pmChecklist.engineChecks.driveLine,
            row.pmChecklist.engineChecks.batteryNa,
            row.pmChecklist.engineChecks.capAndRotorNa,
            row.pmChecklist.engineChecks.airFilterNa,
            row.pmChecklist.engineChecks.oilAndFiltersNa,
            row.pmChecklist.engineChecks.magPickupNa,
            row.pmChecklist.engineChecks.beltsNa,
            row.pmChecklist.engineChecks.guardsAndBracketsNa,
            row.pmChecklist.engineChecks.sparkPlugsNa,
            row.pmChecklist.engineChecks.plugWiresNa,
            row.pmChecklist.engineChecks.driveLineNa,
            //   - general checks
            row.pmChecklist.generalChecks.kills,
            row.pmChecklist.generalChecks.airHoses,
            row.pmChecklist.generalChecks.coolerForCracks,
            row.pmChecklist.generalChecks.coolerLouverMovement,
            row.pmChecklist.generalChecks.coolerLouverCleaned,
            row.pmChecklist.generalChecks.scrubberDump,
            row.pmChecklist.generalChecks.plugInSkid,
            row.pmChecklist.generalChecks.filledDayTank,
            row.pmChecklist.generalChecks.fanForCracking,
            row.pmChecklist.generalChecks.panelWires,
            row.pmChecklist.generalChecks.oilPumpBelt,
            row.pmChecklist.generalChecks.killsNa,
            row.pmChecklist.generalChecks.airHosesNa,
            row.pmChecklist.generalChecks.coolerForCracksNa,
            row.pmChecklist.generalChecks.coolerLouverMovementNa,
            row.pmChecklist.generalChecks.coolerLouverCleanedNa,
            row.pmChecklist.generalChecks.scrubberDumpNa,
            row.pmChecklist.generalChecks.plugInSkidNa,
            row.pmChecklist.generalChecks.filledDayTankNa,
            row.pmChecklist.generalChecks.fanForCrackingNa,
            row.pmChecklist.generalChecks.panelWiresNa,
            row.pmChecklist.generalChecks.oilPumpBeltNa,
            //  fuel
            row.pmChecklist.fuelPressureFirstCut,
            row.pmChecklist.fuelPressureSecondCut,
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
            // Comments
            TH.sanitize(row.comments.repairsDescription),
            TH.sanitize(row.comments.repairsReason),
            TH.sanitize(row.comments.calloutReason),
            TH.sanitize(row.comments.swapReason) ? TH.sanitize(row.comments.swapReason) : '',
            TH.sanitize(row.comments.transferReason) ? TH.sanitize(row.comments.transferReason) : '',
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
            TH.sanitize(row.jsa.location),
            TH.sanitize(row.jsa.customer),
            TH.sanitize(row.jsa.descriptionOfWork),
            TH.sanitize(row.jsa.emergencyEvac),
            TH.sanitize(row.jsa.hazardPlanning),
            row.jsa.agree,
            row.jsa.potentialHazards.bodyPosition,
            row.jsa.potentialHazards.pinch,
            row.jsa.potentialHazards.crushOrStriking,
            row.jsa.potentialHazards.sharpEdges,
            row.jsa.potentialHazards.materialHandling,
            row.jsa.potentialHazards.environmental,
            row.jsa.potentialHazards.lifting,
            row.jsa.potentialHazards.elevatedBodyTemp,
            row.jsa.potentialHazards.h2s,
            row.jsa.potentialHazards.hotColdSurfaces,
            row.jsa.potentialHazards.laceration,
            row.jsa.potentialHazards.chemExposure,
            row.jsa.potentialHazards.fallFromElevation,
            row.jsa.potentialHazards.slickSurfaces,
            row.jsa.potentialHazards.excavation,
            row.jsa.potentialHazards.slips,
            row.jsa.potentialHazards.trips,
            row.jsa.potentialHazards.falls,
            row.jsa.potentialHazards.equipment,
            row.jsa.potentialHazards.fireExplosionPotential,
            row.jsa.potentialHazards.eletricShock,
            row.jsa.potentialHazards.confinedSpace,
            row.jsa.controlsAndPractices.confinedSpaceEntry,
            row.jsa.controlsAndPractices.spillKit,
            row.jsa.controlsAndPractices.restrictAccess,
            row.jsa.controlsAndPractices.cutResistantGloves,
            row.jsa.controlsAndPractices.ppe,
            row.jsa.controlsAndPractices.reviewEmergencyActionPlan,
            row.jsa.controlsAndPractices.drinkWater,
            row.jsa.controlsAndPractices.electrician,
            row.jsa.controlsAndPractices.heatResistantGloves,
            row.jsa.controlsAndPractices.lockoutTagout,
            row.jsa.controlsAndPractices.depressurize,
            row.jsa.controlsAndPractices.chemGloves,
            row.jsa.controlsAndPractices.siteJobOrientation,
            row.jsa.controlsAndPractices.samplingMonitoring,
            row.jsa.controlsAndPractices.equipmentCooldown,
            row.jsa.controlsAndPractices.fireExtinguisher
          ].join('\t')+ '\n';
        },'_ID\tTimeStarted\tTimeSubmitted\tTimeApproved\tTimeSynced\tTimePosted\tTechId\tTruckId\tTruckNSID\tTotal Hours in time\tTotal Hours Decimal\tTotal Mileage\tversion\tassetType\tnetsuiteId\tManagerApproved\tApprovedBy\tSyncedBy\tPM\tType\tAtShop\tHeader.unitNumber\tHeader.customer\tHeader.contact\tHeader.county\tHeader.state\tHeader.lease\tHeader.rideAlong\tHeader.startMileage\tHeader.endMileage\tHeader.applicationType\tunitChangeInfo.releaseDestination\tunitChangeInfo.transferLease\tunitChangeInfo.transferCounty\tunitChangeInfo.transferState\tunitChangeInfo.swapUnitNSID\tunitChangeInfo.swapUnitNumber\tunitChangeInfo.swapDestination\tUnitOwnership.is\tUnitOwnership.isCustomerUnit\tBilling.billableToCustomer\tBilling.billed\tBilling.warrantyWork\tBilling.AFE\tBilling.AFENumber\tMisc.leaseNotes\tMisc.unitNotes\tMisc.typeOfAsset\tMisc.isUnitRunningOnDeparture\tUnitReadings.suctionPressure\tUnitReadings.dischargePressure\tUnitReadings.flowMCF\tUnitReadings.rpm\tUnitReadings.dischargeTemp1\tUnitReadings.dischargeTemp2\tUnitReadings.hourReading\tUnitReadings.compressorSerial\tUnitReadings.engineSerial\tUnitReadings.engineOilPressure\tUnitReadings.alternatorOutput\tUnitReadings.compressorOilPressure\tUnitReadings.engineJWTemp\tUnitReadings.engineManifoldVac\tEmissionsReadings.afrmvTarget\tEmissionsReadings.catalystTempPre\tEmissionsReadings.catalystTempPost\tEmissionsReadings.permitNumber\tpmChecklist.KillSettings.highSuctionKill\tpmChecklist.KillSettings.highDischargeKill\tpmChecklist.KillSettings.lowSuctionKill\tpmChecklist.KillSettings.lowDischargeKill\tpmChecklist.KillSettings.highDischargeTempKill\tpmChecklist.engineChecks.battery\tpmChecklist.engineChecks.capAndRotor\tpmChecklist.engineChecks.airFilter\tpmChecklist.engineChecks.oilAndFilters\tpmChecklist.engineChecks.magPickup\tpmChecklist.engineChecks.belts\tpmChecklist.engineChecks.guardsAndBrackets\tpmChecklist.engineChecks.sparkPlugs\tpmChecklist.engineChecks.plugWires\tpmChecklist.engineChecks.driveLine\tpmChecklist.engineChecks.batteryNa\tpmChecklist.engineChecks.capAndRotorNa\tpmChecklist.engineChecks.airFilterNa\tpmChecklist.engineChecks.oilAndFiltersNa\tpmChecklist.engineChecks.magPickupNa\tpmChecklist.engineChecks.beltsNa\tpmChecklist.engineChecks.guardsAndBracketsNa\tpmChecklist.engineChecks.sparkPlugsNa\tpmChecklist.engineChecks.plugWiresNa\tpmChecklist.engineChecks.driveLineNa\tpmChecklist.generalChecks.kills\tpmChecklist.generalChecks.airHoses\tpmChecklist.generalChecks.coolerForCracks\tpmChecklist.generalChecks.coolerLouverMovement\tpmChecklist.generalChecks.coolerLouverCleaned\tpmChecklist.generalChecks.scrubberDump\tpmChecklist.generalChecks.plugInSkid\tpmChecklist.generalChecks.filledDayTank\tpmChecklist.generalChecks.fanForCracking\tpmChecklist.generalChecks.panelWires\tpmChecklist.generalChecks.oilPumpBelt\tpmChecklist.generalChecks.killsNa\tpmChecklist.generalChecks.airHosesNa\tpmChecklist.generalChecks.coolerForCracksNa\tpmChecklist.generalChecks.coolerLouverMovementNa\tpmChecklist.generalChecks.coolerLouverCleanedNa\tpmChecklist.generalChecks.scrubberDumpNa\tpmChecklist.generalChecks.plugInSkidNa\tpmChecklist.generalChecks.filledDayTankNa\tpmChecklist.generalChecks.fanForCrackingNa\tpmChecklist.generalChecks.panelWiresNa\tpmChecklist.generalChecks.oilPumpBeltNa\tpmChecklist.fuelPressureFirstCut\tpmChecklist.fuelPressureSecondCut\tpmChecklist.visibleLeaksNotes\tpmChecklist.engineCompression.cylinder1\tpmChecklist.engineCompression.cylinder2\tpmChecklist.engineCompression.cylinder3\tpmChecklist.engineCompression.cylinder4\tpmChecklist.engineCompression.cylinder5\tpmChecklist.engineCompression.cylinder6\tpmChecklist.engineCompression.cylinder7\tpmChecklist.engineCompression.cylinder8\tComments.repairsDescription\tComments.repairsReason\tComments.calloutReason\tComments.swapReason\tComments.transferReason\tComments.newsetNotes\tComments.releaseNotes\tComments.indirectNotes\tComments.timeAdj\tLC.basic.Safety.H\tLC.basic.positiveAdj.H\tLC.basic.negativeAdj.H\tLC.basic.lunch.H\tLC.basic.custRelations.H\tLC.basic.telemetry.H\tLC.basic.environment.H\tLC.basic.diagnostic.H\tLC.basic.serviceTravel.H\tLC.basic.optimizeUnit.H\tLC.basic.pm.H\tLC.basic.washUnit.H\tLC.basic.inventory.H\tLC.basic.training.H\tLC.engine.oilAndFilter.H\tLC.engine.addOil.H\tLC.engine.compression.H\tLC.engine.replaceEngine.H\tLC.engine.replaceCylHead.H\tLC.engine.coolingSystem.H\tLC.engine.fuelSystem.H\tLC.engine.ignition.H\tLC.engine.starter.H\tLC.engine.lubrication.H\tLC.engine.exhaust.H\tLC.engine.alternator.H\tLC.engine.driveOrCoupling.H\tLC.engine.sealsAndGaskets.H\tLC.emissions.install.H\tLC.emissions.test.H\tLC.emissions.repair.H\tLC.panel.panel.H\tLC.panel.electrical.H\tLC.compressor.inspect.H\tLC.compressor.replace.H\tLC.compressor.addOil.H\tLC.cooler.cooling.H\tLC.vessel.dumpControl.H\tLC.vessel.reliefValve.H\tLC.vessel.suctionValve.H\tJSA.Location\tJSA.customer\tJSA.descriptionOfWork\tJSA.emergencyEvac\tJSA.hazardPlanning\tJSA.agree\tJSA.potentialHazards.bodyPosition\tJSA.potentialHazards.pinch\tJSA.potentialHazards.crushOrStriking\tJSA.potentialHazards.sharpEdges\tJSA.potentialHazards.materialHandling\tJSA.potentialHazards.environment\tJSA.potentialHazards.lifting\tJSA.potentialHazards.elevatedBodyTemp\tJSA.potentialHazards.h2s\tJSA.potentialHazards.hotColdSurfaces\tJSA.potentialHazards.laceration\tJSA.potentialHazards.chemExposure\tJSA.potentialHazards.fallFromElevation\tJSA.potentialHazards.slickSurfaces\tJSA.potentialHazards.excavation\tJSA.potentialHazards.slips\tJSA.potentialHazards.trips\tJSA.potentialHazards.falls\tJSA.potentialHazards.equipment\tJSA.potentialHazards.fireExplosionPotential\tJSA.potentialHazards.electricShock\tJSA.potentialHazards.confinedSpace\tJSA.controlsAndPractices.confinedSpaceEntry\tJSA.controlsAndPractices.spillKit\tJSA.controlsAndPractices.restrictAccess\tJSA.controlsAndPractices.cutResistantGloves\tJSA.controlsAndPractices.ppe\tJSA.controlsAndPractices.reviewEmergencyActionPlan\tJSA.controlsAndPractices.drinkWater\tJSA.controlsAndPractices.electrician\tJSA.controlsAndPractices.heatResistantGloves\tJSA.controlsAndPractices.lockoutTagOut\tJSA.controlsAndPractices.depressurize\tJSA.controlsAndPractices.chemGloves\tJSA.controlsAndPractices.siteJobOrientation\tJSA.controlsAndPractices.samplingMonitoring\tJSA.controlsAndPractices.equipmentCooldown\tJSA.controlsAndPractices.fireExtinguisher\n')
        .then((r) => {
          resolve(r);
        })
        .catch(reject);
    } catch (e) {
      return reject(e);
    }
  });
};
