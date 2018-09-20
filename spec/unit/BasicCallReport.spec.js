import mongoose from 'mongoose'
import CallReport from '../../lib/models/callReport'
import cloneDeep from 'lodash/cloneDeep'
import range from 'lodash/range'
import callReportFixture from '../fixture/callReport.json'
import config from '../../config'

beforeAll((done) => {
    mongoose.Promise = Promise
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
})

beforeAll(() => CallReport.remove({}))
afterAll(() => CallReport.remove({}))

describe('CallReport Units', () => {
    describe('#createDoc()', () => {
        it('should create and return a new document', () => {
            expect.assertions(3)
            return CallReport.createDoc(callReportFixture)
                .then((doc) => {
                    expect(doc.callTime).toBeInstanceOf(Date)
                    expect(doc.username).toEqual('TEST001')
                    expect(typeof doc.phoneNumber).toEqual('string')
                })
        })
    })

    describe('#fetch()', () => {
        let id

        beforeAll(() => {
            return CallReport.remove({})
                .then(() => CallReport.createDoc(callReportFixture))
                .then((doc) => {
                    id = doc._id
                })
        })

        it('should fetch one document', () => {
            expect.assertions(2)
            return CallReport.fetch(id)
                .then((doc) => {
                    expect(doc).toBeTruthy()
                    expect(doc.title).toEqual('TestTitle')
                })
        })
    })

    describe('#list()', () => {
        beforeAll(() => {
            return CallReport.remove({})
                .then(() => {
                    let phoneDocs = range(25).map(() => {
                        let f = cloneDeep(callReportFixture)
                        delete f._id
                        f.phoneNumber = '198-765-4321'
                        return f
                    })

                    let userDocs = range(25).map(() => {
                        let f = cloneDeep(callReportFixture)
                        delete f._id
                        f.username = 'Tester2'
                        return f
                    })

                    let activityDocs = range(25).map(() => {
                        let f = cloneDeep(callReportFixture)
                        delete f._id
                        f.activityType = 'golf'
                        return f
                    })

                    let dateDocs = range(25).map(() => {
                        let f = cloneDeep(callReportFixture)
                        delete f._id
                        f.callTime = new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)')
                        return f
                    })

                    return [...phoneDocs, ...userDocs, ...activityDocs, ...dateDocs]
                })
                .then(docs => CallReport.insertMany(docs))
        })

        it('should list 4 pages of 25 results', () => {
            expect.assertions(4)
            let options = {
                sort:  '-callTime',
                limit: 25,
                skip:  0,
            }

            return CallReport.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(25)
                    options.skip += 25
                    return CallReport.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(25)
                    options.skip += 25
                    return CallReport.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(25)
                    options.skip += 25
                    return CallReport.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(25)
                    return null
                })
        })

        it('shoud list callreports with specific callTime', () => {
            expect.assertions(51)
            const options = {
                sort:  '-callTime',
                to:    new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
                from:  new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
                limit: 50,
                skip:  0,
            }

            return CallReport.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(25)

                    docs.forEach((doc) => {
                        expect(doc.callTime).toBeInstanceOf(Date)
                        expect(doc.callTime)
                            .toEqual(new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'))
                    })
                })
        })
    })
})
