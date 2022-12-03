'use strict';

/*
* Man hours from Sunday to Saturday of the previous week.
*
* Emailed in groupd to each manager + to Orion Alerts in the manager groups.
* As well as emailing individual times to technicians as well.
* */

const GmailMailer = require('../../helpers/email_helper'),
      TH          = require('../../helpers/task_helper'),
      log         = require('../../helpers/logger'),
      isEmpty     = require('tedb-utils').isEmpty;
const ORION = 'Orion';

/**
 * Return object style        --> This is the sop/superObj being passed around
 * {
*   SupervisorName: {
*     SupervisorObj: {},
*     techs: {
*       techName: {
*         Sunday: #
*         Monday: #
*         Tuesday: #
*         Wednesday: #
*         Thursday: #
*         Total: #
*         tech: {}, // technician user object from db
*       }
*     }
*   }
* }
 *
 * this method creates the superobject that is passed around in many methods to
 * biuld the message
 * @param managerHash
 * @param techObj
 * @param SuperObj
 */
const addTechObjDay = (managerHash, techObj, SuperObj) => {
    // only need to fill SupervisorObj if not empty
    /*if (isEmpty(SuperObj[techObj.user.supervisor]['SupervisorObj'])) {
        SuperObj[techObj.user.supervisor]['SupervisorObj'] = managerHash[techObj.user.supervisor];
    }*/
    SuperObj[techObj.user.supervisor]['SupervisorObj'] = managerHash[techObj.user.supervisor];
    if (techObj.date.day === 'Monday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Monday'] = techObj.Total;
    } else if (techObj.date.day === 'Tuesday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Tuesday'] = techObj.Total;
    } else if (techObj.date.day === 'Wednesday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Wednesday'] = techObj.Total;
    } else if (techObj.date.day === 'Thursday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Thursday'] = techObj.Total;
    } else if (techObj.date.day === 'Friday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Friday'] = techObj.Total;
    } else if (techObj.date.day === 'Saturday') {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Saturday'] = techObj.Total;
    } else {
        SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Sunday'] = techObj.Total;
    }
    SuperObj[techObj.user.supervisor].techs[techObj.user.username]['tech'] = techObj.user;
    SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] =
        !isEmpty(
            SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Total'])
            ? SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Total']
        : 0;
    SuperObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] += techObj.Total;
};
/**
 * Specific version for when the technician does not have a supervisor. Should
 * not happen and if it does that means someone forgot ot assign the tech a
 * supervisor
 * @param techObj
 * @param returnObj
 * @constructor
 */
const NoManagerObjDay = (techObj, SuperObj) => {
    SuperObj['Orion']['SupervisorObj'] = {
        firstName:  'Orion',
        lastName:   'Alerts',
        username:   'No Manager',
        role:       'admin',
        email:      'orionalerts@parkenergyservices.com',
        supervisor: null,
    };
    if (techObj.date.day === 'Monday') {
        SuperObj[ORION].techs[techObj.user.username]['Monday'] = techObj.Total;
    } else if (techObj.date.day === 'Tuesday') {
        SuperObj[ORION].techs[techObj.user.username]['Tuesday'] = techObj.Total;
    } else if (techObj.date.day === 'Wednesday') {
        SuperObj[ORION].techs[techObj.user.username]['Wednesday'] = techObj.Total;
    } else if (techObj.date.day === 'Thursday') {
        SuperObj[ORION].techs[techObj.user.username]['Thursday'] = techObj.Total;
    } else if (techObj.date.day === 'Friday') {
        SuperObj[ORION].techs[techObj.user.username]['Friday'] = techObj.Total;
    } else if (techObj.date.day === 'Saturday') {
        SuperObj[ORION].techs[techObj.user.username]['Saturday'] = techObj.Total;
    } else {
        SuperObj[ORION].techs[techObj.user.username]['Sunday'] = techObj.Total;
    }
    SuperObj[ORION].techs[techObj.user.username]['tech'] = techObj.user;
    SuperObj[ORION].techs[techObj.user.username]['Total'] = SuperObj[ORION].techs[techObj.user.username]['Total']
        ? SuperObj[ORION].techs[techObj.user.username]['Total']
        : 0;
    SuperObj[ORION].techs[techObj.user.username]['Total'] += techObj.Total;
};

/**
 * This method breaks up the techobject array into a single super object
 * that should hold all that is needed to create the email easily.
 * @param managersHash
 * @param techObjArr
 * @returns {Promise}
 */
