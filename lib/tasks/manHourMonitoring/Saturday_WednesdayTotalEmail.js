'use strict';
/*
* Man hours from Monday to Thursday totaled and grouped by managers
* then emailed to table to each manager.
*
* This should be a simple totalling of time and sent to each manager no matter
* what the times are.
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
 * not happen and if it does that means someone forgot to assign the tech a
 * supervisor -> No thursday and friday. That is a different report
 * @param techObj
 * @param SuperObj
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
    // techObj.Total will be different if techObj.date.day is different. fyi
    if (techObj.date.day === 'Monday') {
        SuperObj[ORION].techs[techObj.user.username]['Monday'] = techObj.Total;
    } else if (techObj.date.day === 'Tuesday') {
        SuperObj[ORION].techs[techObj.user.username]['Tuesday'] = techObj.Total;
    } else if (techObj.date.day === 'Wednesday') {
        SuperObj[ORION].techs[techObj.user.username]['Wednesday'] = techObj.Total;
    } else if (techObj.date.day === 'Saturday') {
        SuperObj[ORION].techs[techObj.user.username]['Saturday'] = techObj.Total;
    } else {
        SuperObj[ORION].techs[techObj.user.username]['Sunday'] = techObj.Total;
    }
    SuperObj[ORION].techs[techObj.user.username]['tech'] = techObj.user;
    SuperObj[ORION].techs[techObj.user.username]['Total'] =
        !isEmpty(SuperObj[ORION].techs[techObj.user.username]['Total'])
            ? SuperObj[ORION].techs[techObj.user.username]['Total']
        : 0;
    // finally total up the days as they come by
    SuperObj[ORION].techs[techObj.user.username]['Total'] += techObj.Total;
};

/**
 * This method breaks up the techobject array into a single super object
 * that should hold all that is needed to create the email easily.
 * @param managersHash - hash of manager username as key and value as obj
 * @param techObjArr - contains each techs singular hours for each weekday
 * @returns {Promise}
 */
const breakUpTechsBySupervisor = (managersHash, techObjArr) => {
    return new Promise((resolve, reject) => {
        try {
            const SuperObj = {};
            const managers = Object.keys(managersHash);
            managers.push(ORION);

            // here create the super obj used for actual sending of data
            managers.forEach((manager) => {
                SuperObj[manager] = {
                    techs:         {}, // will be filled with all managers
                                       // techs + times
                    //this managers obj to be
                    SupervisorObj: {supervisor: null, email: null},
                };
            });
            /*
            *
            * at this point the SuperObj looks like
            *
            * { managerUsername: {
            *     techs: {},
            *     SupervisorObj: {supervisor: null},
            *   }, ...so on
            * }
            *
            * */

            /**
             * Need to make sure the 'SupervisorObj' is created on the orion
             * object before population. if tech has no supervisor but has an
             * email, email the info to OrionAlerts
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
             *
             * Do not send tech info to managers if they do not have an email
             * Only send if the manager exists on the hash as well.
             *
             * techObjArr looks like ->
             *
             * [{user: techObj, Total: decimal, date: TimesObj[day]}, {..}]
             *
             * where TimesObj[day] = {times: {returnStart: date, returnEnd:
             * date}, day: 'Sunday'}
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
            /*
            *
            * SuperObj at this point
            *
            * { managerUsername: {
            *     techs: {
            *       techUsername: {}
            *     },
            *     SupervisorObj: {supervisor: null},
            *   },
            *   ... or
            *   Orion: {
            *     techs: {
            *       techUserName: {}
            *     },
            *     SubervisorObj: {firstName: ORION, lastName: 'Alerts', username: 'No Manager', role: 'admin', email:
             *     'orionalerts@parkenergyservices.com'},
            *   }
            * }
            *
            * */

            /**
             * Finally populate all fields of the super object
             * This also
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

            /*
            * the super returnObj at this point
            *
            * {
            *   managerUsername: {
            *     SupervisorObj: {} // the technicians supervisor from the managerHash. Should be full user obj form db
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
            *   },
            *   Orion: {
            *     SupervisorObj: {firstName: ORION, lastName: 'Alerts', username: 'No Manager', role: 'admin', email:
            *     'orionalerts@parkenergyservices.com'},
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
            * */

            resolve(SuperObj);
        } catch (e) {
            return reject(
                `Error in breakUpTechsBySupervisor Sat_WedTotalEmals: ${e}`);
        }
    });
};

/**
 * Render the row for this technician.
 * static row length and items
 * @param tech   -> tech name as string their techId
 * @param SuperObjManagerTECHS
 * @param TimeObj
 * @returns {string}
 */
