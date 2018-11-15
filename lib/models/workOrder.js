'use strict';

const mongoose   = require('mongoose'),
    _ = require('lodash'),
    autopopulate = require('mongoose-autopopulate'),
    ObjectId = mongoose.Schema.ObjectId;

// pm task list schema
const unitModelSchema = new mongoose.Schema({
    name:       {type: String},
    internalid: {type: String},
})

// Construct Schema
const workOrderSchema = new mongoose.Schema({

    clientVersion: {type: String},
    timeStarted: {type: Date}, // Time the tech started the workorder
    timeSubmitted: {type: Date, index: true}, // Time the tech ended the workorder
    timePosted: {type: Date, default: Date.now}, // Time that the client synced the workorder to Orion
    timeApproved: {type: Date}, // Time the manager approved a workorder
    timeSynced: {type: Date}, // Time the administration submitted workorder to netsuite

    pm:  {type: Boolean}, // pm1
    pm2: {type: Boolean},
    pm3: {type: Boolean},
    pm4: {type: Boolean},
    pm5: {type: Boolean},

    type: {
        type: String,
        enum: ['PM', 'PM2', 'PM3', 'PM4', 'PM5', 'Trouble Call', 'New Set', 'Swap', 'Transfer', 'Release', 'Indirect', 'Corrective'],
    },
    atShop: {type: Boolean, default: false},

    header: {
        unitNumber: {type: String},
        unitNumberNSID: {type: String},
        customerName: {type: String, index: true},
        contactName: {type: String},
        county: {type: String},
        state: {type: String},
        leaseName: {type: String, index: true},
        rideAlong: {type: String, default: ''},
        startMileage: {type: String, default: ''},
        endMileage: {type: String, default: ''},
        applicationtype: {type: String, default: ''}
    },

    unitChangeInfo: {
        releaseDestination: {type: String, default: ''},
        transferLease: {type: String, default: ''},
        transferCounty: {type: String, default: ''},
        transferState: {type: String, default: ''},
        swapUnitNSID: {type: String, default: ''},
        swapUnitNumber: {type: String, default: ''},
        swapDestination: {type: String, default: ''},
    },

    unitOwnership: {
        isRental: {type: Boolean},
        isCustomerUnit: {type: Boolean}
    },

    billingInfo: {
        billableToCustomer: {type: Boolean},
        billed: {type: Boolean},
        warrantyWork: {type: Boolean},
        AFE: {type: Boolean},
        AFENumber: {type: String}
    },

    misc: {
        leaseNotes: {type: String},
        unitNotes: {type: String},

        typeOfAsset: {type: String},
        isUnitRunningOnDeparture: {type: Boolean}
    },

    geo: {
        type: {type: String, enum: ['Point'], default: 'Point'},
        coordinates: {
            type: [Number],
            default: [0.0, 0.0],
            validate: [
                (v) => v.length === 2,
                '{PATH} must be length of 2(long, lat)'
            ]
        }
    },

    unitReadings: {
        displayEngineModel:    {type: String, default: ''},
        displayFrameModel:     {type: String, default: ''},
        // Engine
        engineModel:           {type: String, default: ''}, // 1
        engineSerial:          {type: String, default: ''}, // 2       *
        engBattery:            {type: String, default: ''}, // 3
        engOilTemp:            {type: String, default: ''}, // 4 guage
        engOilTempKill:        {type: String, default: ''}, // 5
        engineJWTemp:          {type: String, default: ''}, // 6 guage *
        engineJWTempKill:      {type: String, default: ''}, // 7
        engineOilPressure:     {type: String, default: ''}, // 8 guage *
        engOilPressureKill:    {type: String, default: ''}, // 9
        alternatorOutput:      {type: String, default: ''}, // 10 guage *
        hourReading:           {type: String, default: ''}, // 12 guage *
        engAirInletTemp:       {type: String, default: ''}, // 14 guage
        engAirInletTempKill:   {type: String, default: ''}, // 15
        engJWPress:            {type: String, default: ''}, // 16 guage
        engJWPressKill:        {type: String, default: ''}, // 17
        engTurboExhTempR:      {type: String, default: ''}, // 18 guage
        engTurboExhTempRKill:  {type: String, default: ''}, // 19
        engTurboExhTempL:      {type: String, default: ''}, // 20 guage
        engTurboExhTempLKill:  {type: String, default: ''}, // 21
        rpm:                   {type: String, default: ''}, // 24 guage *
        engIgnitionTiming:     {type: String, default: ''}, // 27 guage
        engVacuumBoostR:       {type: String, default: ''}, // 28 guage
        engVacuumBoostRKill:   {type: String, default: ''}, // 29
        engVacuumBoostL:       {type: String, default: ''}, // 30 guage
        engVacuumBoostLKill:   {type: String, default: ''}, // 31
        engManifoldTempR:      {type: String, default: ''}, // 32 guage
        engManifoldTempRKill:  {type: String, default: ''}, // 33
        engManifoldTempL:      {type: String, default: ''}, // 34 guage
        engManifoldTempLKill:  {type: String, default: ''}, // 35
        engineManifoldVac:     {type: String, default: ''}, // 36     *
        // Compressor
        compressorModel:       {type: String, default: ''}, // 100
        compressorSerial:      {type: String, default: ''}, // 59     *
        suctionPressure:       {type: String, default: ''}, // 60 guage * kills in kill settings pm
                                                            // checklist
        // listed # stage pressure
        compInterPress1:       {type: String, default: ''}, // 63 guage
        compInterPress1Low:    {type: String, default: ''}, // 64 Kill
        compInterPress1High:   {type: String, default: ''}, // 65 kill
        compInterPress2:       {type: String, default: ''}, // 66 guage
        compInterPress2Low:    {type: String, default: ''}, // 67 kill
        compInterPress2High:   {type: String, default: ''}, // 68 kill
        compInterPress3:       {type: String, default: ''}, // 69 guage
        compInterPress3Low:    {type: String, default: ''}, // 70 kill
        compInterPress3High:   {type: String, default: ''}, // 71 kill
        dischargePressure:     {type: String, default: ''}, // 72 final * kills in kill settings pm
                                                            // checklist
        dischargeTemp1:        {type: String, default: ''}, // 77 guage * is now Left
        dischargeTemp2:        {type: String, default: ''}, // 79 guage * is now Right
        dischargeStg1Temp:     {type: String, default: ''},
        dischargeStg1TempKill: {type: String, default: ''},
        dischargeStg2Temp:     {type: String, default: ''},
        dischargeStg2TempKill: {type: String, default: ''},
        dischargeStg3Temp:     {type: String, default: ''},
        dischargeStg3TempKill: {type: String, default: ''},
        dischargeStg4Temp:     {type: String, default: ''},
        dischargeStg4TempKill: {type: String, default: ''},
        dischargeTemp4Kill:    {type: String, default: ''}, // 84
        compressorOilPressure: {type: String, default: ''}, // 89 guage *
        compOilPressKill:      {type: String, default: ''}, // 90
        compOilTemp:           {type: String, default: ''}, // 91 guage
        compOilTempKill:       {type: String, default: ''}, // 92
        compDiffPCFilter:      {type: String, default: ''}, // 97 guage
        compDiffPCFilterKill:  {type: String, default: ''}, // 98
        flowMCF:               {type: String, default: ''}, // 99 guage *
    },

    emissionsReadings: {
        afrmvTarget:             {type: String, default: ''},    // 37 *
        catalystTempPre:         {type: String, default: ''},    // 38 *
        catalystTempPreCatKill:  {type: String, default: ''}, // 39
        catalystTempPost:        {type: String, default: ''},    // 40 *
        catalystTempPostCatKill: {type: String, default: ''}, // 41
        permitNumber:            {type: String, default: ''},    // 42 *
        afrMake:                 {type: String, default: ''},    // 43
        afrModel:                {type: String, default: ''},    // 44
        afrSN:                   {type: String, default: ''},    // 45
        EICSCPUSoftware:         {type: String, default: ''},    // 46
        EICSDisplaySoftware:     {type: String, default: ''},    // 47
        catalystHousingSN:       {type: String, default: ''},    // 48
        catalystHousingMake:     {type: String, default: ''},    // 49
        catalystHousingModel:    {type: String, default: ''},    // 50
        catalystElementMake:     {type: String, default: ''},    // 51
        catalystElementSN1:      {type: String, default: ''},    // 52
        catalystElementSN2:      {type: String, default: ''},    // 53
        o2Sensors:               {type: String, default: ''},    // 54
        NOxSensor:               {type: String, default: ''},    // 55
        testPInchesH2O:          {type: String, default: ''},    // 57
    },

    pmChecklist: {
        killSettings:          {
            highSuctionKill:       {type: String, default: ''},
            highDischargeKill:     {type: String, default: ''},
            lowSuctionKill:        {type: String, default: ''},
            lowDischargeKill:      {type: String, default: ''},
            highDischargeTempKill: {type: String, default: ''},
        },
        taskList:              [],
        engineChecks:          {
            battery: {type: Boolean},
            capAndRotor: {type: Boolean},
            airFilter: {type: Boolean},
            oilAndFilters: {type: Boolean},
            magPickup: {type: Boolean},
            belts: {type: Boolean},
            guardsAndBrackets: {type: Boolean},
            sparkPlugs: {type: Boolean},
            plugWires: {type: Boolean},
            driveLine: {type: Boolean},
            batteryNa: {type: Boolean},
            capAndRotorNa: {type: Boolean},
            airFilterNa: {type: Boolean},
            oilAndFiltersNa: {type: Boolean},
            magPickupNa: {type: Boolean},
            beltsNa: {type: Boolean},
            guardsAndBracketsNa: {type: Boolean},
            sparkPlugsNa: {type: Boolean},
            plugWiresNa: {type: Boolean},
            driveLineNa: {type: Boolean}
        },
        generalChecks:         {
            kills: {type: Boolean},
            airHoses: {type: Boolean},
            coolerForCracks: {type: Boolean},
            coolerLouverMovement: {type: Boolean},
            coolerLouverCleaned: {type: Boolean},
            scrubberDump: {type: Boolean},
            plugInSkid: {type: Boolean},
            filledDayTank: {type: Boolean},
            fanForCracking: {type: Boolean},
            panelWires: {type: Boolean},
            oilPumpBelt: {type: Boolean},
            killsNa: {type: Boolean},
            airHosesNa: {type: Boolean},
            coolerForCracksNa: {type: Boolean},
            coolerLouverMovementNa: {type: Boolean},
            coolerLouverCleanedNa: {type: Boolean},
            pressureReliefValve: {type: Boolean},
            pressureReliefValveNa: {type: Boolean},
            scrubberDumpNa: {type: Boolean},
            plugInSkidNa: {type: Boolean},
            filledDayTankNa: {type: Boolean},
            fanForCrackingNa: {type: Boolean},
            panelWiresNa: {type: Boolean},
            oilPumpBeltNa: {type: Boolean}
        },
        fuelPressureFirstCut:  {type: String, default: ''},
        fuelPressureSecondCut: {type: String, default: ''},
        fuelPressureThirdCut:  {type: String, default: ''}, // new
        visibleLeaksNotes:     {type: String, default: ''},
        engineCompression:     {
            cylinder1:  {type: String, default: ''},
            cylinder2:  {type: String, default: ''},
            cylinder3:  {type: String, default: ''},
            cylinder4:  {type: String, default: ''},
            cylinder5:  {type: String, default: ''},
            cylinder6:  {type: String, default: ''},
            cylinder7:  {type: String, default: ''},
            cylinder8:  {type: String, default: ''},
            cylinder9:  {type: String, default: ''},
            cylinder10: {type: String, default: ''},
            cylinder11: {type: String, default: ''},
            cylinder12: {type: String, default: ''},
            cylinder13: {type: String, default: ''},
            cylinder14: {type: String, default: ''},
            cylinder15: {type: String, default: ''},
            cylinder16: {type: String, default: ''},
        }
    },

    comments: {
        repairsDescription: {type: String},
        repairsReason: {type: String},
        calloutReason: {type: String},
        swapReason: {type: String},
        transferReason: {type: String},
        newsetNotes: {type: String},
        releaseNotes: {type: String},
        indirectNotes: {type: String},
        timeAdjustmentNotes: {type: String}
    },

    laborCodes: {
        basic: {
            safety: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            positiveAdj: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            negativeAdj: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            lunch: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            custRelations: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            telemetry: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            environmental: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            diagnostic: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            serviceTravel: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            optimizeUnit: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            pm: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            washUnit: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            inventory: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            training: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        },

        engine: {
            oilAndFilter: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            addOil: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            compression: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            replaceEngine: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            replaceCylHead: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            coolingSystem: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            fuelSystem: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            ignition: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            starter: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            lubrication: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            exhaust: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            alternator: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            driveOrCoupling: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            },
            sealsAndGaskets: {
                hours: {type: Number, default: 0},
                minutes: {type: Number, default: 0},
                text: {type: String}
            }
        },
        emissions: {
            install: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            test: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            repair: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        },
        panel: {
            panel: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            electrical: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        },
        compressor: {
            inspect: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            replace: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            addOil: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        },
        cooler: {
            cooling: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        },
        vessel: {
            dumpControl: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            reliefValve: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}},
            suctionValve: {hours: {type: Number, default: 0}, minutes: {type: Number, default: 0}, text: {type: String}}
        }
    },

    parts: [{
        vendor: {type: String},
        number: {type: String},
        isWarranty: {type: Boolean, default: false},
        isBillable: {type: Boolean, default: false},
        isManual: {type: Boolean, default: false},
        quantity: {type: Number, required: true},
        smartPart: {type: String, default: ''},
        laborCode: String,
        cost: Number,
        description: String,
        netsuiteId: String
    }],

    jsa: {
        location: {type: String},
        customer: {type: String},
        descriptionOfWork: {type: String},
        emergencyEvac: {type: String},
        potentialHazards: {
            bodyPosition: {type: Boolean},
            pinch: {type: Boolean},
            crushOrStriking: {type: Boolean},
            sharpEdges: {type: Boolean},
            materialHandling: {type: Boolean},
            environmental: {type: Boolean},
            lifting: {type: Boolean},
            elevatedBodyTemp: {type: Boolean},
            h2s: {type: Boolean},
            hotColdSurfaces: {type: Boolean},
            laceration: {type: Boolean},
            chemExposure: {type: Boolean},
            fallFromElevation: {type: Boolean},
            slickSurfaces: {type: Boolean},
            excavation: {type: Boolean},
            slips: {type: Boolean},
            trips: {type: Boolean},
            falls: {type: Boolean},
            equipment: {type: Boolean},
            fireExplosionPotential: {type: Boolean},
            eletricShock: {type: Boolean},
            confinedSpace: {type: Boolean}
        },
        controlsAndPractices: {
            confinedSpaceEntry: {type: Boolean},
            spillKit: {type: Boolean},
            restrictAccess: {type: Boolean},
            cutResistantGloves: {type: Boolean},
            ppe: {type: Boolean},
            reviewEmergencyActionPlan: {type: Boolean},
            drinkWater: {type: Boolean},
            electrician: {type: Boolean},
            heatResistantGloves: {type: Boolean},
            lockoutTagout: {type: Boolean},
            depressurize: {type: Boolean},
            chemGloves: {type: Boolean},
            siteJobOrientation: {type: Boolean},
            samplingMonitoring: {type: Boolean},
            equipmentCooldown: {type: Boolean},
            fireExtinguisher: {type: Boolean}
        },
        hazardPlanning: {type: String},
        agree: {type: Boolean},
        techinicians: [{tech: {type: String}}]
    },

    assetType: {type: String},
    netsuiteId: {type: String, default: ''},
    netsuiteSyned: {type: Boolean, default: false},
    unitNumber: {type: String, index: true},
    // ------- UNIT SNAPSHOT - shadow unit --------------------
    unitSnapShot: {
        netsuiteId: {type: String},
        number: {type: String},
        productSeries: {type: String},
        setDate: {type: Date},
        releaseDate: {type: Date},
        geo: {
            type: {type: String, enum: ['Point']},
            coordinates: {
                type: [Number],
            }
        },
        engineSerial: {type: String},
        compressorSerial: {type: String},
        locationName: {type: String},
        legalDescription: {type: String},
        county: {
            name: {type: String},
        },
        state: {
            name: {type: String},
        },
        customerName: {type: String},
        countyName: {type: String},
        stateName: {type: String},
        assignedTo: {type: String},
        status: {type: String},
        pmCycle: {type: String},
        nextPmDate: {type: Date},
        // UNIt PM Extras
        frameModel: {type: unitModelSchema},
        engineModel: {type: unitModelSchema},
        nextPM1Date: {type: Date},
        nextPM2Date: {type: Date},
        nextPM3Date: {type: Date},
        nextPM4Date: {type: Date},
        nextPM5Date: {type: Date},
    },// ------- UNIT SNAPSHOT - shadow unit --------------------

    technician: {type: ObjectId, ref: 'Users', index: true},
    techId: {type: String, index: true},
    truckId: {type: String},
    truckNSID: {type: String},
    newEngineSerial: {type: String, default: ''},
    newCompressorSerial: {type: String, default: ''},
    version: String,
    managerApproved: {type: Boolean, default: false},
    approvedBy: {type: String}, // for reviewer id
    syncedBy: {type: String},   // for admin id when synced to netsuite

    updated_at: {type: Date, index: true, default: Date.now}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
