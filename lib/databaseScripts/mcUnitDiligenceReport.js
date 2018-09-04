module.exports = (db, query) => {
    return new Promise((resolve, reject) => {
        const TH = require('../helpers/task_helper');
        try {
            function Form () {
                return {
                    _id:                    null,
                    unitNumber:             '',
                    leaseName:              '',
                    engine:                 '',
                    engineSerialNumber:     '',
                    compressor:             '',
                    compressorSerialNumber: '',
                    reviewer:               '',
                    comments:               '',
                    suction:                null,
                    runHours:               null,
                    discharge1:             null,
                    discharge2:             null,
                    discharge3:             null,
                    applicationType:        '',
                    environmentalIssue:     false,
                    submitted:              null,
                    coords:                 [],
                    images:                 [],
                };
            }

            db.aggregate()
                .match(query)
                .project({
                    '_id':                    '$_id',
                    'unitNumber':             '$unitNumber',
                    'leaseName':              '$leaseName',
                    'engine':                 '$engine',
                    'engineSerialNumber':     '$engineSerialNumber',
                    'compressor':             '$compressor',
                    'compressorSerialNumber': '$compressorSerialNumber',
                    'reviewer':               '$reviewer',
                    'comments':               '$comments',
                    'suction':                '$suction',
                    'runHours':               '$runHours',
                    'discharge1':             '$discharge1',
                    'discharge2':             '$discharge2',
                    'discharge3':             '$discharge3',
                    'applicationType':        '$applicationType',
                    'environmentalIssue':     '$environmentalIssue',
                    'submitted':              '$submitted',
                    'coords':                 '$coords',
                    'images':                 '$images',
                })
                .exec()
                .then((docs) => {
                    return docs.map((doc) => {
                        const thisForm = Form();
                        const objKeys = Object.keys(doc);
                        for (let i = 0; i < objKeys.length; i++) {
                            TH.updateDash(thisForm, doc[objKeys[i]], objKeys[i]);
                        }
                        thisForm.latitude = doc['coords'][0];
                        thisForm.longitude = doc['coords'][1];
                        return thisForm;
                    });
                })
                .then((docs) => {
                    return docs.reduce((tsv, row) => {
                            const submitted = TH.toExcelTime(row.submitted);
                            const urls = row.images.map((img) => img.imageURL);
                            return tsv + [
                                submitted,
                                row.unitNumber,
                                row.reviewer,
                                TH.tabSanitize(row.leaseName),
                                row.engine,
                                row.engineSerialNumber,
                                row.compressor,
                                row.compressorSerialNumber,
                                row.runHours,
                                row.applicationType,
                                row.suction,
                                row.discharge1,
                                row.discharge2,
                                row.discharge3,
                                row.latitude,
                                row.longitude,
                                row.environmentalIssue,
                                TH.tabSanitize(row.comments),
                                row._id,
                            ].concat(urls).join('\t') + '\n';
                        },
                        'Submitted\tUnit Number\tReviewer\tLease Name\tEngine\tESN\tCompressor\tCSN\tRun Hours\tApp Type\tSuction\tDC1\tDC2\tDC3\tLatitude\tLongitude\tEnv Issue?\tComments\t_id\tImages\n');
                })
                .then(resolve)
                .catch(reject);
        } catch (e) {
            return reject(e);
        }
    });
};
