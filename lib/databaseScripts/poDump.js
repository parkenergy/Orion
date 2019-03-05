module.exports = (db, query) => {
    return new Promise((resolve, reject) => {
        const TH = require('../helpers/task_helper')
        try {
            const cursor = db.find(query)
                             .lean()
                             .cursor()

            let docs = []

            cursor.eachAsync((doc) => {
                      docs.push(doc)
                      return new Promise((res) => res())
                  })
                  .then(() => {
                      return docs.reduce((csv, row) => {
                          const timeCreated = TH.toExcelTime(row.timeCreated)
                          const timeSubmitted = TH.toExcelTime(row.timeSubmitted)
                          const timeOrdered = row.timeOrdered ? TH.toExcelTime(row.timeOrdered) : ''
                          const timeComplete = row.timeComplete
                              ? TH.toExcelTime(row.timeComplete)
                              : ''

                          return csv + [
                              timeCreated,
                              timeSubmitted,
                              timeOrdered,
                              timeComplete,
                              row.techId,
                              row.quantity,
                              TH.sanitize(row.part.number),
                              TH.sanitize(row.part.MPN),
                              TH.sanitize(row.part.isManual),
                              TH.sanitize(row.part.componentName),
                              TH.sanitize(row.part.description),
                              TH.sanitize(row.part.vendor),
                              TH.sanitize(row.partNSID),
                              row.status,
                              row.approvedBy,
                              row.completedBy,
                              row.originNSID,
                              row.destinationNSID,
                              TH.sanitize(row.comment),
                              row.source,
                              row.poFormID,
                              row.orderId,
                          ].join(',') + '\n'
                      }, 'created,submitted,ordered,completed,user,quantity,number,MPN,manual?,compName,description,vendor,nsid,status,approvedBy,completedBy,originNSID,destNSID,comment,source,poFormID,orderId\n')
                  })
                  .then(resolve)
                  .catch(reject)

        } catch (e) {
            return reject(e)
        }
    })
}
