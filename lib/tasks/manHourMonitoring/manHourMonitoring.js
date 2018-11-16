'use strict';
/*
* Man Hours monitoring email 1. Check done every 2 hours
*
* If man hours exceed 35 or 45 hours an email is sent to 2 different emails.
* Each hours should have a link to search
*
* If the hours are not there add them. Every update will update the times.
* */
const WorkOrder    = require('../../models/workOrder'),
      PaidTimeOff  = require('../../models/paidTimeOff'),
      GmailMailer  = require('../../helpers/email_helper'),
      TH           = require('../../helpers/task_helper'),
      rmArrObjDups = require('tedb-utils').rmArrObjDups;

/**
 * Produce total labor code time for a work order
 * separated into wo type catagories
 * @param wo
 * @returns {Promise}
 */
/*const getTotalLaborCodeTime = (wo) => {
    return new Promise((resolve, reject) => {
        try {
            const PM = {
                hours: 0,
                minutes: 0,
            };
            const TroubleCall = {
                hours: 0,
                minutes: 0,
            };
            const Corrective = {
                hours: 0,
                minutes: 0,
            };
            const Indirect = {
                hours: 0,
                minutes: 0,
            };
            const Travel = {
                hours: 0,
                minutes: 0,
            };
            const Transfer = {
                hours: 0,
                minutes: 0,
            };
            const Swap = {
                hours: 0,
                minutes: 0,
            };
            const NewSet = {
                hours: 0,
                minutes: 0,
            };
            const Release = {
                hours: 0,
                minutes: 0,
            };
            const laborCodeKeys = Object.keys(wo.laborCodes); // basic, engine, ... so on

            laborCodeKeys.forEach((lb) => {
                const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]); // basic: { safety... so on
                childLaborCodeKeys.forEach((chlb) => {
                    if (chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch') {
                        if (chlb === 'serviceTravel') {
                            Travel.hours += +wo.laborCodes[lb][chlb].hours;
                            Travel.minutes += +wo.laborCodes[lb][chlb].minutes;
                        } else {
                            if (wo.type === 'PM') {
                                PM.hours += +wo.laborCodes[lb][chlb].hours;
                                PM.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'Trouble Call') {
                                TroubleCall.hours += +wo.laborCodes[lb][chlb].hours;
                                TroubleCall.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'Corrective') {
                                Corrective.hours += +wo.laborCodes[lb][chlb].hours;
                                Corrective.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'Indirect') {
                                Indirect.hours += +wo.laborCodes[lb][chlb].hours;
                                Indirect.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'New Set') {
                                NewSet.hours += +wo.laborCodes[lb][chlb].hours;
                                NewSet.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'Swap') {
                                Swap.hours += +wo.laborCodes[lb][chlb].hours;
                                Swap.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else if (wo.type === 'Transfer') {
                                Transfer.hours += +wo.laborCodes[lb][chlb].hours;
                                Transfer.minutes += +wo.laborCodes[lb][chlb].minutes;
                            } else {
                                Release.hours += +wo.laborCodes[lb][chlb].hours;
                                Release.minutes += +wo.laborCodes[lb][chlb].minutes;
                            }
                        }
                    }
                });
            });
            // console.log(Indirect);
            Indirect.hours += (Indirect.minutes / 60);
            PM.hours += (PM.minutes / 60);
            Corrective.hours += (Corrective.minutes / 60);
            TroubleCall.hours += (TroubleCall.minutes / 60);
            NewSet.hours += (NewSet.minutes / 60);
            Swap.hours += (Swap.minutes / 60);
            Transfer.hours += (Transfer.minutes / 60);
            Release.hours += (Release.minutes / 60);
            Travel.hours += (Travel.minutes / 60);

            resolve({Indirect, PM, Corrective, TroubleCall, NewSet, Transfer, Swap, Release, Travel});
        } catch (e) {
            return reject(`${e}: ERROR 1`);
        }
    });
};*/

