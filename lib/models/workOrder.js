'use strict';

const mongoose   = require('mongoose'),
    _ = require('lodash'),
    autopopulate = require('mongoose-autopopulate'),
    ObjectId = mongoose.Schema.ObjectId;

// Construct Schema
const workOrderSchema = new mongoose.Schema({

    clientVersion: {type: String},
    timeStarted: {type: Date}, // Time the tech started the workorder
    timeSubmitted: {type: Date, index: true}, // Time the tech ended the workorder
    timePosted: {type: Date, default: Date.now}, // Time that the client synced the workorder to Orion
    timeApproved: {type: Date}, // Time the manager approved a workorder
    timeSynced: {type: Date}, // Time the administration submitted workorder to netsuite

    pm: {type: Boolean},
    type: {
        type: String,
        enum: ['PM', 'Trouble Call', 'New Set', 'Swap', 'Transfer', 'Release', 'Indirect', 'Corrective']
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
        // Engine
        engineModel:             {type: String},
        engineSerial:            {type: String}, //       *
        engBattery:              {type: String},
        engOilTemp:              {type: String}, // guage
        engOilTempKill:          {type: String},
        engineJWTemp:            {type: String}, // guage *
        engineJWTempKill:        {type: String},
        engineOilPressure:       {type: String}, // guage *
        engOilPressureKill:      {type: String},
        alternatorOutput:        {type: String}, // guage *
        alternatorOutputKill:    {type: String},
        hourReading:             {type: String}, // guage *
        engHourReadingKill:      {type: String},
        engAirInletTemp:         {type: String}, // guage
        engAirInletTempKill:     {type: String},
        engJWPress:              {type: String}, // guage
        engJWPressKill:          {type: String},
        engTurboExhTempR:        {type: String}, // guage
        engTurboExhTempRKill:    {type: String},
        engTurboExhTempL:        {type: String}, // guage
        engTurboExhTempLKill:    {type: String},
        engOilHours:             {type: String}, // guage
        engOilHoursKill:         {type: String},
        catalystTempPreCat:      {type: String},
        catalystTempPreCatKill:  {type: String},
        catalystTempPostCat:     {type: String},
        catalystTempPostCatKill: {type: String},
        rpm:                     {type: String}, // guage *
        rpmKill:                 {type: String},
        engFuelPress:            {type: String}, // guage
        engIgnitionTiming:       {type: String}, // guage
        engVacuumBoostR:         {type: String}, // guage
        engVacuumBoostRKill:     {type: String},
        engVacuumBoostL:         {type: String}, // guage
        engVacuumBoostLKill:     {type: String},
        engManifoldTempR:        {type: String}, // guage
        engManifoldTempRKill:    {type: String},
        engManifoldTempL:        {type: String}, // guage
        engManifoldTempLKill:    {type: String},
        engineManifoldVac:       {type: String}, //       *
        // Compressor
        compressorModel:         {type: String},
        compressorSerial:        {type: String}, //       *
        suctionPressure:         {type: String}, // guage *
        compSuctionPressLow:     {type: String},
        compSuctionPressHigh:    {type: String},
        compInterPress1:         {type: String}, // guage
        compInterPress1Low:      {type: String},
        compInterPress1High:     {type: String},
        compInterPress2:         {type: String}, // guage
        compInterPress2Low:      {type: String},
        compInterPress2High:     {type: String},
        compInterPress3:         {type: String}, // guage
        compInterPress3Low:      {type: String},
        compInterPress3High:     {type: String},
        dischargePressure:       {type: String}, // final *
        dischargePressureLow:    {type: String},
        dischargePressureHigh:   {type: String},
        compHours:               {type: String}, // guage
        compOilHours:            {type: String}, // guage
        dischargeTemp1:          {type: String}, // guage *
        dischargeTemp1Kill:      {type: String},
        dischargeTemp2:          {type: String}, // guage *
        dischargeTemp2Kill:      {type: String},
        dischargeTemp3:          {type: String}, // guage
        dischargeTemp3Kill:      {type: String},
        dischargeTemp4:          {type: String}, // guage
        dischargeTemp4Kill:      {type: String},
        dischargeTemp5:          {type: String}, // guage
        dischargeTemp5Kill:      {type: String},
        dischargeTemp6:          {type: String}, // guage
        dischargeTemp6Kill:      {type: String},
        compressorOilPressure:   {type: String}, // guage *
        compOilPressKill:        {type: String},
        compOilTemp:             {type: String}, // guage
        compOilTempKill:         {type: String},
        compWaterTemp:           {type: String}, // guage
        compWaterTempKill:       {type: String},
        compWaterPress:          {type: String}, // guage
        compWaterPressKill:      {type: String},
        compDiffPCFilter:        {type: String}, // guage
        compDiffPCFilterKill:    {type: String},
        flowMCF:                 {type: String}, // guage *
    },

    emissionsReadings: {
        afrmvTarget:          {type: String},        // *
        catalystTempPre:      {type: String},        // *
        catalystTempPost:     {type: String},        // *
        permitNumber:         {type: String},        // *
        afrMake:              {type: String},
        afrModel:             {type: String},
        afrSN:                {type: String},
        EICSCPUSoftware:      {type: String},
        EICSDisplaySoftware:  {type: String},
        catalystHousingSN:    {type: String},
        catalystHousingMake:  {type: String},
        catalystHousingModel: {type: String},
        catalystElementMake:  {type: String},
        catalystElementSN1:   {type: String},
        catalystElementSN2:   {type: String},
        o2Sensors:            {type: String},
        NOxSensor:            {type: String},
        checkEmissions:       {type: String},
        testPInchesH2O:       {type: String},
        inspectReplace:       {type: String},
    },

    pmChecklist: {
        killSettings: {
            highSuctionKill: {type: String},
            highDischargeKill: {type: String},
            lowSuctionKill: {type: String},
            lowDischargeKill: {type: String},
            highDischargeTempKill: {type: String}
        },
        engineChecks: {
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
        generalChecks: {
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
        fuelPressureFirstCut: {type: String},
        fuelPressureSecondCut: {type: String},
        visibleLeaksNotes: {type: String},
        engineCompression: {
            cylinder1: {type: String},
            cylinder2: {type: String},
            cylinder3: {type: String},
            cylinder4: {type: String},
            cylinder5: {type: String},
            cylinder6: {type: String},
            cylinder7: {type: String},
            cylinder8: {type: String}
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
