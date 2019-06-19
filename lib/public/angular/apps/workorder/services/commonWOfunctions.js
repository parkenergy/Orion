function CommonWOfunctions ($timeout, ObjectService, ApiRequestService) {
    const OS = ObjectService
    const ARS = ApiRequestService
    const timeout = $timeout
    return {

        /**
         *  Method used to change header information
         * depending on the type that is selected
         * @param wo - workorder
         * @param du - display unit
         * @param hu - header unit
         */
        runHeaderValidation (wo, du, hu) {
            const header = wo.header
            wo.header = null
            if (wo.type !== 'Swap') {
                this.setDisplayUnit(header.unitNumber, wo, du, hu)
                wo.comments.swapReason = ''
                wo.unitChangeInfo.swapUnitNSID = ''
                wo.unitChangeInfo.swapUnitNumber = ''
                wo.unitChangeInfo.swapDestination = ''
            }
            if (wo.type !== 'Transfer') {
                wo.unitChangeInfo.transferLease = ''
                wo.unitChangeInfo.transferCounty = ''
                wo.unitChangeInfo.transferState = ''
                wo.comments.transferReason = ''
            }
            if (wo.type !== 'Release') {
                wo.unitChangeInfo.releaseDestination = ''
            }
            timeout(() => {
                wo.header = header
            })
        },

        /**
         * Change Display and Header unit if swap is selected
         * only used in runHeaderValidation local method
         * @param number - unit number
         * @param wo - passed from parent method
         * @param du - passed from parent method
         * @param hu - passed from parent method
         */
        setDisplayUnit (number, wo, du, hu) {
            ARS.Units({regexN: number})
               .then((units) => {
                   timeout(() => {
                       du = units[0]
                       hu = units[0]
                   })
               })
               .catch((err) => console.error(err))
        },

        // Add Component Name to every part in wo -------------
        addComponentNameToParts (wo, parts) {
            if (wo.hasOwnProperty('parts')) {
                if (wo.parts.length !== 0) {
                    wo.parts.map(function (part) {
                        const netsuiteId = +part.netsuiteId
                        _.forEach(parts, function (obj) {
                            if (obj.netsuiteId === netsuiteId) {
                                part.componentName = (obj.componentName) ? obj.componentName : ''
                            }
                        })
                    })
                }
            }
            return wo
        },
        // ----------------------------------------------------

        // clear all emissions, unitReadings, pmChecklist items
        // that are not associated with this WO
        clearNoneEngineFrame (wo, woInputs) {
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
                    OS.setObjValue(wo, input.path, '')
                }
            })
            return wo
        },

        defaultWO () {
            return {
                netsuiteId:          '',
                netsuiteSyned:       false,
                truckId:             '',
                truckNSID:           '',
                unitNumber:          '',
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
                totalMileage: 0,
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
                    engBattery:            '',
                    engOilTemp:            '', // guage
                    engOilTempKill:        '',
                    engineJWTemp:          '', // guage *
                    engineJWTempKill:      '',
                    engineOilPressure:     '', // guage *
                    engOilPressureKill:    '',
                    alternatorOutput:      '', // guage *
                    hourReading:           '', // guage *
                    engAirInletTemp:       '', // guage
                    engAirInletTempKill:   '',
                    engJWPress:            '',
                    engJWPressKill:        '',
                    engTurboExhTempR:      '', // guage
                    engTurboExhTempRKill:  '',
                    engTurboExhTempL:      '', // guage
                    engTurboExhTempLKill:  '',
                    rpm:                   '', // guage *
                    engIgnitionTiming:     '', // guage
                    engVacuumBoostR:       '', // guage
                    engVacuumBoostRKill:   '',
                    engVacuumBoostL:       '', // guage
                    engVacuumBoostLKill:   '',
                    engManifoldTempR:      '', // guage
                    engManifoldTempRKill:  '',
                    engManifoldTempL:      '', // guage
                    engManifoldTempLKill:  '',
                    engineManifoldVac:     '', //       *
                    // Compressor
                    compressorModel:       '',
                    compressorSerial:      '',   //       *
                    suctionPressure:       '', // guage *
                    compInterPress1:       '', // guage
                    compInterPress1Low:    '',
                    compInterPress1High:   '',
                    compInterPress2:       '', // guage
                    compInterPress2Low:    '',
                    compInterPress2High:   '',
                    compInterPress3:       '', // guage
                    compInterPress3Low:    '',
                    compInterPress3High:   '',
                    dischargePressure:     '', // final *
                    dischargeTemp1:        '', // guage *
                    dischargeTemp2:        '', // guage *
                    dischargeStg1Temp:     '',
                    dischargeStg1TempKill: '',
                    dischargeStg3Temp:     '',
                    dischargeStg3TempKill: '',
                    dischargeStg4Temp:     '',
                    dischargeStg4TempKill: '',
                    compressorOilPressure: '', // guage *
                    compOilPressKill:      '',
                    compOilTemp:           '', // guage
                    compOilTempKill:       '',
                    compDiffPCFilter:      '', // guage
                    compDiffPCFilterKill:  '',
                    flowMCF:               '', // guage *
                },

                emissionsReadings: {
                    afrmvTarget:             '',
                    catalystTempPre:         '',
                    catalystTempPreCatKill:  '',
                    catalystTempPost:        '',
                    catalystTempPostCatKill: '',
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
                    spotCheck:               false,
                    noSpotCheck:             false, lastCalibration: null,
                    NOxGrams:                '',
                    COGrams:                 '',
                    NOxAllowable:            '',
                    COAllowable:             '',
                },

                pmChecklist: {

                    killSettings: {
                        highSuctionKill:       '',
                        highDischargeKill:     '',
                        lowSuctionKill:        '',
                        lowDischargeKill:      '',
                        highDischargeTempKill: '',
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

                    fuelPressureFirstCut:  '',
                    fuelPressureSecondCut: '',
                    fuelPressureThirdCut:  '',
                    visibleLeaksNotes:     '',
                    engineCompression:     {
                        cylinder1:  '',
                        cylinder2:  '',
                        cylinder3:  '',
                        cylinder4:  '',
                        cylinder5:  '',
                        cylinder6:  '',
                        cylinder7:  '',
                        cylinder8:  '',
                        cylinder9:  '',
                        cylinder10: '',
                        cylinder11: '',
                        cylinder12: '',
                        cylinder13: '',
                        cylinder14: '',
                        cylinder15: '',
                        cylinder16: '',
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
                        contractor:    {hours: 0, minutes: 0, text: 'Contractor'},
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
                        oilAndFilter:          {hours: 0, minutes: 0, text: 'Oil and Filter'},
                        addOil:                {hours: 0, minutes: 0, text: 'Add Oil'},
                        compression:           {hours: 0, minutes: 0, text: 'Compression'},
                        replaceEngine:         {hours: 0, minutes: 0, text: 'Replace Engine'},
                        replaceCylHead:        {hours: 0, minutes: 0, text: 'Replace Cyl Head'},
                        coolingSystem:         {hours: 0, minutes: 0, text: 'Cooling System'},
                        fuelSystem:            {hours: 0, minutes: 0, text: 'Fuel System'},
                        ignition:              {hours: 0, minutes: 0, text: 'Ignition'},
                        starter:               {hours: 0, minutes: 0, text: 'Starter'},
                        lubrication:           {hours: 0, minutes: 0, text: 'Lubrication'},
                        exhaust:               {hours: 0, minutes: 0, text: 'Exhaust'},
                        alternator:            {hours: 0, minutes: 0, text: 'Alternator'},
                        driveOrCoupling:       {hours: 0, minutes: 0, text: 'Drive or Coupling'},
                        sealsAndGaskets:       {hours: 0, minutes: 0, text: 'Seals and Gaskets'},
                        engineVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                        engineBelts:           {hours: 0, minutes: 0, text: 'Belts'},
                        harnessRepair:         {hours: 0, minutes: 0, text: 'Harness Repair'},
                        EICSSensorActuators:   {
                            hours:   0,
                            minutes: 0,
                            text:    'EICS Sensor/Actuators',
                        },
                    },
                    emissions:  {
                        install:                 {hours: 0, minutes: 0, text: 'Install'},
                        test:                    {hours: 0, minutes: 0, text: 'Test'},
                        repair:                  {hours: 0, minutes: 0, text: 'Repair'},
                        o2SensorReplace:         {hours: 0, minutes: 0, text: 'O2 Sensor Replace'},
                        catalystReplace:         {hours: 0, minutes: 0, text: 'Catalyst Replace'},
                        emissionsThermocoupling: {hours: 0, minutes: 0, text: 'Thermocoupling'},
                        exhaustGasketReplace:    {
                            hours:   0,
                            minutes: 0,
                            text:    'Exhaust Gasket Replace',
                        },
                        facilitySetup:           {hours: 0, minutes: 0, text: 'Facility Setup'},
                        adjustment:              {hours: 0, minutes: 0, text: 'Adjustment'},
                        troubleshooting:         {hours: 0, minutes: 0, text: 'Troubleshooting'},
                        standBy:                 {hours: 0, minutes: 0, text: 'Stand-by'},
                    },
                    panel:      {
                        panel:           {hours: 0, minutes: 0, text: 'Panel'},
                        electrical:      {hours: 0, minutes: 0, text: 'Electrical'},
                        wiring:          {hours: 0, minutes: 0, text: 'Wiring'},
                        conduit:         {hours: 0, minutes: 0, text: 'Conduit'},
                        gauges:          {hours: 0, minutes: 0, text: 'Gauges'},
                        panelDampners:   {hours: 0, minutes: 0, text: 'Dampners'},
                        tubing:          {hours: 0, minutes: 0, text: 'Tubing'},
                        programming:     {hours: 0, minutes: 0, text: 'Programming'},
                        annuciator:      {hours: 0, minutes: 0, text: 'Annuciator'},
                        safetyShutdowns: {hours: 0, minutes: 0, text: 'Safety Shutdowns'},
                    },
                    compressor: {
                        inspect:                   {hours: 0, minutes: 0, text: 'Inspect'},
                        replace:                   {hours: 0, minutes: 0, text: 'Replace'},
                        addOil:                    {hours: 0, minutes: 0, text: 'Add Oil'},
                        lubePump:                  {hours: 0, minutes: 0, text: 'Lube Pump'},
                        valves:                    {hours: 0, minutes: 0, text: 'Valves'},
                        alignment:                 {hours: 0, minutes: 0, text: 'Alignment'},
                        piston:                    {hours: 0, minutes: 0, text: 'Piston'},
                        packing:                   {hours: 0, minutes: 0, text: 'Packing'},
                        compressorThermocouples:   {hours: 0, minutes: 0, text: 'Thermocouples'},
                        noFlowSwitch:              {hours: 0, minutes: 0, text: 'No Flow Switch'},
                        overhaul:                  {hours: 0, minutes: 0, text: 'Overhaul'},
                        compressorVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                    },
                    cooler:     {
                        cooling:               {hours: 0, minutes: 0, text: 'Cooling'},
                        coolTubeRepair:        {hours: 0, minutes: 0, text: 'Cool Tube Repair'},
                        leakTesting:           {hours: 0, minutes: 0, text: 'Leak Testing'},
                        pluggingCoolerTube:    {hours: 0, minutes: 0, text: 'Plugging Cooler Tube'},
                        flushCooler:           {hours: 0, minutes: 0, text: 'Flush Cooler'},
                        washCooler:            {hours: 0, minutes: 0, text: 'Wash Cooler'},
                        coolerBelts:           {hours: 0, minutes: 0, text: 'Belts'},
                        shaftBearing:          {hours: 0, minutes: 0, text: 'Shaft Bearing'},
                        idlerBearing:          {hours: 0, minutes: 0, text: 'Idler Bearing'},
                        fan:                   {hours: 0, minutes: 0, text: 'Fan'},
                        shivePulley:           {hours: 0, minutes: 0, text: 'Shive Pulley'},
                        coolerVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                    },
                    vessel:     {
                        dumpControl:      {hours: 0, minutes: 0, text: 'Dump Control'},
                        reliefValve:      {hours: 0, minutes: 0, text: 'Relief Valve'},
                        suctionValve:     {hours: 0, minutes: 0, text: 'Suction Valve'},
                        dumpValve:        {hours: 0, minutes: 0, text: 'Dump Valve'},
                        piping:           {hours: 0, minutes: 0, text: 'Piping'},
                        screenWitchesHat: {hours: 0, minutes: 0, text: 'Screen/Witches Hat'},
                        vesselDampners:   {hours: 0, minutes: 0, text: 'Dampners'},
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
        },
    }
}

angular
    .module('WorkOrderApp.Services')
    .factory('CommonWOfunctions', ['$timeout', 'ObjectService', 'ApiRequestService', CommonWOfunctions])