const renderTableRow = (tech, SuperObjManagerTECHS, TimeObj) => {
    if (TimeObj) {
        // ['tech'].tech is the user's obj
        const SaturdayTimeStart = TimeObj.Saturday.times.returnStart
        const SaturdayTimeEnd = TimeObj.Saturday.times.returnEnd
        const SundayTimeStart = TimeObj.Sunday.times.returnStart
        const SundayTimeEnd = TimeObj.Sunday.times.returnEnd
        const MondayTimeStart = TimeObj.Monday.times.returnStart.toString()
        const MondayTimeEnd = TimeObj.Monday.times.returnEnd.toString()
        const TuesdayTimeStart = TimeObj.Tuesday.times.returnStart.toLocaleString()
        const TuesdayTimeEnd = TimeObj.Tuesday.times.returnEnd.toLocaleString()
        const WednesdayTimeStart = TimeObj.Wednesday.times.returnStart
        const WednesdayTimeEnd = TimeObj.Wednesday.times.returnEnd
        return `
    <tr id="${tech}">
        <td>${SuperObjManagerTECHS[tech].tech.firstName} ${SuperObjManagerTECHS[tech].tech.lastName}</td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SaturdayTimeStart}/${SaturdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Saturday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SundayTimeStart}/${SundayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Sunday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${MondayTimeStart}/${MondayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Monday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TuesdayTimeStart}/${TuesdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Tuesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${WednesdayTimeStart}/${WednesdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
            ${SuperObjManagerTECHS[tech].Wednesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${SaturdayTimeStart}/${WednesdayTimeEnd}/${SuperObjManagerTECHS[tech].tech.username}">
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
        <td>${SuperObjManagerTECHS[tech].Total.toFixed(2)}</td>
      </tr>
    `;
    }
};

/**
 * Render the dynamic list of technicians
 * @param SuperObjManager
 * @param TimeObj
 * @returns {string}
 */
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

/**
 * Since tableHeader is all the same loop over as method of
 * static heading
 * @param headings
 */
const renderTableHeader = (headings) => {
    return headings.map((h) => {
        return `
      <th align="left" style="background-color: #ccc" id="${h}">${h}</th>
    `;
    }).join('');
};