const sumPTOHours = (ptos, times, WO_LCHs) => {
    return new Promise((resolve, reject) => {
        try {
            const workDays = TH.weekDaysFromDates(times.returnStart.getTime(),
                times.returnEnd.getTime());
            let hours = 0;
            let totalWOHours = 0;
            workDays.forEach((day) => {
                ptos.forEach((pto) => {
                    pto.ptoDays.forEach((ptoDay) => {
                        if (ptoDay.dateOf.getTime() >= day.start && ptoDay.dateOf.getTime() <=
                            day.end && pto.status !== 'Rejected') {
                            let found = false;
                            WO_LCHs.forEach((wolh) => {
                                if (wolh.submitted >= day.start && wolh.submitted <= day.end) {
                                    found = true;
                                    const total = wolh.total + ptoDay.hours;
                                    const diff = 8 - total;
                                    if (diff === 0) {
                                        hours += ptoDay.hours;
                                    } else if (diff < 0) {
                                        const ptoDiff = ptoDay.hours - Math.abs(diff);
                                        if (ptoDiff >= 0) {
                                            hours += ptoDiff;
                                        }
                                    } else {
                                        hours += ptoDay.hours;
                                    }
                                }
                            });
                            if (!found) {
                                hours += ptoDay.hours;
                            }
                        }
                    });
                });
                WO_LCHs.forEach((wolh) => {
                    if (wolh.submitted >= day.start && wolh.submitted <= day.end) {
                        totalWOHours += wolh.total;
                    }
                });
            });
            if ((hours + totalWOHours) > 40) {
                const totalDiff = (hours + totalWOHours) - 40;
                if (hours === 0) {
                    resolve(hours);
                } else if (totalDiff >= hours) {
                    resolve(0);
                } else {
                    const ptoHoursDiff = hours - totalDiff;
                    resolve(ptoHoursDiff);
                }
            } else {
                resolve(hours);
            }
        } catch (e) {
            return reject(e);
        }
    });
};

