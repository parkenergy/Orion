
function WOs () {
    return {
        timeStarted:   null,
        timeSubmitted: null,
        timeApproved:  null,

        techId: '',
        type:   '',
        atShop: '',

        header:     {
            unitNumber:   '',
            customerName: '',
            county:       '',
            state:        '',
            leaseName:    '',
        },
        comments:   {
            indirectNotes: '',
        },
        laborCodes: {
            basic:      {
                safety:        {hours: 0, minutes: 0},
                positiveAdj:   {hours: 0, minutes: 0},
                negativeAdj:   {hours: 0, minutes: 0},
                lunch:         {hours: 0, minutes: 0},
                custRelations: {hours: 0, minutes: 0},
                telemetry:     {hours: 0, minutes: 0},
                environmental: {hours: 0, minutes: 0},
                diagnostic:    {hours: 0, minutes: 0},
                serviceTravel: {hours: 0, minutes: 0},
                optimizeUnit:  {hours: 0, minutes: 0},
                pm:            {hours: 0, minutes: 0},
                washUnit:      {hours: 0, minutes: 0},
                inventory:     {hours: 0, minutes: 0},
                training:      {hours: 0, minutes: 0},
            },
            engine:     {
                oilAndFilter:    {hours: 0, minutes: 0},
                addOil:          {hours: 0, minutes: 0},
                compression:     {hours: 0, minutes: 0},
                replaceEngine:   {hours: 0, minutes: 0},
                replaceCylHead:  {hours: 0, minutes: 0},
                coolingSystem:   {hours: 0, minutes: 0},
                fuelSystem:      {hours: 0, minutes: 0},
                ignition:        {hours: 0, minutes: 0},
                starter:         {hours: 0, minutes: 0},
                lubrication:     {hours: 0, minutes: 0},
                exhaust:         {hours: 0, minutes: 0},
                alternator:      {hours: 0, minutes: 0},
                driveOrCoupling: {hours: 0, minutes: 0},
                sealsAndGaskets: {hours: 0, minutes: 0},
            },
            emissions:  {
                install: {hours: 0, minutes: 0},
                test:    {hours: 0, minutes: 0},
                repair:  {hours: 0, minutes: 0},
            },
            panel:      {
                panel:      {hours: 0, minutes: 0},
                electrical: {hours: 0, minutes: 0},
            },
            compressor: {
                inspect: {hours: 0, minutes: 0},
                replace: {hours: 0, minutes: 0},
                addOil:  {hours: 0, minutes: 0},
            },
            cooler:     {
                cooling: {hours: 0, minutes: 0},
            },
            vessel:     {
                dumpControl:  {hours: 0, minutes: 0},
                reliefValve:  {hours: 0, minutes: 0},
                suctionValve: {hours: 0, minutes: 0},
            },

        },
    };
}

/*query = {
    '$and':
        [
            {
                '$or':
                    [
                        {'managerApproved': true},
                        {'managerApproved': false},
                        {'managerApproved': {'$exists': false}},
                        {'netsuiteSyned': true},
                    ],
            },
        ],
    'timeStarted':
        {
            '$gte': '2018-07-07T00:00:00.000Z',
            '$lte': '2018-07-13T23:59:59.999Z',
        },
};*/

