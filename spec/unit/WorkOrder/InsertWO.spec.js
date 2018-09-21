import mongoose from 'mongoose'
import WorkOrder from '../../../lib/models/workOrder'
import User from '../../../lib/models/user'
import Unit from '../../../lib/models/unit'
import State from '../../../lib/models/state'
import County from '../../../lib/models/county'
import WoTestF from '../../fixture/testWO.json'
import UserTestF from '../../fixture/testWOuser.json'
import UnitTestF from '../../fixture/testWOUnit.json'
import StateTestF from '../../fixture/testWOState.json'
import CountyTestF from '../../fixture/testWOCounty.json'
import TH from '../../../lib/helpers/task_helper'
import config from '../../../config'

const ObjectId = mongoose.Types.ObjectId
const startOfDay = TH.startOfDay
const woF = WoTestF[0]
const userF = UserTestF[0]
const unitF = UnitTestF[0]
const stateF = StateTestF[0]
const countyF = CountyTestF[0]

beforeAll((done) => {
    mongoose.Promise = Promise
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
    console.log(process.env.NODE_ENV)
})

/**
 * Make sure Data base is filled with related items
 */
beforeAll(() => {
    return WorkOrder.remove({})
        .then(() => User.remove({}))
        .then(() => Unit.remove({}))
        .then(() => County.remove({}))
        .then(() => State.remove({}))
        .then(() => {
            if (typeof stateF._id === 'string') stateF._id = ObjectId(stateF._id)

            stateF.counties.forEach((county) => {
                if (typeof county === 'string') {
                    return county = ObjectId(county)
                }
            })
            return State.createDoc(stateF)
        })
        .then(() => {
            if (typeof countyF._id === 'string') countyF._id = ObjectId(countyF._id)
            if (typeof countyF.state === 'string') countyF.state = ObjectId(countyF.state)
            return County.createDoc(countyF)
        })
        .then(() => {
            if (typeof unitF._id === 'string') unitF._id = ObjectId(unitF._id)
            if (typeof unitF.state === 'string') unitF.state = ObjectId(unitF.state)
            if (typeof unitF.county === 'string') unitF.county = ObjectId(unitF.county)

            return Unit.createDoc(unitF)
        })
        .then(() => {
            if (typeof userF._id === 'string') userF._id = ObjectId(userF._id)
            return User.createDoc(userF)
        })
        .then(() => {
            if (typeof woF.technician === 'string') woF.technician = ObjectId(woF.technician)
            if (typeof woF.jsa.techinicians[0]._id ===
                'string') woF.jsa.techinicians[0]._id = ObjectId(woF.jsa.techinicians[0]._id)
            return WorkOrder.createDoc(woF)
        })
})

afterAll(() => {
    return WorkOrder.remove({})
        .then(() => User.remove({}))
        .then(() => Unit.remove({}))
        .then(() => County.remove({}))
        .then(() => State.remove({}))
})

describe('WorkOrder Insert Scenarios', () => {

    it('should not insert duplicates', () => {
        expect.assertions(1)
        return WorkOrder.createDoc(woF)
            .then(() => WorkOrder.list({}))
            .then((docs) => {
                expect(docs).toHaveLength(1)
            })
    })

})
