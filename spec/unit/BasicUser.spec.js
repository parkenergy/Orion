import mongoose from 'mongoose'
import cloneDeep from 'lodash/cloneDeep'
import User from '../../lib/models/user'
import config from '../../config'
import fixture from '../fixture/user.json'

const userF = fixture[0]

beforeAll((done) => {
    mongoose.Promise = Promise
    mongoose.connect(config.mongodb)
    mongoose.connection.on('connected', done)
})
beforeAll(() => User.remove({}))
afterAll(() => User.remove({}))

describe('User Units', () => {
    let uid, user
    describe('#createDoc()', () => {
        it('should create a user document', () => {
            expect.assertions(2)
            return User.createDoc(userF)
                .then((docs) => {
                    expect(docs).toHaveLength(1)
                    expect(docs[0].username).toEqual('TEST001')
                    uid = docs[0]._id
                    user = docs[0]
                })
        })
    })

    describe('#updateDoc()', () => {
        it('should update user document', () => {
            expect.assertions(1)
            const fix = cloneDeep(userF)
            fix.netsuiteId = '1234'
            return User.updateDoc('TEST001', fix)
                .then((doc) => {
                    expect(doc.netsuiteId).toEqual('1234')
                })
        })
    })

    describe('#fetch()', () => {
        it('should fetch user document by username', () => {
            expect.assertions(2)
            return User.fetch('TEST001')
                .then((doc) => {
                    expect(doc.username).toEqual('TEST001')
                    expect(doc.netsuiteId).toEqual('1234')
                })
        })
        it('should fetch user document by identity', () => {
            expect.assertions(3)
            return User.fetch('me', userF)
                .then((doc) => {
                    expect(doc).toBeTruthy()
                    expect(doc._id).toEqual(uid)
                    expect(doc.role).toEqual(user.role)
                })
        })
    })

    describe('#list()', () => {
        it('should fetch list of users', () => {
            expect.assertions(3)
            return User.list({})
                .then((docs) => {
                    expect(docs).toHaveLength(1)
                    expect(docs[0].username).toEqual('TEST001')
                    expect(docs[0].netsuiteId).toEqual('1234')
                })
        })
        it('should fetch list of users for supervisor', () => {
            expect.assertions(3)
            const options = {
                supervisor: 'TEST002'
            }
            return User.list(options)
                .then((docs) => {
                    expect(docs).toHaveLength(1)
                    expect(docs[0].username).toEqual('TEST001')
                    expect(docs[0].netsuiteId).toEqual('1234')
                })
        })
    })

    describe('#getTechsForSupervisor()', () => {
        it('should get 1 user for supervisor', () => {
            return User.getTechsForSupervisor('TEST002')
                .then((users) => {
                    expect(users).toBeTruthy()
                    expect(users).toHaveLength(1)
                    expect(users[0]).toEqual('TEST001')
                })
        })
    })
})
