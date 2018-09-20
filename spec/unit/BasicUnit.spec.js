import mongoose from 'mongoose'
import clone from 'lodash/clone'
import County from '../../lib/models/county'
import State from '../../lib/models/state'
import WorkOrder from '../../lib/models/workOrder'
import Unit from '../../lib/models/unit'
import User from '../../lib/models/user'
import stateFixture from '../fixture/state.json'
import countyFixture from '../fixture/county.json'
import unitFixture from '../fixture/unit.json'
import userFixture from '../fixture/user.json'
import config from '../../config'

const unitF = unitFixture[0]
const userF = userFixture[0]

beforeAll((done) => {
    mongoose.Promise = Promise
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
})

describe('Unit Units', () => {
    beforeAll(() => {
        return Unit.remove({})
            .then(() => State.remove({}))
            .then(() => County.remove({}))
            .then(() => Unit.createDoc(unitF))
            .then(() => State.createDoc(stateFixture))
            .then(() => County.createDoc(countyFixture))
            .then(() => User.createDoc(userF))
            .then(() => WorkOrder.remove({}))
    })

    afterAll(() => {
        return Unit.remove({})
            .then(() => User.remove({}))
            .then(() => State.remove({}))
            .then(() => County.remove({}))
    })

    describe('#fetch()', () => {
        it('should fetch Unit by number', () => {
            expect.assertions(4)
            return Unit.fetch('123')
                .then((unit) => {
                    expect(unit).toBeTruthy()
                    expect(unit.assignedTo).toEqual('TEST001')
                    expect(unit.netsuiteId).toEqual('T123')
                    expect(unit.number).toEqual('123')
                })
        })
    })

    describe('#list', () => {
        beforeAll(() => {
            const newUser = clone(userF)
            newUser.netsuiteId = '1932'
            newUser.username = 'TEST002'
            newUser.supervisor = 'TEST003'

            const newUnit = clone(unitF)
            newUnit._id = '888888888888888888888888'
            newUnit.number = '321'
            newUnit.assignedTo = 'TEST002'
            newUnit.netsuiteId = 's987'
            newUnit.customerName = 'CUST 3210'
            return Promise.all([
                Unit.createDoc(newUnit),
                User.createDoc(newUser),
            ])
        })

        it('should list 1 Unit with limit', () => {
            expect.assertions(1)
            return Unit.list({size: 1})
                .then((units) => {
                    expect(units).toHaveLength(1)
                })
        })

        it('should list 2 units with limit', () => {
            expect.assertions(1)
            return Unit.list({size: 2})
                .then((units) => {
                    expect(units).toHaveLength(2)
                })
        })

        it('should list 1 unit by number', () => {
            expect.assertions(1)
            return Unit.list({number: '321'})
                .then((units) => {
                    expect(units[0].number).toEqual('321')
                })
        })

        it('should list 1 unit by tech', () => {
            expect.assertions(2)
            return Unit.list({tech: 'TEST002'})
                .then((units) => {
                    expect(units[0].number).toEqual('321')
                    expect(units[0].assignedTo).toEqual('TEST002')
                })
        })

        test('should list 1 unit by customer', () => {
            expect.assertions(2)
            return Unit.list({customer: 'CUST 3210'})
                .then((units) => {
                    expect(units[0].number).toEqual('321')
                    expect(units[0].customerName).toEqual('CUST 3210')
                })
        })

        it('should list 1 unit by supervisor', () => {
            expect.assertions(1)
            return Unit.list({supervisor: 'TEST002'})
                .then((units) => {
                    expect(units).toHaveLength(2)
                })
        })
    })
})
