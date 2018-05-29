'use strict';
/*
* Helper object
* */
const User = require('../models/user'),
    PaidTimeOff = require('../models/paidTimeOff'),
    WorkOrder = require('../models/workOrder');

const taskHelper = {
    startOfDay (a) {
        const From = new Date(a)
        return new Date(From.setHours(0, 0, 0, 0))
    },

    endOfDay (b) {
        const To = new Date(b)
        return new Date(To.setHours(23, 59, 59, 999))
    },

    nineAM (b) {
        const To = new Date(b)
        return new Date(To.setHours(9, 0, 0, 0))
    },

    updateDash (obj, value, path) {
        //var stack = path.split('.');
        let stack
        if (path !== '_id') {
            if (path.split('_')) {
                stack = path.split('_')
            } else if (path.split('.')) {
                stack = path.split('.')
            }
        } else {
            // const m = [];
            stack = [].concat(path)
        }
        while (stack.length > 1) {
            obj = obj[stack.shift()]
        }
        //print(obj);
        obj[stack.shift()] = value
    },

    getUsers () {
        return new Promise((resolve, reject) => {
            User.find({}).exec()
                .then(resolve)
                .catch(reject)
        })
    },

    updateUser (username, obj) {
        return new Promise((resolve, reject) => {
            User.findOneAndUpdate({
                username,
            }, obj, {upsert: false}).exec()
                .then(resolve)
                .catch(reject)
        })
    },

    toExcelTime (d) {
        if (!d) {
            return ''
        }
        const month = (d.getMonth() + 1).toString()
        const day = (d.getDate()).toString()
        const year = (d.getFullYear()).toString()
        const time = (d.toLocaleTimeString()).toString()
        return month + '/' + day + '/' + year + ' ' + time
    },

    sanitize (str) {
        if (str) {
            str = str.replace(/(\r\n|\n|\r)/gm, ' ')
            return str.indexOf(',') === -1 ? str : '"' + str + '"'
        } else {
            return ''
        }
    },

    pad (n) {
        if (n >= 0) {
            return n > 9 ? '' + n : '0' + n
        } else {
            return n < -9 ? '' + n : '-0' + Math.abs(n)
        }
    },

    /**
     * Get the start of day of the current week.
     * To check for any WO submitted before that date
     * but synced after that date.
     */
    previousWeekEndDateAndCheckDate () {
        const now = this.startOfDay(new Date())
        let lastDay
        let checkDay
        if (now.getDay() === 6) {
            lastDay = new Date(now)
        } else {
            lastDay = new Date(now.setDate(now.getDate() - (now.getDay() + 1)))
        }

        if (now.getDay() === 0) {
            checkDay = this.nineAM(new Date(now.setDate(now.getDate() + (1 - now.getDay()))))
        } else if (now.getDay() === 6) {
            checkDay = this.nineAM(new Date(now.setDate(now.getDate() - (now.getDay() - 8))))
        } else {
            checkDay = this.nineAM(new Date(now.setDate(now.getDate() - (now.getDay() - 1))))
        }
        return {lastDay, checkDay}
    },

    /**
     * Produce to - from dates for current week Sat - Fri
     * for WO querying
     * to set the day set num = #
     * Sunday = 0
     * Monday = 1
     * Tuesday = 2
     * Wednesday = 3
     * Thursday = 4 .. so on
     * @returns {{returnStart: *, returnEnd: *}}
     */
    getToFromDates (num, num2) {
        let returnStart
        let returnEnd
        const now = new Date()
        const toStart = new Date()
        const toEnd = new Date()
        const day = now.getDay()

        toStart.setDate(now.getDate() - num2)

        returnStart = this.startOfDay(toStart)
        toEnd.setDate(now.getDate() + (num - day))
        returnEnd = this.endOfDay(toEnd)
        return {returnStart, returnEnd}
    },

    /**
     * Gets the total times for whole week
     * Sat - Fri
     * @param num
     * @returns {{returnStart: *, returnEnd: *}}
     */
    getToFromDatesNewWeek (num) {
        let returnStart
        let returnEnd
        const now = new Date()
        const toStart = new Date()
        const toEnd = new Date()
        const day = now.getDay()

        if (day > 0 && day < 6) {
            toStart.setDate(now.getDate() - day - 1)
        } else if (day === 6) {
            toStart.setDate(now.getDate())
        } else if (day === 7) {
            toStart.setDate(now.getDate() - 1)
        }

        returnStart = this.startOfDay(toStart)
        toEnd.setDate(now.getDate() + (num - day))
        returnEnd = this.endOfDay(toEnd)
        return {returnStart, returnEnd}
    },

    /**
     * Return the total work order time for a specific wo
     * @param wo
     * @returns {Promise}
     */
    getTotalLaborCodeTime (wo) {
        return new Promise((resolve, reject) => {
            try {
                const Total = {
                    hours: 0,
                    minutes: 0,
                }
                const laborCodes = Object.keys(wo.laborCodes) // basic, engine, ... so on
                laborCodes.forEach((lb) => {
                    const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]) // basic: { safety... so on
                    childLaborCodeKeys.forEach((chlb) => {
                        if (chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch') {
                            Total.hours += +wo.laborCodes[lb][chlb].hours
                            Total.minutes += +wo.laborCodes[lb][chlb].minutes
                        }
                    })
                })
                Total.hours += Total.minutes / 60
                resolve({Total})
            } catch (e) {
                return reject(e)
            }
        })
    },

    /**
     * Return the total work order time without a promise, in time and hours
     * @param wo
     */
    getTotalWOTimeNoPromise (wo) {
        try {
            const Total = {
                totalMin: 0,
                decimal: 0,
                time: '',
            }
            const laborCodes = Object.keys(wo.laborCodes) // basic, engine, ... so on
            laborCodes.forEach((lb) => {
                const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]) // basic: { safety... so on
                childLaborCodeKeys.forEach((chlb) => {
                    if (chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch') {
                        Total.totalMin += +wo.laborCodes[lb][chlb].hours * 60
                        Total.totalMin += +wo.laborCodes[lb][chlb].minutes
                    }
                })
            })
            Total.decimal = Total.totalMin / 60
            Total.time = `${this.pad(Math.floor(Total.totalMin / 60))}:${this.pad(Math.round(Total.totalMin % 60))}`
            return Total
        } catch (e) {
            throw new Error(e)
        }
    },

    /**
     * Get work order hours for date time given. Should only be a single day
     * and returns it as an object with the tech and day ant total hours
     * for that day.
     * @param user
     * @param date -> Sunday... etc {times: {}, day: 'Sunday'} like this
     * @returns {Promise}
     */
    getUserWorkOrdersHours (user, date) {
        return new Promise((resolve, reject) => {
            WorkOrder.find({
                techId: user.username,
                timeStarted: {$gte: date.times.returnStart, $lte: date.times.returnEnd},
            }).exec()
                .then((wos) => {
                    const promises = []
                    if (wos.length === 0) {
                        promises.push(new Promise((res) => res({
                            Total: {hours: 0, minutes: 0},
                        })))
                    } else {
                        wos.forEach((wo) => {
                            promises.push(this.getTotalLaborCodeTime(wo))
                        })
                    }
                    return Promise.all(promises)
                })
                .then((objArr) => {
                    if (objArr.length === 1) {
                        resolve({user, date: date, Total: objArr[0].Total.hours})
                    } else {
                        const Total = objArr.reduce((a, b) => {
                            return a + b.Total.hours
                        }, 0)
                        resolve({user, date: date, Total})
                    }
                })
                .catch(reject)
        })
    },

    getUserPTOHours (obj) {
        return new Promise((resolve, reject) => {
            PaidTimeOff.find({
                username: obj.user.username,
                DateFrom: {$gte: obj.date.times.returnStart, $lte: obj.date.times.returnEnd},
                DateTo: {$gte: obj.date.times.returnStart, $lte: obj.date.times.returnEnd},
                rejected: {$ne: true},
            }).exec()
                .then((ptos) => {
                    if (ptos.length === 0) {
                        resolve({user: obj.user, date: obj.date, Total: obj.Total})
                    } else {
                        const PTO = ptos.reduce((a, b) => {
                            return a + b.hours
                        }, 0)
                        const Total = obj.Total + +PTO
                        resolve({user: obj.user, date: obj.date, Total})
                    }
                })
                .catch(reject)
        })
    },

    /**
     * Method used for waterfall emails Should push managers techs to their supervisor
     * till there is no supervisor above
     * @param superObj
     * @param supervisor
     */
    addTechsToSupervisor (superObj, supervisor) {
        return new Promise((resolve, reject) => {
            try {
                const supervisorSuper = superObj[supervisor].SupervisorObj.supervisor // this supervisor's
                                                                                       // supervisor's username
                if (supervisorSuper) {
                    const techs = Object.keys(superObj[supervisor].techs) // all usernames of techs for that supervisor
                    // add supervisor to supervisorSuper's manages hash
                    superObj[supervisorSuper].manages[supervisor] = superObj[supervisor].SupervisorObj
                    // do the same for OrionAlerts
                    superObj['Orion'].manages[supervisor] = superObj[supervisor].SupervisorObj
                    // now push each tech to the supervisors techs
                    techs.forEach((techUsername) => {
                        if (!superObj[supervisorSuper].techs.hasOwnProperty(techUsername)) {
                            superObj[supervisorSuper].techs[techUsername] = superObj[supervisor].techs[techUsername]
                        }
                        // push to orion as well
                        if (!superObj['Orion'].techs.hasOwnProperty(techUsername)) {
                            superObj['Orion'].techs[techUsername] = superObj[supervisor].techs[techUsername]
                        }
                    })
                    return this.addTechsToSupervisor(superObj, supervisorSuper) // now do the same for the supervisor
                        .then(resolve)
                        .catch(reject)
                } else {
                    return resolve()
                }
            } catch (e) {
                reject(e)
            }
        })
    },
};

module.exports = taskHelper;