workOrderSchema.plugin(autopopulate);

//stamp updated_at on save
workOrderSchema.pre('save', function (done) {
    this.updated_at = new Date();
    done();
});

//stamp updated_at on update
workOrderSchema.pre('update', function (done) {
    this.updated_at = new Date();
    done();
});

//Ensure order type is "pm" if `pm` is "true"
workOrderSchema.pre('save', function (next) {
    if ((!this.type || this.type === '') && this.pm) {
        this.type = 'pm';
        next();
    }
});

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
workOrderSchema.index({updated_at: 1});

workOrderSchema.index({
    'header.leaseName': 1,
    'header.customerName': 1,
    unitNumber: 1,
    techId: 1,
    updated_at: -1,
    timeSubmitted: -1,
});

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
workOrderSchema.virtual('created_at')
    .get(function () {
    return this.getCreateDate();
    });


//Ensure order type is normalized
workOrderSchema.virtual('orderType')
    .get(function () {
        if ((!this.type || this.type === '') && this.pm) {
            return 'pm';
        }
    return this.type;
    });

// Get is part billable
workOrderSchema.virtual('isPartBillable')
    .get(function () {
        for (let i = this.parts.length - 1; i >= 0; i--) {
            if (this.parts[i].isBillable) {
                return {color: '#a4cf80'};
            }
        }
    return {color: 'white'};
    });

//Create total wo time *** Only get time actually worked not pos & neg adjustments
workOrderSchema.virtual('totalWoTime')
    .get(function () {
    let totalMin = 0;
    const lc = this.laborCodes.toObject();

        //iterate laborcode categories
        _.forIn(lc, function (v) {
            //iterate laborcodes inside category
            _.forIn(v, function (v, k) {
                //subtract negative time adjustment out of totalMin
                if ((k !== 'negativeAdj') && (k !== 'positiveAdj') && (k !== 'lunch')) {
                    totalMin += v.hours * 60;
                    totalMin += v.minutes;
                }
            });
        });
        //log.trace(totalMin);

    let hrs = Math.floor(totalMin / 60);
    let min = Math.round(totalMin % 60);
    return {hours: hrs || 0, minutes: min || 0};
    });

workOrderSchema.set('toJSON', { getters: true, virtuals: true });
workOrderSchema.set('toObject', { getters: true, virtuals: true });
/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/workOrder')(workOrderSchema);


//Export model
module.exports = mongoose.model('WorkOrders', workOrderSchema);