module.exports = (db, query, PTOs) => {
    return new Promise((resolve, reject) => {
        const TH = require('../helpers/task_helper');
        const rmArrObjDups = require('tedb-utils').rmArrObjDups;
        const isEmpty = require('tedb-utils').isEmpty;
        let ptos = [];
        let wos = [];
        const setPTOTimeForUser = (ptos, diff, weekStart) => {
            let done = false;
            ptos.forEach((pto) => {
                if (!done) {
                    pto.ptoDays.forEach((ptoday) => {
                        if (!done && diff !== 0 && new Date(ptoday.dateOf).getTime() > weekStart) {
                            if (ptoday.hours === diff || ptoday.hours < diff) {
                                diff -= ptoday.hours;
                                ptoday.hours = 0;
                            } else { // ptoday.hours > diff
                                ptoday.hours -= diff;
                                done = true;
                            }
                        }
                    });
                }
            });
        };

        const createPTOcsvObjs = (ptos, wos, days, weekStart) => {
            return new Promise((resolve, reject) => {
                // users {} will hold, {username: hours, username: hours,...}
                if (days.length !== 7) {
                    return reject('Cannot query time that is not 7 days long for work week');
                }
                const users = {};
                days.forEach((day) => {
                    ptos.forEach((pto) => {
                        // make sure user has an hour time PTO and WO list
                        if (isEmpty(users[pto.username])) {
                            users[pto.username] = {PTOs: [], WOs: [], hours: 0, ptoTime: 0};
                        }
                        // add pto hours to total time for this user for this day
                        pto.ptoDays.forEach((ptoDay) => {
                            if (new Date(ptoDay.dateOf).getTime() >= day.start &&
                                new Date(ptoDay.dateOf).getTime() <= day.end && pto.status !==
                                'Rejected') {
                                users[pto.username].hours += ptoDay.hours;
                                users[pto.username].ptoTime += ptoDay.hours;
                            }
                        });
                    });
                    // add wo time to user
                    wos.forEach((wo) => {
                        if (isEmpty(users[wo.techId])) {
                            users[wo.techId] = {PTOs: [], WOs: [], hours: 0, ptoTime: 0};
                        }
                        if (new Date(wo.timeSubmitted).getTime() >= day.start &&
                            new Date(wo.timeSubmitted).getTime() <= day.end) {
                            users[wo.techId].hours += +wo.totalWOTimebase10;
                        }
                    });
                });
                ptos.forEach((pto) => {
                    // add PTO to user pto list
                    users[pto.username]['PTOs'].push(pto);
                });
                // array of usernames
                const USERS = Object.keys(users);
                // now loop over each user.
                USERS.forEach((user) => {
                    // make sure that pto does not add total time to be over 40
                    // can be over 40 if pto time is 0;
                    if (users[user].PTOs.length > 0 && users[user].hours > 40) {
                        const diff = users[user].hours - 40;
                        if ((diff === users[user].ptoTime) || (diff > users[user].ptoTime)) {
                            // the difference in pto time is the difference
                            // then set all pto time to 0
                            // or the diff is greater than the pto time
                            // so again remove all pto time.
                            users[user].PTOs.forEach((pto) => {
                                pto.ptoDays.forEach((ptoday) => {
                                    if (new Date(ptoday.dateOf).getTime() > weekStart) {
                                        ptoday.hours = 0;
                                    }
                                });
                            });
                        } else { // (diff < users[user].ptoTime)
                            // there is some pto time that needs to be taken
                            // from the current ptos. only subtract the diff
                            // ex: total hours - 40 = 5
                            // then 5 hours of pto needs to be removed
                            setPTOTimeForUser(users[user].PTOs, diff, weekStart);
                        }
                    }
                });
                const returnPTOs = [];
                USERS.forEach((user) => {
                    users[user].PTOs.forEach((pto) => {
                        if (pto.status !== 'Rejected') {
                            // pto.hours = 0;
                            pto.ptoDays.forEach((ptoday) => {
                                if (new Date(ptoday.dateOf).getTime() > weekStart && ptoday.hours >
                                    0) {
                                    const dateFrom = TH.startOfDay(new Date(ptoday.dateOf));
                                    const dateTo = TH.endOfDay(new Date(ptoday.dateOf));
                                    returnPTOs.push({
                                        timeStarted: dateFrom,
                                        timeEnded:   dateTo,
                                        techId:      pto.username,
                                        hours:       ptoday.hours,
                                        status:      pto.status,
                                        typeofitem:  'pto',
                                    });
                                    // pto.hours += ptoday.hours;
                                }
                            });
                            /*returnPTOs.push({
                                timeStarted: pto.DateFrom,
                                timeEnded:   pto.DateTo,
                                techId:      pto.username,
                                hours:       pto.hours,
                                status:      pto.status,
                                typeofitem:  'pto',
                            });*/
                        }
                    });
                });
                resolve(returnPTOs);
            });
        };

        try {
            db.aggregate()
                .match(query)
                .project({
                    "_id": "$_id",

                    "timeStarted":   "$timeStarted",
                    "timeSubmitted": "$timeSubmitted",

                    "type":   "$type",
                    "atShop": "$atShop",

                    "techId": "$techId",

                    "header_unitNumber":   "$header.unitNumber",
                    "header_customerName": "$header.customerName",
                    "header_county":       "$header.county",
                    "header_state":        "$header.state",
                    "header_leaseName":    "$header.leaseName",

                    "comments_indirectNotes": "$comments.indirectNotes",

                    "laborCodes_basic_safety_hours":          "$laborCodes.basic.safety.hours",
                    "laborCodes_basic_positiveAdj_hours":     "$laborCodes.basic.positiveAdj.hours",
                    "laborCodes_basic_negativeAdj_hours":     "$laborCodes.basic.negativeAdj.hours",
                    "laborCodes_basic_lunch_hours":           "$laborCodes.basic.lunch.hours",
                    "laborCodes_basic_custRelations_hours":   "$laborCodes.basic.custRelations.hours",
                    "laborCodes_basic_telemetry_hours":       "$laborCodes.basic.telemetry.hours",
                    "laborCodes_basic_environmental_hours":   "$laborCodes.basic.environmental.hours",
                    "laborCodes_basic_diagnostic_hours":      "$laborCodes.basic.diagnostic.hours",
                    "laborCodes_basic_serviceTravel_hours":   "$laborCodes.basic.serviceTravel.hours",
                    "laborCodes_basic_optimizeUnit_hours":    "$laborCodes.basic.optimizeUnit.hours",
                    "laborCodes_basic_pm_hours":              "$laborCodes.basic.pm.hours",
                    "laborCodes_basic_washUnit_hours":        "$laborCodes.basic.washUnit.hours",
                    "laborCodes_basic_inventory_hours":       "$laborCodes.basic.inventory.hours",
                    "laborCodes_basic_training_hours":        "$laborCodes.basic.training.hours",
                    "laborCodes_basic_safety_minutes":        "$laborCodes.basic.safety.minutes",
                    "laborCodes_basic_positiveAdj_minutes":   "$laborCodes.basic.positiveAdj.minutes",
                    "laborCodes_basic_negativeAdj_minutes":   "$laborCodes.basic.negativeAdj.minutes",
                    "laborCodes_basic_lunch_minutes":         "$laborCodes.basic.lunch.minutes",
                    "laborCodes_basic_custRelations_minutes": "$laborCodes.basic.custRelations.minutes",
                    "laborCodes_basic_telemetry_minutes":     "$laborCodes.basic.telemetry.minutes",
                    "laborCodes_basic_environmental_minutes": "$laborCodes.basic.environmental.minutes",
                    "laborCodes_basic_diagnostic_minutes":    "$laborCodes.basic.diagnostic.minutes",
                    "laborCodes_basic_serviceTravel_minutes": "$laborCodes.basic.serviceTravel.minutes",
                    "laborCodes_basic_optimizeUnit_minutes":  "$laborCodes.basic.optimizeUnit.minutes",
                    "laborCodes_basic_pm_minutes":            "$laborCodes.basic.pm.minutes",
                    "laborCodes_basic_washUnit_minutes":      "$laborCodes.basic.washUnit.minutes",
                    "laborCodes_basic_inventory_minutes":     "$laborCodes.basic.inventory.minutes",
                    "laborCodes_basic_training_minutes":      "$laborCodes.basic.training.minutes",

                    "laborCodes_engine_oilAndFilter_hours":      "$laborCodes.engine.oilAndFilter.hours",
                    "laborCodes_engine_addOil_hours":            "$laborCodes.engine.addOil.hours",
                    "laborCodes_engine_compression_hours":       "$laborCodes.engine.compression.hours",
                    "laborCodes_engine_replaceEngine_hours":     "$laborCodes.engine.replaceEngine.hours",
                    "laborCodes_engine_replaceCylHead_hours":    "$laborCodes.engine.replaceCylHead.hours",
                    "laborCodes_engine_coolingSystem_hours":     "$laborCodes.engine.coolingSystem.hours",
                    "laborCodes_engine_fuelSystem_hours":        "$laborCodes.engine.fuelSystem.hours",
                    "laborCodes_engine_ignition_hours":          "$laborCodes.engine.ignition.hours",
                    "laborCodes_engine_starter_hours":           "$laborCodes.engine.starter.hours",
                    "laborCodes_engine_lubrication_hours":       "$laborCodes.engine.lubrication.hours",
                    "laborCodes_engine_exhaust_hours":           "$laborCodes.engine.exhaust.hours",
                    "laborCodes_engine_alternator_hours":        "$laborCodes.engine.alternator.hours",
                    "laborCodes_engine_driveOrCoupling_hours":   "$laborCodes.engine.driveOrCoupling.hours",
                    "laborCodes_engine_sealsAndGaskets_hours":   "$laborCodes.engine.sealsAndGaskets.hours",
                    "laborCodes_engine_oilAndFilter_minutes":    "$laborCodes.engine.oilAndFilter.minutes",
                    "laborCodes_engine_addOil_minutes":          "$laborCodes.engine.addOil.minutes",
                    "laborCodes_engine_compression_minutes":     "$laborCodes.engine.compression.minutes",
                    "laborCodes_engine_replaceEngine_minutes":   "$laborCodes.engine.replaceEngine.minutes",
                    "laborCodes_engine_replaceCylHead_minutes":  "$laborCodes.engine.replaceCylHead.minutes",
                    "laborCodes_engine_coolingSystem_minutes":   "$laborCodes.engine.coolingSystem.minutes",
                    "laborCodes_engine_fuelSystem_minutes":      "$laborCodes.engine.fuelSystem.minutes",
                    "laborCodes_engine_ignition_minutes":        "$laborCodes.engine.ignition.minutes",
                    "laborCodes_engine_starter_minutes":         "$laborCodes.engine.starter.minutes",
                    "laborCodes_engine_lubrication_minutes":     "$laborCodes.engine.lubrication.minutes",
                    "laborCodes_engine_exhaust_minutes":         "$laborCodes.engine.exhaust.minutes",
                    "laborCodes_engine_alternator_minutes":      "$laborCodes.engine.alternator.minutes",
                    "laborCodes_engine_driveOrCoupling_minutes": "$laborCodes.engine.driveOrCoupling.minutes",
                    "laborCodes_engine_sealsAndGaskets_minutes": "$laborCodes.engine.sealsAndGaskets.minutes",

                    "laborCodes_emissions_install_hours":   "$laborCodes.emissions.install.hours",
                    "laborCodes_emissions_test_hours":      "$laborCodes.emissions.test.hours",
                    "laborCodes_emissions_repair_hours":    "$laborCodes.emissions.repair.hours",
                    "laborCodes_emissions_install_minutes": "$laborCodes.emissions.install.minutes",
                    "laborCodes_emissions_test_minutes":    "$laborCodes.emissions.test.minutes",
                    "laborCodes_emissions_repair_minutes":  "$laborCodes.emissions.repair.minutes",

                    "laborCodes_panel_panel_hours":        "$laborCodes.panel.panel.hours",
                    "laborCodes_panel_electrical_hours":   "$laborCodes.panel.electrical.hours",
                    "laborCodes_panel_panel_minutes":      "$laborCodes.panel.panel.minutes",
                    "laborCodes_panel_electrical_minutes": "$laborCodes.panel.electrical.minutes",

                    "laborCodes_compressor_inspect_hours":   "$laborCodes.compressor.inspect.hours",
                    "laborCodes_compressor_replace_hours":   "$laborCodes.compressor.replace.hours",
                    "laborCodes_compressor_addOil_hours":    "$laborCodes.compressor.addOil.hours",
                    "laborCodes_compressor_inspect_minutes": "$laborCodes.compressor.inspect.minutes",
                    "laborCodes_compressor_replace_minutes": "$laborCodes.compressor.replace.minutes",
                    "laborCodes_compressor_addOil_minutes":  "$laborCodes.compressor.addOil.minutes",

                    "laborCodes_cooler_cooling_hours":   "$laborCodes.cooler.cooling.hours",
                    "laborCodes_cooler_cooling_minutes": "$laborCodes.cooler.cooling.minutes",

                    "laborCodes_vessel_dumpControl_hours":    "$laborCodes.vessel.dumpControl.hours",
                    "laborCodes_vessel_reliefValve_hours":    "$laborCodes.vessel.reliefValve.hours",
                    "laborCodes_vessel_suctionValve_hours":   "$laborCodes.vessel.suctionValve.hours",
                    "laborCodes_vessel_dumpControl_minutes":  "$laborCodes.vessel.dumpControl.minutes",
                    "laborCodes_vessel_reliefValve_minutes":  "$laborCodes.vessel.reliefValve.minutes",
                    "laborCodes_vessel_suctionValve_minutes": "$laborCodes.vessel.suctionValve.minutes"
                })
                .exec()
                .then((docs) => {
                    return docs.map((doc) => {
                        const thisWo = WOs();
                        const objKeys = Object.keys(doc);
                        for (let i = 0; i < objKeys.length; i++) {
                            TH.updateDash(thisWo, doc[objKeys[i]], objKeys[i]);
                        }
                        const timeObj = TH.getTotalWOTimeNoPromise(thisWo);
                        thisWo.totalWOTimebase10 = timeObj.decimal.toFixed(2);
                        thisWo.typeofitem = 'workorder';
                        return thisWo;
                    });
                })
                .then((docs) => {
                    wos = docs;
                    return PTOs.find({
                        DateFrom: {$gte: query.timeStarted.$gte, $lte: query.timeStarted.$lte},
                    }).exec();
                })
                .then((docs) => {
                    ptos = ptos.concat(docs);
                    return PTOs.find({
                        DateTo: {$gte: query.timeStarted.$gte, $lte: query.timeStarted.$lte},
                    }).exec();
                })
                .then((docs) => {
                    ptos = rmArrObjDups(ptos.concat(docs), 'ptoId');
                    const DAYS = TH.weekDaysFromDates(new Date(query.timeStarted.$gte).getTime(),
                        new Date(query.timeStarted.$lte).getTime());
                    return createPTOcsvObjs(ptos, wos, DAYS,
                        new Date(query.timeStarted.$gte).getTime());
                })
                .then((docs) => docs.concat(wos))
                .then((docs) => {
                    return docs.reduce((csv, row) => {
                            if (row.typeofitem === 'workorder') {
                                const timeStarted = TH.toExcelTime(row.timeStarted);
                                const timeSubmitted = TH.toExcelTime(row.timeSubmitted);
                                return csv + [
                                    timeStarted,
                                    timeSubmitted,
                                    row.techId,
                                    row.totalWOTimebase10,
                                    row.type,
                                    row.atShop ? row.atShop : false,
                                    // Header
                                    row.header.unitNumber,
                                    TH.sanitize(row.header.customerName),
                                    row.header.county,
                                    row.header.state,
                                    TH.sanitize(row.header.leaseName),
                                    TH.sanitize(row.comments.indirectNotes),
                                ].join('\t') + '\n';
                            } else {
                                const Started = TH.toExcelTime(row.timeStarted);
                                const ended = TH.toExcelTime(row.timeEnded);
                                return csv + [
                                    Started,
                                    ended,
                                    row.techId,
                                    row.hours,
                                    row.status,
                                    false, // at shop
                                    '', // unit number
                                    '-', // customer name
                                    '-', // county
                                    '-', // state
                                    '-', // lease name
                                    'PTO', // notes
                                ].join('\t') + '\n';
                            }
                        },
                        'TimeStarted\tTimeSubmitted\tTechId\tTotal Hours Decimal\tType\tAtShop\tHeader.unitNumber\tHeader.customer\tHeader.county\tHeader.state\tHeader.lease\tComments.indirectNotes\n');
                })
                .then((r) => {
                    resolve(r);
                })
                .catch(reject);
        } catch (e) {
            return reject(e);
        }
    });
};