const getTotalLaborCodeTimeWithDayOf = (wo) => {
    return new Promise((resolve, reject) => {
        try {
            const PM = {
                hours:   0,
                minutes: 0,
            };
            const TroubleCall = {
                hours:   0,
                minutes: 0,
            };
            const Corrective = {
                hours:   0,
                minutes: 0,
            };
            const Indirect = {
                hours:   0,
                minutes: 0,
            };
            const Travel = {
                hours:   0,
                minutes: 0,
            };
            const Transfer = {
                hours:   0,
                minutes: 0,
            };
            const Swap = {
                hours:   0,
                minutes: 0,
            };
            const NewSet = {
                hours:   0,
                minutes: 0,
            };
            const Release = {
                hours:   0,
                minutes: 0,
            };
            const laborCodeKeys = Object.keys(wo.laborCodes); // basic, engine, ... so on
            laborCodeKeys.forEach((lb) => {
                const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]); // basic: { safety... so
                                                                           // on
                childLaborCodeKeys.forEach((chlb) => {
                    if (chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' &&
                        chlb !== 'lunch') {
                        if (chlb === 'serviceTravel') {
                            Travel.hours += +wo.laborCodes[lb][chlb].hours;
                            Travel.minutes += +wo.laborCodes[lb][chlb].minutes;
                        } else {
                            switch (wo.type) {
                                case 'PM':
                                    PM.hours += +wo.laborCodes[lb][chlb].hours;
                                    PM.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'PM2':
                                    PM.hours += +wo.laborCodes[lb][chlb].hours
                                    PM.minutes += +wo.laborCodes[lb][chlb].minutes
                                    break
                                case 'PM3':
                                    PM.hours += +wo.laborCodes[lb][chlb].hours
                                    PM.minutes += +wo.laborCodes[lb][chlb].minutes
                                    break
                                case 'PM4':
                                    PM.hours += +wo.laborCodes[lb][chlb].hours
                                    PM.minutes += +wo.laborCodes[lb][chlb].minutes
                                    break
                                case 'PM5':
                                    PM.hours += +wo.laborCodes[lb][chlb].hours
                                    PM.minutes += +wo.laborCodes[lb][chlb].minutes
                                    break
                                case 'Corrective':
                                    Corrective.hours += +wo.laborCodes[lb][chlb].hours;
                                    Corrective.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'Trouble Call':
                                    TroubleCall.hours += +wo.laborCodes[lb][chlb].hours;
                                    TroubleCall.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'New Set':
                                    NewSet.hours += +wo.laborCodes[lb][chlb].hours;
                                    NewSet.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'Swap':
                                    Swap.hours += +wo.laborCodes[lb][chlb].hours;
                                    Swap.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'Transfer':
                                    Transfer.hours += +wo.laborCodes[lb][chlb].hours;
                                    Transfer.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                case 'Release':
                                    Release.hours += +wo.laborCodes[lb][chlb].hours;
                                    Release.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                                default:
                                    Indirect.hours += +wo.laborCodes[lb][chlb].hours;
                                    Indirect.minutes += +wo.laborCodes[lb][chlb].minutes;
                                    break;
                            }
                        }
                    }
                });
            });
            Indirect.hours += (Indirect.minutes / 60);
            PM.hours += (PM.minutes / 60);
            Corrective.hours += (Corrective.minutes / 60);
            TroubleCall.hours += (TroubleCall.minutes / 60);
            NewSet.hours += (NewSet.minutes / 60);
            Swap.hours += (Swap.minutes / 60);
            Transfer.hours += (Transfer.minutes / 60);
            Release.hours += (Release.minutes / 60);
            Travel.hours += (Travel.minutes / 60);

            const total = Indirect.hours + PM.hours + Corrective.hours + TroubleCall.hours +
                NewSet.hours + Swap.hours + Transfer.hours + Release.hours + Travel.hours;
            resolve({
                Indirect,
                PM,
                Corrective,
                TroubleCall,
                NewSet,
                Transfer,
                Swap,
                Release,
                Travel,
                total,
                submitted: new Date(wo.timeSubmitted).getTime(),
            });
        } catch (e) {
            return reject(`${e}: Error getTWOT 1`);
        }
    });
};