const breakUpTechsBySupervisor = (managersHash, techObjArr) => {
    return new Promise((resolve, reject) => {
        try {
            const SuperObj = {};
            const managers = Object.keys(managersHash);
            managers.push(ORION);
            managers.forEach((manager) => {
                SuperObj[manager] = {
                    techs:         {},
                    SupervisorObj: {supervisor: null, email: null},
                };
            });
            /**
             * Need to make sure the 'SupervisorObj' is created on the object
             * before population
             */
            SuperObj[ORION]['SupervisorObj'] = {
                firstName:  ORION,
                lastName: 'Alerts',
                username: 'No Manager',
                role: 'admin',
                email: 'orionalerts@parkenergyservices.com',
                supervisor: null
            };
            /**
             * Need to make sure each technician object exists on the object
             * before adding new fields otherwise will get an error like
             * 'Cannot set Monday of undefined'.
             */
            techObjArr.forEach((techObj) => {
                if (isEmpty(techObj.user.supervisor) &&
                    !isEmpty(techObj.user.email)) {
                    SuperObj[ORION].techs[techObj.user.username] = {};
                } else if (techObj.user.supervisor && techObj.user.email) {
                    if (!isEmpty(managersHash[techObj.user.supervisor])) {
                        SuperObj[techObj.user.supervisor].techs[techObj.user.username] = {};
                    } else {
                        SuperObj[ORION].techs[techObj.user.username] = {};
                    }
                }
            });
            /**
             * Finally populate all fields of the super object
             */
            techObjArr.forEach((techObj) => {
                if (isEmpty(techObj.user.supervisor) &&
                    !isEmpty(techObj.user.email)) {
                    NoManagerObjDay(techObj, SuperObj);
                } else if (!isEmpty(techObj.user.supervisor) &&
                    !isEmpty(techObj.user.email)) {
                    if (!isEmpty(managersHash[techObj.user.supervisor])) {
                        addTechObjDay(managersHash, techObj, SuperObj);
                    } else {
                        NoManagerObjDay(techObj, SuperObj);
                    }
                } else {
                    // NoManagerObjDay(techObj, SuperObj);
                }
            });
            resolve(SuperObj);
        } catch (e) {
            return reject(e);
        }
    });
};

/**
 *
 * @param tech -> tech name as string their techId
 * @param spoTechs
 * @param TimeObj
 * @returns {string}
 */
const renderTableRow = (tech, SuperObjManagerTECHS, TimeObj) => {
    if (TimeObj) {
        const SaturdayTimeStart = TimeObj.Saturday.times.returnStart
        const SaturdayTimeEnd = TimeObj.Saturday.times.returnEnd
        const SundayTimeStart = TimeObj.Sunday.times.returnStart
        const SundayTimeEnd = TimeObj.Sunday.times.returnEnd
        const MondayTimeStart = TimeObj.Monday.times.returnStart
        const MondayTimeEnd = TimeObj.Monday.times.returnEnd
        const TuesdayTimeStart = TimeObj.Tuesday.times.returnStart
        const TuesdayTimeEnd = TimeObj.Tuesday.times.returnEnd
        const WednesdayTimeStart = TimeObj.Wednesday.times.returnStart
        const WednesdayTimeEnd = TimeObj.Wednesday.times.returnEnd
        const ThursdayTimeStart = TimeObj.Thursday.times.returnStart
        const ThursdayTimeEnd = TimeObj.Thursday.times.returnEnd
        const FridayTimeStart = TimeObj.Friday.times.returnStart
        const FridayTimeEnd = TimeObj.Friday.times.returnEnd
        // ['tech'].tech is the user's obj
        return `
      <tr  id="${tech}">
        <td>${SuperObjManagerTECHS[tech].tech.firstName} ${SuperObjManagerTECHS[tech].tech.lastName}</td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SaturdayTimeStart}/${SaturdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Saturday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SundayTimeStart}/${SundayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Sunday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${MondayTimeStart}/${MondayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Monday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TuesdayTimeStart}/${TuesdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Tuesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${WednesdayTimeStart}/${WednesdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Wednesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${ThursdayTimeStart}/${ThursdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Thursday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${FridayTimeStart}/${FridayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Friday.toFixed(2)}
          </a>
        </td>
        <td>
          <a href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SaturdayTimeStart}/${FridayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Total.toFixed(2)}
          </a>
        </td>
      </tr>
    `;
    } else {
        return `
    <tr id="${tech}">
      <td>${SuperObjManagerTECHS[tech].tech.firstName} ${SuperObjManagerTECHS[tech].tech.lastName}</td>
      <td>${SuperObjManagerTECHS[tech].Saturday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Sunday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Monday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Tuesday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Wednesday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Thursday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Friday.toFixed(2)}</td>
      <td>${SuperObjManagerTECHS[tech].Total.toFixed(2)}</td>
    </tr>
  `;
    }
};

const renderTableRows = (SuperObjManager, TimeObj) => {
    const spoTechs = Object.keys(SuperObjManager.techs);
    return spoTechs.reduce((acc, tech) => {
        if (!isEmpty(SuperObjManager.techs[tech].tech.email)) {
            return acc.concat(
                `${renderTableRow(tech, SuperObjManager.techs, TimeObj)}`);
        } else {
            return acc;
        }
    }, []).join('');
};