const header = ['Tech', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Total'];

/**
 * Renders the table header. Static heading
 * @param SuperObjManager
 * @param TimeObj
 * @returns {string}
 */
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

const renderNames = (SuperObjManager, manages) => {
    return manages.map((username) => {
        return ` ${SuperObjManager.manages[username].firstName} ${SuperObjManager.manages[username].lastName},`;
    }).join('');
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

/**
 * email orion alerts if no manager email
 * @param hasManager - should be manager object of tech
 * @returns {*}
 */
const managerEmail = (hasManager) => {
    if (hasManager.email) {
        return hasManager.email;
    } else {
        return 'orionalerts@parkenergyservices.com';
    }
};

/**
 * Email method to email to manager
 * @param SuperObjManager
 * @param start - Saturday: obj = {returnstart: date, returnEnd: date}
 * @param end
 * @param TimeObj
 * @returns {Promise}
 * @constructor
 */
const EmailSupervisor = (SuperObjManager, start, end, TimeObj, mailer) => {
    return new Promise((resolve, reject) => {
        try {
            if (SuperObjManager.SupervisorObj.email) {
                // const mailer = new GmailMailer();
                mailer.transport.verify((err) => {
                    if (err) {
                        return reject(err);
                    } else {
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
                            subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Wednesday: ${end.returnEnd.toLocaleDateString()} Total Workorder Time Submitted`,
                            to: to,
                            html: `
            <body>
              <p>Name: ${SuperObjManager.SupervisorObj.firstName} ${SuperObjManager.SupervisorObj.lastName}</p>
              ${renderManages(SuperObjManager)}
              <p>Technician workorder hours from Saturday to Wednesday.</p>
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
            log.debug(`Sat_Wed_Email (442) fn:EmailSupervisor`);
            return reject(`Sat_Wed_Email (442) fn:EmailSupervisor ${e}`);
        }
    });
};


/**
 * Render the table for this technician.
 * @param SuperObjManager
 * @param tech
 * @returns {string}
 */
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

/**
 * Check for user email- email html of their times form Sunday - Thursday
 * for this technician.
 * @param SuperObjManager - SuperObj['managerusername']s: object
 * @param tech - username: string
 * @param start - Saturday: obj = {returnstart: date, returnEnd: date}
 * @param end - Wednesday: obj = {returnstart: date, returnEnd: date}
 * @returns {Promise}
 */
const emailTech = (SuperObjManager, tech, start, end, mailer) => {
    return new Promise((resolve, reject) => {
        try {
            const user = SuperObjManager.techs[tech].tech; // user object
            if (user.email) {
                // const mailer = new GmailMailer();
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
                            subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Wednesday: ${end.returnStart.toLocaleDateString()} Total Workorder Time Submitted`,
                            to: to,
                            html: `
              <body>
                <p>Supervisor: ${SuperObjManager.SupervisorObj.firstName} ${SuperObjManager.SupervisorObj.lastName}</p>
                <p>Name: ${user.firstName} ${user.lastName}</p>
                <p>Your workorder hours from Saturday to Wednesday that have been submitted</p>
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
            log.debug(`Sat_Wed_Email (514) fn:emailTech: tech: ${JSON.stringify(
                tech)}`);
            return reject(`Sat_Wed_Email (514) fn:emailTech: tech: ${e}`);
        }
    });
};

/**
 * Like the EmailSupervisors method this will email out for
 * each technician their times
 * @param SuperObjManager - SuperObj['managerusername']s obj
 * @param start
 * @param end
 * @returns {Promise.<*[]>}
 * @constructor
 */
const EmailSupervisorTechs = (SuperObjManager, start, end, mailer) => {
    const promises = [];
    // get this supervisor's technician usernames
    const techs = Object.keys(SuperObjManager.techs);

    if (isEmpty(techs)) {
        promises.push(new Promise((res) => res()));
    } else {
        techs.forEach((tech) => {
            promises.push(emailTech(SuperObjManager, tech, start, end, mailer));
        });
    }
    return Promise.all(promises);
};


/**
 * Should email all the techs to each manager and waterfall techs up to higher
 * management
 * @param SuperObj
 * @param start - {returnStart: date, returnEnd: date}
 * @param end - {returnStart: date, returnEnd: date}
 * @param TimesObj - {
 *   Saturday: {
 *      times: SaturdayTimes, // = {returnStart: date, returnEnd: date}
 *      day: 'Saturday',
 *  },
 *  Sunday: {
 *      times: SundayTimes,
 *      day: 'Sunday',
 *  },
 *  Monday: {
 *      times: MondayTimes,
 *      day: 'Monday',
 *  },
 *  Tuesday: {
 *      times: TuesdayTimes,
 *      day: 'Tuesday',
 *  },
 *  Wednesday: {
 *      times: WednesdayTimes,
 *      day: 'Wednesday',
 *  }
 * }
 * @constructor
 */
const WaterFallEmail = (SuperObj, start, end, TimesObj, mailer) => {
    return new Promise((resolve, reject) => {
        try {
            // add manages to each manager user -> this is all non-tech users not necessarily a manager
            const managerUserNames = Object.keys(SuperObj);
            managerUserNames.forEach((username) => {
                SuperObj[username]['manages'] = {};
            });
            return Promise.all(managerUserNames.map((managerUsername) => {
                    return TH.addTechsToSupervisor(SuperObj, managerUsername);
                }))
                .then(() => {
                    return Promise.all(
                        managerUserNames.map((managerUsername) => {
                            // here is where you now email the managers;
                            return EmailSupervisor(SuperObj[managerUsername],
                                start, end, TimesObj, mailer);
                        }));
                })
                .then(resolve)
                .catch(reject);
        } catch (e) {
            return reject(`Error waterfallemail sat_wed: ${e}`);
        }
    });
};

/**
 * Main method
 * Gets all users. Saves managers and techs to memory
 * then pulls all workorders for each technician and
 * breaks them up by day of the week and by who their
 * supervisor is. Should email out to managers and
 * technician their weekly workorder time.
 * @returns {Promise}
 * @constructor
 */
const SaturdayToWednesdayTotalsEmail = () => {
    return new Promise((resolve, reject) => {
        const managers = {};
        const techHash = {};
        let SATURDAY;
        let WEDNESDAY;
        let TimesObj;
        let SuperObj;
        const mailer = new GmailMailer();
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
                    }
                };
                SATURDAY = SaturdayTimes;
                WEDNESDAY = WednesdayTimes;
                const TimeObjKeys = Object.keys(TimesObj);
                techs.forEach((tech) => {
                    TimeObjKeys.forEach((day) => {
                        promises.push(
                            TH.getUserWorkOrdersHours(tech, TimesObj[day]));
                    });
                });
                return Promise.all(promises);
                // the objArr looks like this
                /*
                * [ {user: techFromAbove, Total: total Time for That Day, date: TimesObj[day]}, {...for each day for each
                * tech}]
                *
                * where TimesObj[day] = { times: {returnStart, returnEnd}, day: string }
                * */
            })
            .then((objArr) => Promise.all(objArr.map((obj) => TH.getUserPTOHours(obj))))
            // create the super obj here
            .then((objArr) => breakUpTechsBySupervisor(managers, objArr))
            .then((superobj) => {
                // saved here because super obj is used again after this .then
                SuperObj = superobj;
                // email all techs their weekly time thus far
                const managerUsernames = Object.keys(managers);
                return Promise.all(managerUsernames.map((managerUsername) => {
                    const SUPEROBJMANAGER = superobj[managerUsername];
                    /*if (!isEmpty(SUPEROBJMANAGER.SupervisorObj)) {
                        return EmailSupervisorTechs(SUPEROBJMANAGER, SATURDAY, WEDNESDAY, mailer);
                    } else {
                        return new Promise((res) => res());
                    }*/
                    return new Promise((res) => res());
                }));
            })
            // next waterfall email all managers up to Corporate level. then
            // total to payroll.
            .then(() => WaterFallEmail(SuperObj, SATURDAY, WEDNESDAY, TimesObj, mailer))
            .then(resolve)
            .catch(reject);
    });
};

module.exports = SaturdayToWednesdayTotalsEmail;