const getUserWOandPTOHours = (user, times) => {
    return new Promise((resolve, reject) => {
        // first get all WOs
        let TotalHoursObj;
        let WOS = [];
        let PTOS = [];
        WorkOrder.find({
                techId:      user.username,
                timeStarted: {$gte: times.returnStart, $lte: times.returnEnd},
            })
            .lean()
            .exec()
            // loop through WOs and create obj array with times,
            // types, and timeSubmitted as a number
            .then((wos) => {
                if (wos.length === 0) {
                    return null;
                } else {
                    return Promise.all(wos.map((wo) => getTotalLaborCodeTimeWithDayOf(wo)));
                }
            })
            .then((woTimeObjArray) => {
                if (woTimeObjArray !== null) {
                    WOS = WOS.concat(woTimeObjArray);
                }
                if (woTimeObjArray === null) {
                    TotalHoursObj = {
                        user,
                        times,
                        Indirect:    0,
                        PM:          0,
                        Corrective:  0,
                        TroubleCall: 0,
                        Transfer:    0,
                        Swap:        0,
                        NewSet:      0,
                        Release:     0,
                        Travel:      0,
                        PTO:         0,
                    };
                } else if (woTimeObjArray.length === 1) {
                    TotalHoursObj = {
                        user,
                        times,
                        Indirect:    woTimeObjArray[0].Indirect.hours,
                        PM:          woTimeObjArray[0].PM.hours,
                        Corrective:  woTimeObjArray[0].Corrective.hours,
                        TroubleCall: woTimeObjArray[0].TroubleCall.hours,
                        NewSet:      woTimeObjArray[0].NewSet.hours,
                        Transfer:    woTimeObjArray[0].Transfer.hours,
                        Swap:        woTimeObjArray[0].Swap.hours,
                        Release:     woTimeObjArray[0].Release.hours,
                        Travel:      woTimeObjArray[0].Travel.hours,
                        PTO:         0,
                    };
                } else {
                    const Indirect = woTimeObjArray.reduce((a, b) => {
                        return a + b.Indirect.hours;
                    }, 0);
                    const PM = woTimeObjArray.reduce((a, b) => {
                        return a + b.PM.hours;
                    }, 0);
                    const Corrective = woTimeObjArray.reduce((a, b) => {
                        return a + b.Corrective.hours;
                    }, 0);
                    const TroubleCall = woTimeObjArray.reduce((a, b) => {
                        return a + b.TroubleCall.hours;
                    }, 0);
                    const NewSet = woTimeObjArray.reduce((a, b) => {
                        return a + b.NewSet.hours;
                    }, 0);
                    const Release = woTimeObjArray.reduce((a, b) => {
                        return a + b.Release.hours;
                    }, 0);
                    const Travel = woTimeObjArray.reduce((a, b) => {
                        return a + b.Travel.hours;
                    }, 0);
                    const Transfer = woTimeObjArray.reduce((a, b) => {
                        return a + b.Transfer.hours;
                    }, 0);
                    const Swap = woTimeObjArray.reduce((a, b) => {
                        return a + b.Swap.hours;
                    }, 0);
                    TotalHoursObj = {
                        user,
                        times,
                        Indirect,
                        PM,
                        Corrective,
                        TroubleCall,
                        NewSet,
                        Transfer,
                        Swap,
                        Release,
                        Travel,
                        PTO: 0,
                    };
                }
                return PaidTimeOff.find({
                    username: user.username,
                    DateFrom: {$gte: times.returnStart},
                }).exec();
            })
            .then((ptos) => {
                PTOS = PTOS.concat(ptos);
                return PaidTimeOff.find({
                    username: user.username,
                    DateTo:   {$gte: times.returnStart},
                }).exec();
            })
            .then((ptos) => {
                // remove obj duplicates
                PTOS = rmArrObjDups(PTOS.concat(ptos), 'ptoId');
                // loop through PTO times/ptoDays and
                // adding up pto time making sure only to add up time
                // if WO time on same day does not exceed 8 hrs
                // and to prevent PTO to make work week go over
                // 40 hours.
                // return just to total hours of all pto of the
                // current week.
                return sumPTOHours(PTOS, times, WOS);
            })
            .then((PTOHours) => {
                TotalHoursObj.PTO = PTOHours;
                resolve(TotalHoursObj);
            })
            .catch(reject);
    });
};

/**
 * Only email out if matching all these tests
 * @param techObj
 * @param type
 * @returns {Promise}
 */
const doesUserNeedEmail = (techObj, type) => {
    return new Promise((resolve) => {
        if (techObj.user.hours !== null && techObj.user.hours !== undefined) {
            if (techObj.user.hours.hasOwnProperty('weekStart') && techObj.user.hours.hasOwnProperty('emailed')) {
                if (techObj.user.hours.weekStart !== null && techObj.user.hours.emailed) {
                    const weekStart = new Date(techObj.user.hours.weekStart).getTime();
                    const startTime = new Date(techObj.weekStart).getTime();
                    if (weekStart === startTime && type === techObj.user.hours.emailed) {
                        console.log(0);
                        resolve(false); // false
                    } else {
                        console.log(1);
                        resolve(true); // true
                    }
                } else {
                    console.log(2);
                    resolve(true); // true
                }
            } else {
                console.log(3);
                resolve(true); // true
            }
        } else {
            console.log(4);
            resolve(true); // true
        }
    });
};

/**
 * Hard coded array for the table fields
 * @type {[string,string,string,string,string,string,string]}
 */
