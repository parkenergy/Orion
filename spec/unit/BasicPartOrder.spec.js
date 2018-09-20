import mongoose from 'mongoose'
import PartOrder from '../../lib/models/partOrder'
import Part from '../../lib/models/part'
import User from '../../lib/models/user'
import cloneDeep from 'lodash/cloneDeep'
import clone from 'lodash/clone'
import range from 'lodash/range'
import partOrderFixture from '../fixture/partOrder.json'
import userFixutre from '../fixture/user.json'
import partFixture from '../fixture/part.json'
import config from '../../config'

const userF = userFixutre[0]

beforeAll((done) => {
    mongoose.Promise = Promise
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
})

beforeAll(() => {
    return PartOrder.remove({})
        .then(() => User.remove({}))
        .then(() => Part.remove({}))
        .then(() => User.createDoc(userFixutre))
        .then(() => Part.createDoc(partFixture))
})

afterAll(() => {
    return PartOrder.remove({})
        .then(() => User.remove({}))
        .then(() => Part.remove({}))
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000
describe('PartOrder Units', () => {

    describe('#createDoc()', () => {
        let manualPartFixture = cloneDeep(partOrderFixture)

        it('should create a non manual partOrder document', () => {
            expect.assertions(7)
            return PartOrder.createDoc(partOrderFixture)
                .then((docs) => {
                    expect(docs[0].timeCreated).toBeInstanceOf(Date)
                    expect(docs[0].timeSubmitted).toBeInstanceOf(Date)
                    expect(docs[0]._id).toBeTruthy()
                    expect(docs[0].orderId).toBeTruthy()
                    expect(typeof docs[0].orderId).toEqual('string')
                    expect(docs[0].part).toBeInstanceOf(Object)
                    expect(docs[0].part.MPN).toEqual('111-000')
                })
        })

        it('should create a manual partOrder document', () => {
            expect.assertions(9)
            manualPartFixture.partNSID = 0
            manualPartFixture.part.isManual = true
            return PartOrder.createDoc(manualPartFixture)
                .then((docs) => {
                    expect(docs[0].timeCreated).toBeInstanceOf(Date)
                    expect(docs[0].timeSubmitted).toBeInstanceOf(Date)
                    expect(docs[0]._id).toBeTruthy()
                    expect(docs[0].orderId).toBeTruthy()
                    expect(typeof docs[0].orderId).toEqual('string')
                    expect(docs[0].part).toBeInstanceOf(Object)
                    expect(docs[0].part.MPN).toEqual('111-000')
                    expect(docs[0].partNSID).toEqual(0)
                    expect(docs[0].part.isManual).toEqual(true)
                })
        })
    })

    describe('#updateDoc()', () => {
        let orderId, updated_at, updatingDoc

        beforeEach(() => {
            return PartOrder.remove({})
                .then(() => PartOrder.createDoc(partOrderFixture))
                .then((docs) => {
                    updatingDoc = cloneDeep(docs[0])
                    updatingDoc.poNumber = '1234-5678-910'
                    updatingDoc.approvedBy = 'TEST001'
                    orderId = docs[0].orderId
                    updated_at = docs[0].updated_at
                })
        })

        afterEach(() => PartOrder.remove({}))

        it('should set timeOrdered on status change to ordered', () => {
            expect.assertions(3)
            updatingDoc.status = 'ordered'
            return PartOrder.updateDoc(orderId, updatingDoc)
                .then((doc) => {
                    expect(doc.status).toEqual('ordered')
                    expect(doc.timeOrdered).toBeInstanceOf(Date)
                    expect(doc.poNumber).toEqual('1234-5678-910')
                })
        })

        it('should set many fields on status change to completed', () => {
            expect.assertions(3)
            updatingDoc.status = 'ordered'
            return PartOrder.updateDoc(orderId, updatingDoc)
                .then((doc) => {
                    doc.status = 'completed'
                    doc.completedBy = 'TEST002'
                    return PartOrder.updateDoc(orderId, doc)
                })
                .then((doc) => {
                    expect(doc.timeComplete).toBeInstanceOf(Date)
                    expect(doc.completedBy).toEqual('TEST002')
                    expect(doc.done).toBe(true)
                })
        })

        it('should set many fields on status change to canceled', () => {
            expect.assertions(4)
            updatingDoc.status = 'shipped'
            return PartOrder.updateDoc(orderId, updatingDoc)
                .then((doc) => {
                    doc.status = 'canceled'
                    doc.completedBy = 'TEST002'
                    doc.comment = 'TestCancel'
                    doc.source = 'Orion'
                    return PartOrder.updateDoc(orderId, doc)
                })
                .then((doc) => {
                    expect(doc.timeComplete).toBeInstanceOf(Date)
                    expect(doc.comment).toEqual('TestCancel')
                    expect(doc.approvedBy).toEqual('TEST001')
                    expect(doc.done).toBe(true)
                })
        })
    })

    describe('#fetch()', () => {
        let orderId

        beforeAll(() => {
            return PartOrder.remove({})
                .then(() => PartOrder.createDoc(partOrderFixture))
                .then((docs) => {
                    orderId = docs[0].orderId
                })
        })

        it('should fetch one document', () => {
            expect.assertions(5)
            return PartOrder.fetch(orderId)
                .then((doc) => {
                    expect(doc._id).toBeTruthy()
                    expect(doc.orderId).toEqual(orderId)
                    expect(doc.timeCreated).toBeInstanceOf(Date)
                    expect(typeof doc.techId).toEqual('string')
                    expect(doc.techId).toEqual('TEST001')
                })
        })
    })

    describe('#list()', () => {
        beforeAll(() => {
            return PartOrder.remove({})
                .then(() => {

                    let pendingDateDocs = range(10).map(() => {
                        let f = cloneDeep(partOrderFixture)
                        f.techId = 'TEST003'
                        f.timeSubmitted = new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)')
                        f.status = 'pending'
                        return f
                    })

                    let completedDocs = range(10).map(() => {
                        let f = cloneDeep(partOrderFixture)
                        f.status = 'completed'
                        return f
                    })

                    let canceledDocs = range(10).map(() => {
                        let f = cloneDeep(partOrderFixture)
                        f.status = 'canceled'
                        return f
                    })

                    let shippedDocs = range(10).map(() => {
                        let f = cloneDeep(partOrderFixture)
                        f.status = 'ordered'
                        return f
                    })

                    let backorderDocs = range(10).map(() => {
                        let f = cloneDeep(partOrderFixture)
                        f.status = 'backorder'
                        return f
                    })

                    return [...pendingDateDocs,
                        ...completedDocs,
                        ...canceledDocs,
                        ...canceledDocs,
                        ...shippedDocs,
                        ...backorderDocs]
                })
                .then((docs) => PartOrder.insertMany(docs))
                .then(() => {
                    let newUser = clone(userF)
                    newUser.netsuiteId = '124566'
                    newUser.firstName = 'Find'
                    newUser.lastName = 'Me'
                    newUser.username = 'TEST003'
                    return User.createDoc(newUser)
                })
        })

        it('should list 6 pages of 10 results', () => {
            expect.assertions(6)
            let options = {
                sort:       '-timeCreated',
                supervised: ['TEST001', 'TEST003'],
                status:     {
                    pending:   true,
                    backorder: true,
                    canceled:  true,
                    ordered:   true,
                    completed: true,
                },
                size:       10,
                page:       0,
            }
            return PartOrder.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    options.page += 10
                    return PartOrder.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    options.page += 10
                    return PartOrder.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    options.page += 10
                    return PartOrder.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    options.page += 10
                    return PartOrder.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    options.page += 10
                    return PartOrder.list(options)
                })
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    return null
                })
        })

        it('should list 10 pending partOrders', () => {
            expect.assertions(11)
            const options = {
                sort:       '-timeCreated',
                supervised: ['TEST001', 'TEST003'],
                status:     {
                    pending:   true,
                    backorder: false,
                    canceled:  false,
                    ordered:   false,
                    completed: false,
                },
                size:       50,
                page:       0,
            }

            return PartOrder.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    docs.forEach((doc) => {
                        expect(doc.status).toEqual('pending')
                    })
                })
        })

        it('Should list 20 of 2 different status partOrders', () => {
            expect.assertions(61)
            const options = {
                sort:       '-timeCreated',
                supervised: ['TEST001', 'TEST003'],
                status:     {
                    pending:   true,
                    backorder: false,
                    canceled:  false,
                    ordered:   false,
                    completed: true,
                },
                size:       20,
                page:       0,
            }

            return PartOrder.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(20)
                    docs.forEach((doc) => {
                        expect(doc.status).not.toEqual('ordered')
                        expect(doc.status).not.toEqual('backorder')
                        expect(doc.status).not.toEqual('canceled')
                    })
                })
        })

        it('should list 10 partOrders with specific timeCreated', () => {
            expect.assertions(21)
            const options = {
                sort:       '-timeSubmitted',
                supervised: ['TEST001', 'TEST003'],
                to:         new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
                from:       new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
                status:     {
                    pending:   true,
                    backorder: true,
                    canceled:  true,
                    ordered:   true,
                    completed: true,
                },
                size:       60,
                page:       0,
            }

            return PartOrder.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(10)
                    docs.forEach((doc) => {
                        expect(doc.timeCreated).toBeInstanceOf(Date)
                        expect(doc.timeCreated)
                            .toEqual(new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'))
                    })
                })
        })
    })

    describe('#delete()', () => {
        let id

        beforeAll(() => {
            return PartOrder.remove({})
                .then(() => PartOrder.createDoc(partOrderFixture))
                .then((doc) => {
                    id = doc._id
                    return doc
                })
        })

        it('Should remove a partOrder', () => PartOrder.delete(id))
    })
})
