import mongoose from 'mongoose'
import cloneDeep from 'lodash/cloneDeep'
import range from 'lodash/range'
import WorkOrder from '../../lib/models/workOrder'
import User from '../../lib/models/user'
import County from '../../lib/models/county'
import State from '../../lib/models/state'
import Unit from '../../lib/models/unit'
import woFixture from '../fixture/workOrder.json'
import userFixture from '../fixture/user.json'
import unitFixture from '../fixture/unit.json'
import stateFixture from '../fixture/state.json'
import countyFixture from '../fixture/county.json'
import config from '../../config'

const woF = woFixture[0]
const userF = userFixture[0]
const unitF = unitFixture[0]
const countyF = countyFixture[0]

beforeAll((done) => {
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
})
beforeAll(() => WorkOrder.remove({}))
afterAll(() => WorkOrder.remove({}))

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000
describe('WorkOrder Units', () => {
    let unitId, userId, unitDoc, userDoc, stateDoc, countyDoc
    beforeAll(() => {
        return User.remove({})
            .then(() => Unit.remove({}))
            .then(() => County.remove({}))
            .then(() => State.remove({}))
            .then(() => new User(userF).save())
            .then(user => {
                userId = user._id
                userDoc = user

                return new State(stateFixture).save()
            })
            .then(state => {
                stateDoc = state
                return new County(countyF).save()
            })
            .then((county) => {
                countyDoc = county
                return new Unit(unitF).save()
            })
            .then((unit) => {
                unitId = unit._id
                unitDoc = unit
            })
    })
    afterAll(() => {
        return User.remove({})
            .then(() => Unit.remove({}))
            .then(() => State.remove({}))
            .then(() => County.remove({}))
    })
    describe('#createDoc()', () => {
        it('should create and return new document', () => {
            expect.assertions(9)
            return WorkOrder.createDoc(woF)
                .then(doc => {
                    expect(doc).toBeTruthy()
                    expect(doc).toHaveLength(1)
                    expect(doc[0].updated_at).toBeInstanceOf(Date)
                    expect(doc[0]._id).toBeTruthy()
                    expect(doc[0].header.unitNumber).toBeTruthy()
                    expect(typeof doc[0].header.unitNumber).toBe('string')
                    expect(doc[0].header.unitNumber).toEqual('TEST1')
                    expect(doc[0].technician).toBeTruthy()
                    expect(doc[0].technician.toString()).toEqual(userId.toString())
                })
        })
    })

    describe('#updateDoc()', () => {
        let id
        beforeAll(() => {
            return WorkOrder.remove({})
                .then(() => WorkOrder.createDoc(woF))
                .then((docs) => {
                    id = docs[0]._id
                })
        })

        it('shouldupdate document', () => {
            let updated = cloneDeep(woF)
            expect.assertions(5)
            updated.header.unitNumber = 'TEST2'
            return WorkOrder.updateDoc(id, updated, userF)
                .then((doc) => {
                    expect(doc.header).toBeTruthy()
                    expect(doc._id).toBeTruthy()
                    expect(doc.header.unitNumber).toBeTruthy()
                    expect(typeof doc.header.unitNumber).toEqual('string')
                    expect(doc.header.unitNumber).toEqual('TEST2')
                })
        })
    })

    describe('#fetch()', () => {
        let id
        beforeAll(() => {
            return WorkOrder.remove({})
                .then(() => WorkOrder.createDoc(woF))
                .then((docs) => {
                    id = docs[0]._id
                })
        })

        it('should fetch one document', () => {
            expect.assertions(5)
            return WorkOrder.fetch(id)
                .then((doc) => {
                    expect(doc._id).toBeTruthy()
                    expect(doc.header).toBeTruthy()
                    expect(doc.header.unitNumber).toBeTruthy()
                    expect(typeof doc.header.unitNumber).toEqual('string')
                    expect(doc.header.unitNumber).toEqual('TEST1')
                })
        })
    })

    describe('#getUnitWorkOrder()', () => {
        const options = {
            sort: '-timeSubmitted',
            unit: '123',
            limit: 1,
            skip: 0
        }

        it('should fetch WorkOrders for Units', () => {
            return WorkOrder.getUnitWorkOrders(options)
                .then((workorders) => {
                    expect(workorders).toBeTruthy()
                    expect(workorders).toHaveLength(1)
                    expect(workorders[0].unitNumber).toEqual('123')
                })
        })
    })

    describe('#list()', () => {

        beforeAll(() => {
            return WorkOrder.remove({})
                .then(() => {
                    let unitDocs = range(25).map(() => {
                        let f = cloneDeep(woF)
                        f.unitNumber = '123TEST'
                        return f
                    })
                    let techDocs = range(25).map(() => {
                        let f = cloneDeep(woF)
                        f.techId = 'TEST003'
                        return f
                    })
                    let locDocs = range(25).map(() => {
                        let f = cloneDeep(woF)
                        f.header.leaseName = 'TESTLOC'
                        return f
                    })
                    let custDocs = range(25).map(() => {
                        let f = cloneDeep(woF)
                        f.header.customerName = 'TESTCUST'
                        return f
                    })
                    return [...unitDocs, ...techDocs, ...locDocs, ...custDocs]
                })
                .then((docs) => {
                    docs.forEach((doc) => {
                        doc.timeSubmitted = new Date()
                    })
                    return WorkOrder.createDoc(docs)
                })
                .then(() => {
                    let newUser = cloneDeep(userF)

                    newUser.netsuiteId = '12456'
                    newUser.firstName = 'Find'
                    newUser.lastName = 'Me'
                    newUser.username = 'TEST003'

                    return new User(newUser).save()
                })
        })
        it('Should list 4 pages of 25 results', () => {

            expect.assertions(5)
            let options = {
                sort:  '-updated_at',
                role: 'admin',
                unit:  null,
                tech:  null,
                supervised: ['TEST001', 'TEST003'],
                loc:   null,
                cust:  null,
                limit: 25,
                skip:  0
            }

            return WorkOrder.list(options)
                .then((docs) => {
                    expect(docs).toBeTruthy()
                    expect(docs).toHaveLength(25)
                    options.skip+=25

                    return WorkOrder.list(options)
                }).then((docs) => {
                    expect(docs).toHaveLength(25)
                    options.skip+=25

                    return WorkOrder.list(options)
                }).then((docs) => {
                    expect(docs).toHaveLength(25)
                    options.skip+=25

                    return WorkOrder.list(options)
                }).then((docs) => {
                    expect(docs).toHaveLength(25)
                })
        })

        it('Should list workorders with specific unitNumber', () => {
            expect.assertions(27)
            const options = {
                sort:  '-updated_at',
                unit:  '123TEST',
                tech:  null,
                supervised: ['TEST001', 'TEST003'],
                loc:   null,
                cust:  null,
                limit: 25,
                skip:  0
            }

            return WorkOrder.list(options)
                .then(docs => {
                    expect(docs).toBeTruthy()
                    expect(docs).toHaveLength(25)

                    docs.forEach((doc) => {
                        expect(doc.unitNumber).toEqual('123TEST')
                    })
                })
        })

        it('Should list workorders with specific technician name', () => {
            expect.assertions(27)
            const options = {
                sort:  '-updated_at',
                unit:  null,
                tech:  'find me',
                supervised: ['TEST001', 'TEST003'],
                loc:   null,
                cust:  null,
                limit: 25,
                skip:  0
            }

            return WorkOrder.list(options)
                .then((docs) => {
                    expect(docs).toBeTruthy()
                    expect(docs).toHaveLength(25)

                    docs.forEach(doc => {
                        expect(doc.techId).toEqual('TEST003')
                    })
                })
        })

        it('Should list workorders with specific leaseName', () => {
            expect.assertions(27)
            const options = {
                sort:  '-updated_at',
                unit:  null,
                tech:  null,
                supervised: ['TEST001', 'TEST003'],
                loc:   'TESTLOC',
                cust:  null,
                limit: 100,
                skip:  0
            }

            return WorkOrder.list(options)
                .then((docs) => {
                    expect(docs).toBeTruthy()
                    expect(docs).toHaveLength(25)

                    docs.forEach((doc) => {
                        expect(doc.header.leaseName).toEqual('TESTLOC')
                    })
                })
        })

        it('Should list workorders with specific customerName', () => {
            expect.assertions(27)
            const options = {
                sort:  '-updated_at',
                unit:  null,
                tech:  null,
                supervised: ['TEST001', 'TEST003'],
                loc:   null,
                cust:  'TESTCUST',
                limit: 100,
                skip:  0
            }

            return WorkOrder.list(options)
                .then((docs) => {
                    expect(docs).toBeTruthy()
                    expect(docs).toHaveLength(25)

                    docs.forEach((doc) => {
                        expect(doc.header.customerName).toEqual('TESTCUST')
                    })
                })
        })
    })

    describe('#delete()', () => {
        let id
        beforeAll(() => {
            return WorkOrder.remove({}, (err) => {
                if (err) throw err

                return WorkOrder.createDoc(woF)
                    .then((docs) => {
                        id = docs[0]._id
                        return docs
                    })
            })
        })

        it('should remove workorder', () => {
            return WorkOrder.delete(id)
                .then((res) => {
                    console.log(res)
                })
        })
    })
})
