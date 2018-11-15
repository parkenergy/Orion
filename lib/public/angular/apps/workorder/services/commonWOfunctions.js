angular.module('WorkOrderApp.Services')
.factory('CommonWOfunctions', [function () {
  var CommonWOFunctions = {};

  // Add Component Name to every part in wo -------------
  CommonWOFunctions.addComponentNameToParts = function (wo, parts) {
    if(wo.hasOwnProperty('parts')){
      if(wo.parts.length !== 0){
        wo.parts.map(function (part) {
          var netsuiteId = +part.netsuiteId;
          _.forEach(parts, function (obj) {
            if(obj.netsuiteId === netsuiteId){
              part.componentName = (obj.componentName) ? obj.componentName : '';
            }
          });
        });
      }
    }
    return wo;
  };
  // ----------------------------------------------------

    // clear all emissions, unitReadings, pmChecklist items
    // that are not associated with this WO
    CommonWOFunctions.clearNoneEngineFrame = function (wo, woInputs) {
        woInputs.forEach((input) => {
            let found = false
            input.engines.forEach((engine) => {
                if (engine.netsuiteId === wo.unitReadings.engineModel) {
                    found = true
                }
            })
            input.compressors.forEach((frame) => {
                if (frame.netsuiteId === wo.unitReadings.compressorModel) {
                    found = true
                }
            })
            if (!found) {
                // clear this input
                wo[input.path] = ''
            }
        })
        return wo
    }

    CommonWOFunctions.defaultWO = function () {
        return {
            netsuiteId:          '',
            netsuiteSyned:       false,
            truckId:             '',
            truckNSID:           '',
            unitNumber:          '',
            unitSnapShot:        null,
            technician:          null,
            techId:              '',
            newEngineSerial:     '',
            newCompressorSerial: '',

            managerApproved: false,
            approvedBy:      '',
            syncedBy:        '',

            timePosted: new Date(),

            timeStarted:   null,
            timeSubmitted: null,
            timeApproved:  null,
            timeSynced:    null,

            pm:     false, // pm1
            pm2:    false,
            pm3:    false,
            pm4:    false,
            pm5:    false,
            type:   '',
            atShop: false,

            header: {
                unitNumber:      '',
                unitNumberNSID:  '',
                customerName:    '',
                contactName:     '',
                county:          '',
                state:           '',
                leaseName:       '',
                rideAlong:       '',
                startMileage:    null,
                endMileage:      null,
                applicationtype: '',
            },

            unitChangeInfo: {
                releaseDestination: '',
                transferLease:      '',
                transferCounty:     '',
                transferState:      '',
                swapUnitNSID:       '',
                swapUnitNumber:     '',
                swapDestination:    '',
            },

            unitOwnership: {
                isRental:       false,
                isCustomerUnit: false,
            },

            billingInfo: {
                billableToCustomer: false,
                billed:             false,
                warrantyWork:       false,
                AFENumber:          '',
                AFE:                false,
            },

            misc: {
                leaseNotes:               '',
                unitNotes:                '',
                typeOfAsset:              '',
                isUnitRunningOnDeparture: false,
            },

            geo: {
                type:        'Point', // default: 'Point' },
                coordinates: [0.0, 0.0], // default: [0.0, 0.0],
            },

            unitReadings: {
                // for local use ONLY
                displayEngineModel:    '',
                displayFrameModel:     '',
                // Engine
                engineModel:           '',
                engineSerial:          '',   //       *
                engBattery:            null,
                engOilTemp:            null, // guage
                engOilTempKill:        null,
                engineJWTemp:          null, // guage *
                engineJWTempKill:      null,
                engineOilPressure:     null, // guage *
                engOilPressureKill:    null,
                alternatorOutput:      null, // guage *
                hourReading:           null, // guage *
                engAirInletTemp:       null, // guage
                engAirInletTempKill:   null,
                engJWPress:            null,
                engJWPressKill:        null,
                engTurboExhTempR:      null, // guage
                engTurboExhTempRKill:  null,
                engTurboExhTempL:      null, // guage
                engTurboExhTempLKill:  null,
                rpm:                   null, // guage *
                engIgnitionTiming:     null, // guage
                engVacuumBoostR:       null, // guage
                engVacuumBoostRKill:   null,
                engVacuumBoostL:       null, // guage
                engVacuumBoostLKill:   null,
                engManifoldTempR:      null, // guage
                engManifoldTempRKill:  null,
                engManifoldTempL:      null, // guage
                engManifoldTempLKill:  null,
                engineManifoldVac:     null, //       *
                // Compressor
                compressorModel:       '',
                compressorSerial:      '',   //       *
                suctionPressure:       null, // guage *
                compInterPress1:       null, // guage
                compInterPress1Low:    null,
                compInterPress1High:   null,
                compInterPress2:       null, // guage
                compInterPress2Low:    null,
                compInterPress2High:   null,
                compInterPress3:       null, // guage
                compInterPress3Low:    null,
                compInterPress3High:   null,
                dischargePressure:     null, // final *
                dischargeTemp1:        null, // guage *
                dischargeTemp2:        null, // guage *
                dischargeStg1Temp:     null,
                dischargeStg1TempKill: null,
                dischargeStg3Temp:     null,
                dischargeStg3TempKill: null,
                dischargeStg4Temp:     null,
                dischargeStg4TempKill: null,
                compressorOilPressure: null, // guage *
                compOilPressKill:      null,
                compOilTemp:           null, // guage
                compOilTempKill:       null,
                compDiffPCFilter:      null, // guage
                compDiffPCFilterKill:  null,
                flowMCF:               null, // guage *
            },

            emissionsReadings: {
                afrmvTarget:             null,
                catalystTempPre:         null,
                catalystTempPreCatKill:  null,
                catalystTempPost:        null,
                catalystTempPostCatKill: null,
                afrMake:                 '',
                afrModel:                '',
                afrSN:                   '',
                EICSCPUSoftware:         '',
                EICSDisplaySoftware:     '',
                catalystHousingMake:     '',
                catalystHousingModel:    '',
                catalystHousingSN:       '',
                catalystElementMake:     '',
                catalystElementSN1:      '',
                catalystElementSN2:      '',
                o2Sensors:               '',
                NOxSensor:               '',
                testPInchesH2O:          '',
            },

            pmChecklist: {

                killSettings: {
                    highSuctionKill:       null,
                    highDischargeKill:     null,
                    lowSuctionKill:        null,
                    lowDischargeKill:      null,
                    highDischargeTempKill: null,
                },
                taskList:     [],
                engineChecks: {
                    battery:             false,
                    capAndRotor:         false,
                    airFilter:           false,
                    oilAndFilters:       false,
                    magPickup:           false,
                    belts:               false,
                    guardsAndBrackets:   false,
                    sparkPlugs:          false,
                    plugWires:           false,
                    driveLine:           false,
                    batteryNa:           false,
                    capAndRotorNa:       false,
                    airFilterNa:         false,
                    oilAndFiltersNa:     false,
                    magPickupNa:         false,
                    beltsNa:             false,
                    guardsAndBracketsNa: false,
                    sparkPlugsNa:        false,
                    plugWiresNa:         false,
                    driveLineNa:         false,
                },

                generalChecks: {
                    kills:                  false,
                    airHoses:               false,
                    coolerForCracks:        false,
                    coolerLouverMovement:   false,
                    coolerLouverCleaned:    false,
                    pressureReliefValve:    false,
                    scrubberDump:           false,
                    plugInSkid:             false,
                    filledDayTank:          false,
                    fanForCracking:         false,
                    panelWires:             false,
                    oilPumpBelt:            false,
                    killsNa:                false,
                    airHosesNa:             false,
                    coolerForCracksNa:      false,
                    coolerLouverMovementNa: false,
                    coolerLouverCleanedNa:  false,
                    pressureReliefValveNa:  false,
                    scrubberDumpNa:         false,
                    plugInSkidNa:           false,
                    filledDayTankNa:        false,
                    fanForCrackingNa:       false,
                    panelWiresNa:           false,
                    oilPumpBeltNa:          false,
                },

                fuelPressureFirstCut:  null,
                fuelPressureSecondCut: null,
                fuelPressureThirdCut:  null,
                visibleLeaksNotes:     '',
                engineCompression:     {
                    cylinder1:  null,
                    cylinder2:  null,
                    cylinder3:  null,
                    cylinder4:  null,
                    cylinder5:  null,
                    cylinder6:  null,
                    cylinder7:  null,
                    cylinder8:  null,
                    cylinder9:  null,
                    cylinder10: null,
                    cylinder11: null,
                    cylinder12: null,
                    cylinder13: null,
                    cylinder14: null,
                    cylinder15: null,
                    cylinder16: null,
                },
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
                timeAdjustmentNotes: '',
            },

            laborCodes: {
                basic: {
                    safety:        {hours: 0, minutes: 0, text: 'Safety'},
                    positiveAdj:   {hours: 0, minutes: 0, text: 'Positive Time Adjustment'},
                    negativeAdj:   {hours: 0, minutes: 0, text: 'Negative Time Adjustment'},
                    lunch:         {hours: 0, minutes: 0, text: 'Lunch'},
                    custRelations: {hours: 0, minutes: 0, text: 'Cust. Relations'},
                    telemetry:     {hours: 0, minutes: 0, text: 'Telemetry'},
                    environmental: {hours: 0, minutes: 0, text: 'Environment'},
                    diagnostic:    {hours: 0, minutes: 0, text: 'Diagnostic'},
                    serviceTravel: {hours: 0, minutes: 0, text: 'Service Travel'},
                    optimizeUnit:  {hours: 0, minutes: 0, text: 'Optimize Unit'},
                    pm:            {hours: 0, minutes: 0, text: 'PM'},
                    washUnit:      {hours: 0, minutes: 0, text: 'Wash Unit'},
                    inventory:     {hours: 0, minutes: 0, text: 'Inventory'},
                    training:      {hours: 0, minutes: 0, text: 'Training'},
                },

                engine:     {
                    oilAndFilter:    {hours: 0, minutes: 0, text: 'Oil and Filter'},
                    addOil:          {hours: 0, minutes: 0, text: 'Add Oil'},
                    compression:     {hours: 0, minutes: 0, text: 'Compression'},
                    replaceEngine:   {hours: 0, minutes: 0, text: 'Replace Engine'},
                    replaceCylHead:  {hours: 0, minutes: 0, text: 'Replace Cyl Head'},
                    coolingSystem:   {hours: 0, minutes: 0, text: 'Cooling System'},
                    fuelSystem:      {hours: 0, minutes: 0, text: 'Fuel System'},
                    ignition:        {hours: 0, minutes: 0, text: 'Ignition'},
                    starter:         {hours: 0, minutes: 0, text: 'Starter'},
                    lubrication:     {hours: 0, minutes: 0, text: 'Lubrication'},
                    exhaust:         {hours: 0, minutes: 0, text: 'Exhaust'},
                    alternator:      {hours: 0, minutes: 0, text: 'Alternator'},
                    driveOrCoupling: {hours: 0, minutes: 0, text: 'Drive or Coupling'},
                    sealsAndGaskets: {hours: 0, minutes: 0, text: 'Seals and Gaskets'},
                },
                emissions:  {
                    install: {hours: 0, minutes: 0, text: 'Install'},
                    test:    {hours: 0, minutes: 0, text: 'Test'},
                    repair:  {hours: 0, minutes: 0, text: 'Repair'},
                },
                panel:      {
                    panel:      {hours: 0, minutes: 0, text: 'Panel'},
                    electrical: {hours: 0, minutes: 0, text: 'Electrical'},
                },
                compressor: {
                    inspect: {hours: 0, minutes: 0, text: 'Inspect'},
                    replace: {hours: 0, minutes: 0, text: 'Replace'},
                    addOil:  {hours: 0, minutes: 0, text: 'Add Oil'},
                },
                cooler:     {
                    cooling: {hours: 0, minutes: 0, text: 'Cooling'},
                },
                vessel:     {
                    dumpControl:  {hours: 0, minutes: 0, text: 'Dump Control'},
                    reliefValve:  {hours: 0, minutes: 0, text: 'Relief Valve'},
                    suctionValve: {hours: 0, minutes: 0, text: 'Suction Valve'},
                },
            },
            parts:      [],

            jsa: {
                agree:                false,
                location:             '',
                customer:             '',
                descriptionOfWork:    '',
                emergencyEvac:        '',
                hazardPlanning:       '',
                techinicians:         [],
                controlsAndPractices: {
                    confinedSpaceEntry:        false,
                    spillKit:                  false,
                    restrictAccess:            false,
                    cutResistantGloves:        false,
                    ppe:                       false,
                    reviewEmergencyActionPlan: false,
                    drinkWater:                false,
                    electrician:               false,
                    heatResistantGloves:       false,
                    lockoutTagout:             false,
                    depressurize:              false,
                    chemGloves:                false,
                    siteJobOrientation:        false,
                    samplingMonitoring:        false,
                    equipmentCooldown:         false,
                    fireExtinguisher:          false,
                },
                potentialHazards:     {
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
                    confinedSpace:          false,
                },
            },
        }
    }
  
  return CommonWOFunctions;
}]);
