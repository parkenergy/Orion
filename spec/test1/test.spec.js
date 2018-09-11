import mongoose from 'mongoose'
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

                return new Unit(unitF).save()
            })
            .then(unit => {
                unitId = unit._id
                unitDoc = unit
                return new State(stateFixture).save()
            })
            .then((state) => {
                stateDoc = state
                return new County(countyF).save()
            })
            .then((county) => {
                countyDoc = county
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
    })
})
