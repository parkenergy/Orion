"use strict";
/*
 * Helper object
 * */
const User = require("../models/user"),
    PaidTimeOff = require("../models/paidTimeOff"),
    WorkOrder = require("../models/workOrder"),
    ChangeLog = require("../models/changeLog"),
    { diff } = require("deep-diff"),
    isEmpty = require("tedb-utils").isEmpty;

const taskHelper = {
    weekDay(dayDigit) {
        switch (dayDigit) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            default:
                return null;
        }
    },

    startOfDay(a) {
        const From = new Date(a);
        return new Date(From.setHours(0, 0, 0, 0));
    },

    midDay(a) {
        const mid = new Date(a);
        return new Date(mid.setHours(12, 0, 0, 0));
    },

    endOfDay(b) {
        const To = new Date(b);
        return new Date(To.setHours(23, 59, 59, 999));
    },

    nineAM(b) {
        const To = new Date(b);
        return new Date(To.setHours(9, 0, 0, 0));
    },
    displayLocal(date) {
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() + offset * 60 * 1000);
    },

    updateDash(obj, value, path) {
        //var stack = path.split('.');
        let stack;
        if (path !== "_id") {
            if (path.split("_")) {
                stack = path.split("_");
            } else if (path.split(".")) {
                stack = path.split(".");
            }
        } else {
            stack = [].concat(path);
        }
        while (stack.length > 1) {
            obj = obj[stack.shift()];
        }
        obj[stack.shift()] = value;
    },

    addChangeLogUser(docs, users) {
        return new Promise((resolve, reject) => {
            const changes = [];
            users.forEach(user => {
                let found = false;
                docs.forEach(doc => {
                    if (doc.netsuiteId === user.netsuiteId) {
                        found = true;
                        changes.push({
                            diff: diff(user, doc),
                            old: user.netsuiteId,
                            newDoc: doc.netsuiteId
                        });
                    }
                });
                if (!found) {
                    changes.push({
                        diff: "removed",
                        old: user.netsuiteId,
                        newDoc: null
                    });
                }
            });
            docs.forEach(doc => {
                let found = false;
                users.forEach(user => {
                    if (doc.netsuiteId === user.netsuiteId) {
                        found = true;
                    }
                });
                if (!found) {
                    changes.push({
                        diff: "added",
                        old: null,
                        newDoc: doc.netsuiteId
                    });
                }
            });
            const changeObj = {
                name: "Users",
                added: [],
                changed: [],
                removed: [],
                changeMade: new Date()
            };
            changes.forEach(change => {
                if (change.diff === "removed") {
                    changeObj.removed.push(change.old);
                }
                if (change.diff === "added") {
                    changeObj.added.push(change.newDoc);
                }
                if (
                    change.diff !== undefined &&
                    change.diff !== "removed" &&
                    change.diff !== "added"
                ) {
                    changeObj.changed.push(change.newDoc);
                }
            });
            if (
                changeObj.changed.length === 0 &&
                changeObj.removed.length === 0 &&
                changeObj.added.length === 0
            ) {
                resolve();
            } else {
                new ChangeLog(changeObj).save(err => {
                    if (err) return reject(err);
                    resolve();
                });
            }
        });
    },

    formatUserWithHours(user) {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            hours: {
                weekStart: new Date(user.hours.weekStart).getTime(),
                emailed: user.hours.emailed,
                Indirect: user.hours.Indirect,
                PM: user.hours.PM,
                Corrective: user.hours.Corrective,
                TroubleCall: user.hours.TroubleCall,
                NewSet: user.hours.NewSet,
                Transfer: user.hours.Transfer,
                Swap: user.hours.Swap,
                Release: user.hours.Release,
                Travel: user.hours.Travel,
                PTO: user.hours.PTO,
                total: user.hours.total
            },
            email: user.email === "" ? null : user.email ? user.email : null,
            supervisor: user.supervisor,
            role: user.role,
            area: user.area,
            areaId: user.areaId,
            location: user.location,
            netsuiteId: user.netsuiteId
        };
    },

    getUsers() {
        return new Promise((resolve, reject) => {
            User.find({})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    },

    updateUser(username, obj) {
        return new Promise((resolve, reject) => {
            User.findOneAndUpdate(
                {
                    username
                },
                obj,
                { upsert: false }
            )
                .exec()
                .then(resolve)
                .catch(reject);
        });
    },

    toExcelTime(d) {
        if (!d) {
            return "";
        }
        const month = (d.getMonth() + 1).toString();
        const day = d.getDate().toString();
        const year = d.getFullYear().toString();
        const time = d.toLocaleTimeString().toString();
        return month + "/" + day + "/" + year + " " + time;
    },

    sanitize(str) {
        if (str && typeof str === "string") {
            str = str.replace(/(\r\n|\n|\r)/gm, " ");
            return str.indexOf(",") === -1 ? str : '"' + str + '"';
        } else {
            return str;
        }
    },

    tabSanitize(str) {
        if (str) {
            str = str.replace(/(\r\n|\n|\r|\t)/gm, " ");
            return str;
        } else {
            return "";
        }
    },

    pad(n) {
        if (n >= 0) {
            return n > 9 ? "" + n : "0" + n;
        } else {
            return n < -9 ? "" + n : "-0" + Math.abs(n);
        }
    },

    /**
     * Get the start of day of the current week.
     * To check for any WO submitted before that date
     * but synced after that date.
     */
    previousWeekEndDateAndCheckDate() {
        const now = this.startOfDay(new Date());
        let lastDay;
        let checkDay;
        if (now.getDay() === 6) {
            lastDay = new Date(now);
        } else {
            lastDay = new Date(now.setDate(now.getDate() - (now.getDay() + 1)));
        }

        if (now.getDay() === 0) {
            checkDay = this.nineAM(
                new Date(now.setDate(now.getDate() + (1 - now.getDay())))
            );
        } else if (now.getDay() === 6) {
            checkDay = this.nineAM(
                new Date(now.setDate(now.getDate() - (now.getDay() - 8)))
            );
        } else {
            checkDay = this.nineAM(
                new Date(now.setDate(now.getDate() - (now.getDay() - 1)))
            );
        }
        return { lastDay, checkDay };
    },

    /**
     * Produce to - from dates for current week Sat - Wed
     * for WO querying
     * to set the day set num = #
     * Sunday = 0
     * Monday = 1
     * Tuesday = 2
     * Wednesday = 3
     * Thursday = 4 .. so on
     * @returns {{returnStart: *, returnEnd: *}}
     */
    getToFromDates(num, num2) {
        let returnStart;
        let returnEnd;
        const now = new Date();
        const toStart = new Date();
        const toEnd = new Date();
        const day = now.getDay();

        toStart.setDate(now.getDate() - num2);

        returnStart = this.startOfDay(toStart);
        toEnd.setDate(now.getDate() + (num - day));
        returnEnd = this.endOfDay(toEnd);
        return { returnStart, returnEnd };
    },

    weekDaysFromDates(DateFrom, DateTo) {
        const timeDiff = DateTo - DateFrom;
        const days = +(Math.round(timeDiff / 1000 / 60 / 60) / 24).toFixed(0);
        const oneDay = +(1000 * 60 * 60 * 24).toFixed(0);
        const loopDays = [];
        for (let i = 0; i < days; i++) {
            if (i === 0) {
                loopDays.push({
                    start: DateFrom,
                    end: this.endOfDay(new Date(DateFrom)).getTime()
                });
            } else {
                loopDays.push({
                    start: new Date(DateFrom + oneDay * i).getTime(),
                    end: this.endOfDay(
                        new Date(DateFrom + oneDay * i)
                    ).getTime()
                });
            }
        }
        return loopDays;
    },

    /**
     * Gets the total times for whole week
     * current week
     * Sat - Fri
     * @returns {{returnStart: *, returnEnd: *}}
     */
    getToFromDatesNewWeek() {
        let returnStart;
        let returnEnd;
        const now = new Date();
        const toStart = new Date();
        const toEnd = new Date();
        const day = now.getDay();

        if (day >= 0 && day < 6) {
            toStart.setDate(now.getDate() - day - 1);
        } else if (day === 6) {
            toStart.setDate(now.getDate());
        }

        if (day === 6) {
            toEnd.setDate(now.getDate() + day);
        } else if (day >= 0 && day < 6) {
            toEnd.setDate(now.getDate() + (5 - day));
        }

        returnStart = this.startOfDay(toStart);
        returnEnd = this.endOfDay(toEnd);
        return { returnStart, returnEnd };
        /* let returnStart;
         let returnEnd;
         const now = new Date();
         const toStart = new Date();
         const toEnd = new Date();
         const day = now.getDay();

         if (day >= 0 && day < 6) {
             toStart.setDate(now.getDate() - day - 1);
         } else if (day === 6) {
             toStart.setDate(now.getDate());
         } else if (day === 7) {
             toStart.setDate(now.getDate() - 1);
         }

         returnStart = this.startOfDay(toStart);
         toEnd.setDate(now.getDate() + (num - day));
         returnEnd = this.endOfDay(toEnd);
         return {returnStart, returnEnd};*/
    },

    /**
     * Return the total work order time for a specific wo
     * @param wo
     * @returns {Promise}
     */
    getTotalLaborCodeTime(wo) {
        return new Promise((resolve, reject) => {
            try {
                const Total = {
                    hours: 0,
                    minutes: 0
                };
                const laborCodes = Object.keys(wo.laborCodes);
                // basic - engine - compressor .etc
                                  
                laborCodes.forEach(lb => {
                    const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]);
                    // safety - training - repleace .etc depending on parent
                    childLaborCodeKeys.forEach(chlb => {
                        if (
                             chlb !== "positiveAdj" && 
                            chlb !== "negativeAdj" &&
                            chlb !== "$init" &&
                            chlb !== "lunch" &&
                            wo.laborCodes[lb][chlb].hasOwnProperty("hours")
                        ) {
                            Total.minutes +=
                                +wo.laborCodes[lb][chlb].hours * 60;
                            Total.minutes += +wo.laborCodes[lb][chlb].minutes;
                        }
                        
                    });
                });
                Total.hours = Total.minutes / 60;
                resolve({ Total });
            } catch (e) {
                return reject(e);
            }
        });
    },

    /**
     * Return the total work order time without a promise, in time and hours
     * @param wo
     */
    getTotalWOTimeNoPromise(wo) {
        try {
            const Total = {
                totalMin: 0,
                decimal: 0,
                time: ""
            };
            const laborCodes = Object.keys(wo.laborCodes);
            laborCodes.forEach(lb => {
                const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]);
                ///                     
                childLaborCodeKeys.forEach(chlb => {
                    if (
                        chlb !== "positiveAdj" &&    
                        chlb !== "negativeAdj" &&
                        chlb !== "$init" &&
                        chlb !== "lunch"
                    ) {
                        if (
                            wo.laborCodes[lb][chlb] &&
                            wo.laborCodes[lb][chlb].hours > -1 &&
                            wo.laborCodes[lb][chlb].minutes > -1
                        ) {
                            Total.totalMin +=
                                +wo.laborCodes[lb][chlb].hours * 60;
                            Total.totalMin += +wo.laborCodes[lb][chlb].minutes;
                        }
                    }
                   
                    
                });
            });
            Total.decimal = Total.totalMin / 60;
            Total.time = `${this.pad(
                Math.floor(Total.totalMin / 60)
            )}:${this.pad(Math.round(Total.totalMin % 60))}`;
            return Total;
        } catch (e) {
            throw new Error(e);
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
    getUserWorkOrdersHours(user, date) {
        return new Promise((resolve, reject) => {
            WorkOrder.find({
                techId: user.username,
                timeStarted: {
                    $gte: date.times.returnStart,
                    $lte: date.times.returnEnd
                }
            })
                .lean()
                .exec()
                .then(wos => {
                    const promises = [];
                    if (wos.length === 0) {
                        promises.push(
                            new Promise(res =>
                                res({
                                    Total: { hours: 0, minutes: 0 }
                                })
                            )
                        );
                    } else {
                        wos.forEach(wo => {
                            promises.push(this.getTotalLaborCodeTime(wo));
                        });
                    }
                    return Promise.all(promises);
                })
                .then(objArr => {
                    if (objArr.length === 1) {
                        resolve({
                            user,
                            date: date,
                            Total: objArr[0].Total.hours
                        });
                    } else {
                        const Total = objArr.reduce((acc, cur) => {
                            return acc + cur.Total.hours;
                        }, 0);
                        resolve({ user, date: date, Total });
                    }
                })
                .catch(reject);
        });
    },

    /**
     * Not a method used alone. It is used within the agenda jobs to calc the
     * total worked time for the week depending on days. Which this is to
     * total only the PTO times and add it to PTO time. This method is used
     * after the workorder time calculator. Needs to be.
     * @param obj
     * @returns {Promise<any>}
     */
    getUserPTOHours(obj) {
        return new Promise((resolve, reject) => {
            PaidTimeOff.find({
                username: obj.user.username,
                DateFrom: { $gte: obj.date.times.returnStart },
                DateTo: { $lte: obj.date.times.returnEnd },
                rejected: { $ne: true }
            })
                .exec()
                .then(ptos => {
                    if (ptos.length === 0) {
                        resolve({
                            user: obj.user,
                            date: obj.date,
                            Total: obj.Total
                        });
                    } else {
                        const Total = ptos.reduce((acc, cur) => {
                            return acc + cur.hours;
                        }, obj.Total);
                        resolve({ user: obj.user, date: obj.date, Total });
                    }
                })
                .catch(reject);
        });
    },

    /**
     * Method used for waterfall emails Should push managers techs to their
     * supervisor till there is no supervisor above
     * @param SuperObj
     * @param nonTechUsername - could be a manager or an admin
     */
    addTechsToSupervisor(SuperObj, nonTechUsername) {
        return new Promise((resolve, reject) => {
            try {
                // this nonTechUsername's supervisor's username
                const supervisorSuper =
                    SuperObj[nonTechUsername].SupervisorObj.supervisor;
                // is null once it hits the end.
                if (supervisorSuper) {
                    // all usersnames of techs for that supervisor
                    const techs = Object.keys(SuperObj[nonTechUsername].techs);
                    // add supervisor to supervisorSuper's manages hash
                    SuperObj[supervisorSuper].manages[nonTechUsername] =
                        SuperObj[nonTechUsername].SupervisorObj;
                    // do the same for OrionAlerts
                    SuperObj["Orion"].manages[nonTechUsername] =
                        SuperObj[nonTechUsername].SupervisorObj;
                    // now push each tech to the supervisors techs
                    techs.forEach(techUsername => {
                        // This managers super does not already have this techs
                        // info
                        if (
                            isEmpty(
                                SuperObj[supervisorSuper].techs[techUsername]
                            )
                        ) {
                            SuperObj[supervisorSuper].techs[techUsername] =
                                SuperObj[nonTechUsername].techs[techUsername];
                        }
                        /*if (!SuperObj[supervisorSuper].techs.hasOwnProperty(techUsername)) {
                            SuperObj[supervisorSuper].techs[techUsername] = SuperObj[nonTechUsername].techs[techUsername];
                        }*/
                        // push to orion as well
                        if (isEmpty(SuperObj["Orion"].techs[techUsername])) {
                            SuperObj["Orion"].techs[techUsername] =
                                SuperObj[nonTechUsername].techs[techUsername];
                        }
                        /*if (!SuperObj['Orion'].techs.hasOwnProperty(techUsername)) {
                            SuperObj['Orion'].techs[techUsername] = SuperObj[nonTechUsername].techs[techUsername];
                        }*/
                    });
                    // now do the same for the supervisor
                    this.addTechsToSupervisor(SuperObj, supervisorSuper)
                        .then(resolve)
                        .catch(reject);
                } else {
                    return resolve();
                }
            } catch (e) {
                return reject(e);
            }
        });
    }
};

module.exports = taskHelper;
