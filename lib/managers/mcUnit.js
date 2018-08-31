'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      isEmpty     = require('tedb-utils').isEmpty,
      ClientError = require('../errors/client');
/*

function convertedOBJs (data) {
    return data.reduce((acc, o) => {
        if (isEmpty(o)) {
            return acc;
        } else {
            o['unitNumber'] = o['Unit Number'];
            o['region'] = o['Midcon Region'];
            o['customerName'] = o['Customer Name'];
            o['leaseName'] = o['Location'];
            o['engine'] = o['Engine'];
            o['engineDOM'] = o['Engine DOM'];
            o['engineSerialNumber'] = o['ESN'];
            o['hpRange'] = o['HP Range'];
            o['compressor'] = o['Compressor'];
            o['compressorDOM'] = o['Compressor DOM'];
            o['compressorSerialNumber'] = o['Compressor SN'];
            o['cylinders'] = o['Cylinders'];
            o['stages'] = o['Stages'];
            o['trailerID'] = o['Trailer ID'];
            o['startBillingDate'] = o['Start Billing Date'];
            o['stopBillingDate'] = o['Stop Billing Date'];
            o['baseRental'] = o['Base Rental'];
            o['billingStatus'] = o['Billing Status'];
            o['acsFee'] = o['ACS Fee'];
            o['reservationStatus'] = o['Reservation Status'];
            o['application'] = o['Applicaiton'];
            o['pkgDOM'] = o['PKG DOM'];
            o['initialSetDate'] = o['Initial Set Date'];
            o['mcllcTech'] = o['MCLLC Tech'];
            o['supervisor'] = o['Supervisor'];
            o['packager'] = o['Packager'];
            o['packagerUnit'] = o['Packager Unit'];
            o['taxCode'] = o['Tax Code'];
            o['deliveryTicket'] = o['Delivery Ticket'];
            o['poNumber'] = o['PO Number'];
            return acc.concat(o);
        }
    }, []);
}
*/

module.exports = function (mcUnitSchema) {
    mcUnitSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {

            // var dat = convertedOBJs(data)

            let dataArr = [].concat(data)
            if (!data) return reject(new ClientError('Missing documents'))
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitSchema.statics.fetch = function (unitNumber) {
        return new Promise((resolve, reject) => {
            this.findOne({unitNumber})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            let q = {};
            if (options.unitNumber) {
                q.unitNumber = options.unitNumber;
            }
            const limit = options.limit || null;
            const skip = options.skip ? options.skip * limit : 0;

            this.find(q)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };
};
