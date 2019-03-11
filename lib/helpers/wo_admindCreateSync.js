'use strict'
const {isEmpty} = require('tedb-utils')
const TBA = require('./tokenBasedAuthentication')
const ClientError = require('../errors/client')
const WOSync = require("./wo_SyncChecks")
const log = require('./logger')


class WOAdminSync {
    constructor (WorkOrders, data) {
        this.WorkOrders = WorkOrders
        this.data = data
        this.savedWo = null
        this.saveNew = this.saveNew.bind(this)
        this.syncNewAdmindWorkOrder = this.syncNewAdmindWorkOrder.bind(this)
        this.updateAfterAdminSync = this.updateAfterAdminSync.bind(this)
    }

    /**
     * Saves the current work order and returns the
     * new workorder from mongodb
     * @returns {Promise<any>}
     */
    saveNew() {
        return new Promise((resolve, reject) => {
            this.WorkOrders.insertMany([this.data], function (err, res) {
                if (err) {
                    return reject(err)
                }
                return resolve(res)
            })

        })
    }

    updateAfterAdminSync (doc) {
        return new Promise((resolve, reject) => {
            // if synced
            const now = new Date()
            if (!isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                doc.timeSynced = now
                doc.syncedBy = doc.approvedBy
            } else if (type === 'Indirect') {
                doc.timeSynced = now
                doc.syncedBy = doc.approvedBy
            }
            if (isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                doc.timeSynced = null
                doc.syncedBy = null
                doc.netsuiteId = ''
                doc.netsuiteSyned = false
                this.WorkOrders.findOneAndRemove({_id: doc._id})
                    .exec()
                    .then(resolve)
                    .catch(reject)
            } else {
                // still auto approve
                doc.updated_at = now
                this.WorkOrders.findByIdAndUpdate(doc._id, doc,
                    {safe: false, new: true})
                    .lean()
                    .exec()
                    .then(resolve)
                    .catch(reject)
            }
        })
    }

    /**
     * main method to save, sync, save the new workorder
     * @returns {Promise<any>}
     */
    syncNewAdmindWorkOrder() {
        return new Promise((resolve, reject) => {
            this.saveNew()
                .then((res) => {
                    this.savedWo = res[0]
                    return WOSync.syncToNetsuite(this.savedWo)
                })
                .then((res) => {
                    return this.updateAfterAdminSync(res)
                })
                .then(resolve)
                .catch(reject)
        })
    }
}

module.exports = WOAdminSync