const tableArray = ['PM', 'Corrective', 'TroubleCall', 'Indirect', 'Travel', 'NewSet', 'Transfer', 'Swap', 'Release', 'PTO'];

/**
 * Construct each specific row for the table and return it.
 * Need to send the object to pull items out of and the
 * array needs to be the keys for the fields values needed.
 * @param obj
 * @param array
 */

// <a href="http://orion.parkenergyservices.com/#/workorder/${obj.startTime}/${item}/${obj.user.username}">${obj[item].toFixed(2)}</a>
const renderTableRow = (obj, array) => {
    return array.map((item) => {
        let type;
        if (item === 'TroubleCall') {
            type = 'Trouble Call';
        } else if (item === 'NewSet') {
            type = 'New Set';
        } else if (item === 'Travel' || item === 'PTO') {
            return `
        <tr id="${item}">
          <td>${item}</td>
          <td>${obj[item].toFixed(2)}</td>
        </tr>
      `;
        } else {
            type = item;
        }
        return `
      <tr id="${item}">
        <td>${item}</td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v1Search/${obj.startTime}/${obj.user.username}/${type}">
${obj[item].toFixed(2)}</a>
        </td>
      </tr>
    `;
    }).join('');
};

const renderTable = (techObj) => {
    return `
    <table width="40%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        <th align="left" style="background-color: #ccc">Type</th>
        <th align="left" style="background-color: #ccc">Hours</th>
      </tr>
      ${renderTableRow(techObj, tableArray)}
      <tr>
        <td style="background-color: #ccc">Total</td>
        <td style="background-color: #ccc">
          <a href="http://orion.parkenergyservices.com/#/workorder/v1Search/${techObj.startTime}/${techObj.user.username}">${techObj.total.toFixed(2)}</a>
        </td>
      </tr>
    </table>
  `;
};


/**
 * Emailer for just to Manager
 * once done emailing update user object
 * @param manager
 * @param techObj
 * @returns {Promise}
 */