const renderTableHeader = (headings) => {
    return headings.map((h) => {
        return `
      <th align="left" style="background-color: #ccc" id="${h}">${h}</th>
    `;
    }).join('');
};

const header = ['Tech', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Total'];

const renderTable = (SuperObjManager, TimeObj) => {
    return `
    <table width="100%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        ${renderTableHeader(header)}
      </tr>
      ${renderTableRows(SuperObjManager, TimeObj)}
    </table>
  `;
};

const renderTechTable = (SuperObjManager, tech) => {
    return `
    <table width="100%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        ${renderTableHeader(header)}
      </tr>
      ${renderTableRow(tech, SuperObjManager.techs)}
    </table>
  `;
};

const renderNames = (SuperObjManager, manages) => {
    return manages.map((username) => {
        return ` ${SuperObjManager.manages[username].firstName} ${SuperObjManager.manages[username].lastName},`;
    }).join('');
    console.log(${SuperObjManager.manages[username].lastName});
};

const renderManages = (SuperObjManager) => {
    const manages = Object.keys(SuperObjManager.manages);
    if (manages.length !== 0) {
        return `
      <p>Manages: ${renderNames(SuperObjManager, manages)}</p>
    `;
    } else {
        return `<p></p>`;
    }
};

const emailTech = (SuperObjManager, tech, start, end) => {
    return new Promise((resolve, reject) => {
        try {
            const user = SuperObjManager.techs[tech].tech;
            if (user.email) {
                const mailer = new GmailMailer();
                mailer.transport.verify((err) => {
                    if (err) {
                        return reject(err);
                    } else {
                        let to
                        if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined) {
                            to = 'mwhelan@parkenergyservices.com';
                        } else {
                            to = user.email;
                            // to = 'mwhelan@parkenergyservices.com'
                        }
                        const mailerOptions = {
                            from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                            subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Friday: ${end.returnEnd.toLocaleDateString()} Total Workorder Time Submitted Last Week.`,
                            to: to,
                            html: `
                <body>
                  <p>Supervisor: ${SuperObjManager.SupervisorObj.firstName} ${SuperObjManager.SupervisorObj.lastName}</p>
                  <p>Name: ${user.firstName} ${user.lastName}</p>
                  <p>Your Submitted workorder hours for last week. Recorded at the time of this email being sent.</p>
                  <p>Note:  Workorder Time is in UTC time zone.</p>
                  ${renderTechTable(SuperObjManager, tech)}
                </body>
              `,
                        };
                        mailer.transport.sendMail(mailerOptions, (error) => {
                            if (error) {
                                return reject(error);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            } else {
                resolve();
            }
        } catch (e) {
            log.debug(`Sat_Fri_Email (340) fn:EmailTech`);
            return reject(e);
        }
    });
};

const EmailSupervisor = (SuperObjManager, start, end, TimeObj) => {
    return new Promise((resolve, reject) => {
        try {
            if (SuperObjManager.SupervisorObj.email) {
               
                const mailer = new GmailMailer();
                mailer.transport.verify((err) => {
                    if (err) {
                        return reject(err);
                    } else {
                        const managerEmail = (hasManager) => {
                            if (hasManager.email) {
                                return hasManager.email; 
                                console.log(hasManager.email);   
                            } else {
                                return 'orionalerts@parkenergyservices.com';
                            }
                        };
                        const toEmail = managerEmail(
                            SuperObjManager.SupervisorObj);
                        let to
                        if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined) {
                            to = 'mwhelan@parkenergyservices.com';
                        } else {
                            to = toEmail;
                            // to = 'mwhelan@parkenergyservices.com'
                        }
                        const mailerOptions = {
                            from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                            subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Friday: ${end.returnEnd.toLocaleDateString()} Total Workorder Time Submitted Last Week`,
                            to: to,
                            html: `
              <body>
                <p>Name: ${SuperObjManager.SupervisorObj.firstName} ${SuperObjManager.SupervisorObj.lastName}</p>
                ${renderManages(SuperObjManager)}
                <p>Last weeks workorder hours for your technicians.</p>
                <p>Note:  Workorder Time is in UTC time zone.</p>
                ${renderTable(SuperObjManager, TimeObj)}
              </body>
              `,
                        };
                        if (SuperObjManager.SupervisorObj.firstName === ORION) {
                            const spoTechs = Object.keys(SuperObjManager.techs);
                            if (spoTechs.length === 0) {
                                return resolve();
                            }
                        }
                        mailer.transport.sendMail(mailerOptions, (error) => {
                            if (error) {
                                return reject(error);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            } else {
                resolve();
            }
        } catch (e) {
            log.debug(`Sat_Wed_Email (392) fn:EmailSupervisor`);
            return reject(e);
        }
    });
};

const EmailSupervisorTechs = (SuperObjManager, start, end) => {
    const promises = [];
    const techs = Object.keys(SuperObjManager.techs);

    if (isEmpty(techs)) {
        promises.push(new Promise((res) => res()));
    } else {
        techs.forEach((tech) => {
            promises.push(emailTech(SuperObjManager, tech, start, end));
        });
    }
    return Promise.all(promises);
};

const WaterFallEmail = (SuperObj, start, end, TimesObj) => {
    return new Promise((resolve, reject) => {
        try {
            const managerUserNames = Object.keys(SuperObj);
            managerUserNames.forEach((username) => {
                SuperObj[username]['manages'] = {};
            });
            return Promise.all(managerUserNames.map((managerUsername) => {
                    return TH.addTechsToSupervisor(SuperObj, managerUsername);
                }))
                .then(() => Promise.all(
                    managerUserNames.map((managerUsername) => {
                        return EmailSupervisor(SuperObj[managerUsername], start,
                            end, TimesObj);
                    })))
                // here is where you now email the managers;
                .then(resolve)
                .catch(reject);
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Main method
 * Gets all users. Saves managers and techs to memory
 * then pulls all workorders for each technician and
 * breaks them up by day for the previous week and by
 * who their supervisor is. Should email out to
 * managers + Orion Alerts + individual techs.
 * @returns {Promise}
 * @constructor
 */
const SaturdayFridayTotalEmail = () => {
    return new Promise((resolve, reject) => {
        const managers = {};
        const techHash = {};
        let SATURDAY;
        let FRIDAY;
        let TimesObj;
        let SuperObj;
        TH.getUsers()
            .then((users) => {
                const promises = [];
                const techs = [];
                users.forEach((user) => {
                    if (user.username.length === 6) {
                        if (user.role === 'tech') {
                            techHash[user.username] = user;
                            techs.push(user);
                        } else {
                            managers[user.username] = user;
                        }
                    }
                });
                const now = new Date();
                const SaturdayTimes = TH.getToFromDates(-1, now.getDay() + 1);
                const SundayTimes = TH.getToFromDates(0, now.getDay());
                const MondayTimes = TH.getToFromDates(1, now.getDay() - 1);
                const TuesdayTimes = TH.getToFromDates(2, now.getDay() - 2);
                const WednesdayTimes = TH.getToFromDates(3, now.getDay() - 3);
                const ThursdayTimes = TH.getToFromDates(4, now.getDay() - 4);
                const FridayTimes = TH.getToFromDates(5, now.getDay() - 5);

                TimesObj = {
                    Saturday: {
                        times: SaturdayTimes,
                        day: 'Saturday',
                    },
                    Sunday: {
                        times: SundayTimes,
                        day: 'Sunday',
                    },
                    Monday: {
                        times: MondayTimes,
                        day: 'Monday',
                    },
                    Tuesday: {
                        times: TuesdayTimes,
                        day: 'Tuesday',
                    },
                    Wednesday: {
                        times: WednesdayTimes,
                        day: 'Wednesday',
                    },
                    Thursday: {
                        times: ThursdayTimes,
                        day: 'Thursday',
                    },
                    Friday: {
                        times: FridayTimes,
                        day: 'Friday',
                    }
                };
                SATURDAY = SaturdayTimes;
                FRIDAY = FridayTimes;
                const TimeObjKeys = Object.keys(TimesObj);
                techs.forEach((tech) => {
                    TimeObjKeys.forEach((day) => {
                        promises.push(
                            TH.getUserWorkOrdersHours(tech, TimesObj[day]));
                    });
                });
                return Promise.all(promises);
            })
            .then((objArr) => Promise.all(objArr.map((obj) => TH.getUserPTOHours(obj))))
            .then((objArr) => breakUpTechsBySupervisor(managers, objArr))
            .then((superobj) => {
                SuperObj = superobj;
                const managerUserNames = Object.keys(managers);
                return Promise.all(managerUserNames.map((managerUsername) => {
                    const SUPEROBJMANAGER = SuperObj[managerUsername];
                    if (SUPEROBJMANAGER.SupervisorObj) {
                        return EmailSupervisorTechs(SUPEROBJMANAGER, SATURDAY,
                            FRIDAY);
                        // remove ONLY FOR TESTING
                        // return new Promise((res) => res());
                    } else {
                        return new Promise((res) => res());
                    }
                }));
            })
            .then(() => WaterFallEmail(SuperObj, SATURDAY, FRIDAY, TimesObj))
            .then(resolve)
            .catch(reject);
    });
};

module.exports = SaturdayFridayTotalEmail;