const emailManager = (manager, techObj) => {
    return new Promise((resolve, reject) => {
        const mailer = new GmailMailer();

        doesUserNeedEmail(techObj, manager ? manager.role : '')
            .then((bool) => {
                if (bool) {
                    mailer.transport.verify((err) => {
                        if (err) {
                            return reject(err);
                        } else {
                            const now = new Date().toLocaleDateString();
                            let mailOptions;
                            const managerEmail = (hasManager) => {
                                if (hasManager.email) {
                                    return hasManager.email;
                                } else {
                                    return 'orionalerts@parkenergyservices.com';
                                }
                            };
                            try {
                                const toEmail = managerEmail(manager);
                                const to = (process.env.NODE_ENV === undefined || process.env.NODE_ENV !== 'production') ? 'mwhelan@parkenergyservices.com' : toEmail;
                                mailOptions = {
                                    from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                                    subject: `Technician Time Report | ${now}`,
                                    to: to,
                                    html: `
                  <body>
                    <p>Manager: ${manager.firstName} ${manager.lastName}</p>
                    <p>Technician: ${techObj.user.firstName} ${techObj.user.lastName}</p>
                    <p>This technician has passed 35 hours in work orders this week.</p>
                    ${renderTable(techObj)}
                  </body>
                  `,
                                };
                            } catch (e) {
                                return reject(e);
                            }
                            mailer.transport.sendMail(mailOptions, (error) => {
                                if (error) {
                                    return reject(error);
                                } else {
                                    // update user
                                    return TH.updateUser(techObj.user.username, {
                                        hours: {
                                            emailed:     manager ? manager.role : '',
                                            Indirect:    techObj.Indirect,
                                            PM:          techObj.PM,
                                            Corrective:  techObj.Corrective,
                                            TroubleCall: techObj.TroubleCall,
                                            NewSet:      techObj.NewSet,
                                            Release:     techObj.Release,
                                            Transfer:    techObj.Transfer,
                                            Swap: techObj.Swap,
                                            Travel: techObj.Travel,
                                            PTO: techObj.PTO,
                                            total: techObj.total,
                                            weekStart: techObj.weekStart,
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return new Promise((res) => res());
                }
            })
            .then(resolve)
            .catch(reject);
    });
};

/**
 * Emailer used to send email to manager
 * and add CC for admins
 * once done emailing update user object
 * @param manager
 * @param admin
 * @param techObj
 * @returns {Promise}
 */
const emailManagerAdmin = (manager, admin, techObj) => {
    return new Promise((resolve, reject) => {
        const mailer = new GmailMailer();
        doesUserNeedEmail(techObj, admin.role)
            .then((bool) => {
                if (bool) {
                    mailer.transport.verify((err) => {
                        if (err) {
                            return reject(err);
                        } else {
                            const showManager = (isManager) => {
                                if (isManager) {
                                    return `<p>Manager: ${isManager.firstName} ${isManager.lastName}</p>`;
                                } else {
                                    return `<p>No Manager found for technician.</p>`;
                                }
                            };
                            const managerEmail = (hasManager) => {
                                if (hasManager.email) {
                                    return hasManager.email;
                                } else {
                                    return 'orionalerts@parkenergyservices.com';
                                }
                            };
                            let mailOptions;
                            const now = new Date().toLocaleDateString();
                            try {
                                const toEmail = managerEmail(manager);
                                const to = (process.env.NODE_ENV === undefined || process.env.NODE_ENV !== 'production') ? 'mwhelan@parkenergyservices.com' : toEmail;
                                const cc = (process.env.NODE_ENV === undefined || process.env.NODE_ENV !== 'production') ? 'mwhelan@parkenergyservices.com' : 'canderson@parkenergyservices.com';
                                mailOptions = {
                                    from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                                    subject: `Technician Time Report | ${now}`,
                                    to: to,
                                    cc: [cc],
                                    html: `
                  <body>
                    ${showManager(manager)}
                    <p>Technician: ${techObj.user.firstName} ${techObj.user.lastName}</p>
                    <p>This technician has passed or is at 45 hours in workorder time this week.</p>
                     ${renderTable(techObj)}
                  </body>
                  `,
                                };
                            } catch (e) {
                                return reject(e);
                            }
                            mailer.transport.sendMail(mailOptions, (error) => {
                                if (error) {
                                    return reject(error);
                                } else {
                                    // update user
                                    return TH.updateUser(techObj.user.username, {
                                        hours: {
                                            emailed: 'admin',
                                            Indirect: techObj.Indirect,
                                            PM: techObj.PM,
                                            Corrective: techObj.Corrective,
                                            TroubleCall: techObj.TroubleCall,
                                            NewSet: techObj.NewSet,
                                            Transfer: techObj.Transfer,
                                            Swap: techObj.Swap,
                                            Release: techObj.Release,
                                            Travel: techObj.Travel,
                                            PTO: techObj.PTO,
                                            total: techObj.total,
                                            weekStart: techObj.weekStart,
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return new Promise((res) => res());
                }
            })
            .then(resolve)
            .catch(reject);
    });
};

/**
 * Email Orion Alerts if no manage or admin is found
 * then update user object
 * @param techObj
 * @returns {Promise}
 */
const emailOrionAlerts = (techObj) => {
    return new Promise((resolve, reject) => {
        const mailer = new GmailMailer();
        doesUserNeedEmail(techObj, 'orion')
            .then((bool) => {
                if (bool) {
                    mailer.transport.verify((err) => {
                        if (err) {
                            return reject(err);
                        } else {
                            const now = new Date().toLocaleDateString();
                            let mailOptions;
                            try {
                                const to = (process.env.NODE_ENV === undefined || process.env.NODE_ENV !== 'production') ? 'mwhelan@parkenergyservices.com' : 'orionalerts@parkenergyservices.com';
                                mailOptions = {
                                    from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                                    subject: `Technician Time Report | ${now}`,
                                    to: to,
                                    html: `
                  <body>
                    <p>No manager was found or Admin</p>
                    <p>This technician has passed or is at 45 hours in workorder time this week.</p>
                     ${renderTable(techObj)}
                  </body>
                  `,
                                };
                            } catch (e) {
                                return reject(e);
                            }
                            mailer.transport.sendMail(mailOptions, (error) => {
                                if (error) {
                                    return reject(error);
                                } else {
                                    // update user
                                    return TH.updateUser(techObj.user.username, {
                                        hours: {
                                            emailed: 'orion',
                                            Indirect: techObj.Indirect,
                                            PM: techObj.PM,
                                            Corrective: techObj.Corrective,
                                            TroubleCall: techObj.TroubleCall,
                                            NewSet: techObj.NewSet,
                                            Release: techObj.Release,
                                            Transfer: techObj.Transfer,
                                            Swap: techObj.Swap,
                                            Travel: techObj.Travel,
                                            PTO: techObj.PTO,
                                            total: techObj.total,
                                            weekStart: techObj.weekStart,
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return new Promise((res) => res());
                }
            })
            .then(resolve)
            .catch(reject);
    });
};

const updateCheckUser = (promises, startTime, total, obj, managers, admin, thisUser, setStartTime) => {
    if (total >= 45) {
        console.log('total >= 45');
        if (obj.user.supervisor && admin && obj.user.hours.emailed !== 'admin') {
            const supervisor = managers[obj.user.supervisor];
            promises.push(emailManagerAdmin(supervisor, admin, {
                user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Transfer: obj.Transfer,
                Swap: obj.Swap,
                Release: obj.Release,
                Travel: obj.Travel,
                PTO: obj.PTO,
                total,
                weekStart: setStartTime ? startTime : thisUser.hours.weekStart
            }));
        } else if (!obj.user.supervisor && admin && obj.user.hours.emailed !== 'admin') {
            // email admin manager is missing
            promises.push(emailManagerAdmin(false, admin, {
                user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Transfer: obj.Transfer,
                Swap: obj.Swap,
                Release: obj.Release,
                Travel: obj.Travel,
                PTO: obj.PTO,
                total,
                weekStart: setStartTime ? startTime : thisUser.hours.weekStart
            }));
        } else if (obj.user.hours.emailed !== 'orion' && obj.user.hours.emailed !== 'admin') {
            // email orion alerts all were missing
            promises.push(emailOrionAlerts({
                user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Transfer: obj.Transfer,
                Swap: obj.Swap,
                Release: obj.Release,
                Travel: obj.Travel,
                PTO: obj.PTO,
                total,
                weekStart: setStartTime ? startTime : thisUser.hours.weekStart
            }));
        }
        // } else if (total >= 10 && total < 15) {
    } else if (total >= 35 && total < 45) {
        console.log('total >= 35 but total < 45');
        if (obj.user.hours.emailed) {
            if (obj.user.supervisor && (obj.user.hours.emailed !== 'admin' || obj.user.hours.emailed !== 'manager')) {
                const supervisor = managers[obj.user.supervisor];
                promises.push(emailManager(supervisor ? supervisor : false, {
                    user: obj.user,
                    Indirect: obj.Indirect,
                    PM: obj.PM,
                    Corrective: obj.Corrective,
                    TroubleCall: obj.TroubleCall,
                    NewSet: obj.NewSet,
                    Transfer: obj.Transfer,
                    Swap: obj.Swap,
                    Release: obj.Release,
                    Travel: obj.Travel,
                    PTO: obj.PTO,
                    total,
                    weekStart: setStartTime ? startTime : thisUser.hours.weekStart
                }));
            } else { // has no supervisor email Orion alerts
                //  maybe add in orion alerts. Future possibility
            }
        }
    } else {
        promises.push(TH.updateUser(obj.user.username, {
            hours: {
                emailed: 'none',
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Transfer: obj.Transfer,
                Swap: obj.Swap,
                Release: obj.Release,
                Travel: obj.Travel,
                PTO: obj.PTO,
                total,
                weekStart: setStartTime ? startTime : thisUser.hours.weekStart
            }
        }));
    }
};

/**
 * Main method
 * Gets all users. Saves managers and techs to memory
 * then tests their work order and PTO time. Accordingly email
 * appropriate users depending on results. but always
 * update the technicians.
 * @returns {Promise}
 */
const manHourMonitoringFn = () => {
    return new Promise((resolve, reject) => {
        const managers = {};
        const techHash = {};
        let admin;
        let startTime = new Date();

        TH.getUsers()
            .then((users) => {
                const promises = [];
                let techs = [];
                const manags = [];
                users.forEach((user) => {
                    if (user.username.length === 6) {
                        if (user.role === 'tech') {
                            techHash[user.username] = user;
                            techs.push(user);
                        } else { // some admins are managers as well
                            managers[user.username] = user;
                            manags.push(user);
                        }
                        if (user.username === 'CAN001') {
                            admin = user;
                        }
                    }
                });
                const times = TH.getToFromDatesNewWeek();
                startTime = times.returnStart;
                techs = techs.concat(manags);
                techs.forEach((tech) => {
                    // promises.push(getUserWorkOrdersHours(tech, times));
                    promises.push(getUserWOandPTOHours(tech, times));
                });
                return Promise.all(promises);
            })
            // .then((objArr) => Promise.all(objArr.map((obj) => getUserPTOHours(obj))))
            .then((objArr) => {
                const promises = [];
                // update users first then send emails out
                objArr.forEach((obj) => {
                    let thisUser = techHash[obj.user.username];
                    if (thisUser === undefined) {
                        thisUser = managers[obj.user.username];
                    }
                    const total = obj.Indirect + obj.PM + obj.Corrective + obj.TroubleCall + obj.NewSet + obj.Release + obj.Travel + obj.Transfer + obj.Swap + obj.PTO;
                    if (thisUser.hours) {
                        if (thisUser.hours.hasOwnProperty('weekStart') && thisUser.hours.weekStart !== null) {
                            const weekStart = new Date(thisUser.hours.weekStart).getTime();
                            const startGetTime = new Date(startTime).getTime();
                            if (weekStart !== startGetTime) {
                                console.log('reset Time');
                                TH.updateUser(obj.user.username, {
                                        hours: {
                                            weekStart: startTime,
                                            emailed: 'none',
                                            Indirect: 0,
                                            PM: 0,
                                            Corrective: 0,
                                            TroubleCall: 0,
                                            NewSet: 0,
                                            Transfer: 0,
                                            Swap: 0,
                                            Release: 0,
                                            Travel: 0,
                                            PTO: 0,
                                            total: 0,
                                        }
                                    })
                                    .then(() => {
                                        // continue checks to update user
                                        updateCheckUser(promises, startTime, total, obj, managers, admin, thisUser, true);
                                    })
                                    .catch(reject);
                            } else {
                                // update user
                                updateCheckUser(promises, startTime, total, obj, managers, admin, thisUser, true);
                            }
                        } else {
                            // set thisUser.hours.weekStart: startTime,
                            // update user
                            updateCheckUser(promises, startTime, total, obj, managers, admin, thisUser, true);
                        }
                    } else {
                        thisUser.hours = {
                            weekStart: startTime,
                            emailed: 'none',
                            Indirect: 0,
                            PM: 0,
                            Corrective: 0,
                            TroubleCall: 0,
                            NewSet: 0,
                            Release: 0,
                            Transfer: 0,
                            Swap: 0,
                            Travel: 0,
                            PTO: 0,
                            total: 0,
                        };
                        updateCheckUser(promises, startTime, total, obj, managers, admin, thisUser, false);
                    }
                });
                return Promise.all(promises);
            })
            .then(resolve)
            .catch(reject);
    });
};

module.exports = manHourMonitoringFn;
