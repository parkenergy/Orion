'use strict';
/*
* Man hours from Monday to Thursday totaled and grouped by managers
* then emailed to table to each manager.
*
* This should be a simple totalling of time and sent to each manager no matter
* what the times are.
* */

const GmailMailer = require('../../helpers/email_helper'),
    TH = require('../../helpers/task_helper'),
    log = require('../../helpers/logger');

/*
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
* this method creates the superobject that is passed around in many methods to biuld
* the message
* */
const addTechObjDay = (managerHash, techObj, returnObj) => {
  returnObj[techObj.user.supervisor]['SupervisorObj'] = managerHash[techObj.user.supervisor];
  if (techObj.date.day === 'Monday') {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Monday'] = techObj.Total;
  } else if (techObj.date.day === 'Tuesday') {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Tuesday'] = techObj.Total;
  } else if (techObj.date.day === 'Wednesday') {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Wednesday'] = techObj.Total;
  } else if (techObj.date.day === 'Saturday') {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Saturday'] = techObj.Total;
  } else {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Sunday'] = techObj.Total;
  }
  returnObj[techObj.user.supervisor].techs[techObj.user.username]['tech'] = techObj.user;
  returnObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] = returnObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] ? returnObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] : 0;
  returnObj[techObj.user.supervisor].techs[techObj.user.username]['Total'] += techObj.Total;
};
/**
 * Specific version for when the technician does not have a supervisor. Should not
 * happen and if it does that means someone forgot ot assign the tech a supervisor
 * @param techObj
 * @param returnObj
 * @constructor
 */
const NoManagerObjDay = (techObj, returnObj) => {
  returnObj['Orion']['SupervisorObj'] = {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email: 'orionalerts@parkenergyservices.com', supervisor: null};
  if (techObj.date.day === 'Monday') {
    returnObj['Orion'].techs[techObj.user.username]['Monday'] = techObj.Total;
  } else if (techObj.date.day === 'Tuesday') {
    returnObj['Orion'].techs[techObj.user.username]['Tuesday'] = techObj.Total;
  } else if (techObj.date.day === 'Wednesday') {
    returnObj['Orion'].techs[techObj.user.username]['Wednesday'] = techObj.Total;
  } else if (techObj.date.day === 'Saturday') {
    returnObj['Orion'].techs[techObj.user.username]['Saturday'] = techObj.Total;
  } else {
    returnObj['Orion'].techs[techObj.user.username]['Sunday'] = techObj.Total;
  }
  returnObj['Orion'].techs[techObj.user.username]['tech'] = techObj.user;
  returnObj['Orion'].techs[techObj.user.username]['Total'] = returnObj['Orion'].techs[techObj.user.username]['Total'] ? returnObj['Orion'].techs[techObj.user.username]['Total'] : 0;
  returnObj['Orion'].techs[techObj.user.username]['Total'] += techObj.Total
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
      const returnObj = {};
      const managers = Object.keys(managersHash);
      managers.push('Orion');
      managers.forEach((manager) => returnObj[manager] = {techs: {}, SupervisorObj: {supervisor: null}});
      /*
      *
      * at this point the returnObj looks like
      *
      * { managerUsername: {
      *     techs: {}
      *   }, ...so on
      * }
      *
      * */

      /**
       * Need to make sure the 'SupervisorObj' is created on the orion object before population
       * if tech has no supervisor but has an email email the info to OrionAlerts
       */
      returnObj['Orion']['SupervisorObj'] = {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email: 'orionalerts@parkenergyservices.com', supervisor: null};
      /**
       * Need to make sure each technician object exists on the object before adding new
       * fields otherwise will get an error like 'Cannot set Monday of undefined'.
       *
       * Do not send tech info to managers if they do not have an email
       * Only send if the manager exists on the hash as well.
       */
      techObjArr.forEach((techObj) => {
        if (!techObj.user.supervisor && techObj.user.email) {
          returnObj['Orion'].techs[techObj.user.username] = {};
        } else if (techObj.user.supervisor && techObj.user.email) {
          if (managersHash[techObj.user.supervisor]) {
            returnObj[techObj.user.supervisor].techs[techObj.user.username] = {};
          } else {
            returnObj['Orion'].techs[techObj.user.username] = {};
          }
        }
      });
      /*
      *
      * super returnObj at this point
      *
      * { managerUsername: {
      *     techs: {
      *       techUsername: {}
      *     }
      *   },
      *   ... or
      *   Orion: {
      *     SubervisorObj: {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email:
       *     'orionalerts@parkenergyservices.com'},
      *     techs: {
      *       techUserName: {}
      *     }
      *   }
      * }
      *
      * */


      /**
       * Finally populate all fields of the super object
       */
      techObjArr.forEach((techObj) => {
        if (!techObj.user.supervisor && techObj.user.email) {
          NoManagerObjDay(techObj, returnObj);
        } else if (techObj.user.supervisor && techObj.user.email) {
          if (managersHash[techObj.user.supervisor]) {
            addTechObjDay(managersHash, techObj, returnObj);
          } else {
            NoManagerObjDay(techObj, returnObj);
          }
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
      *     SupervisorObj: {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email:
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

      resolve(returnObj);
    } catch(e) {
      return reject(e);
    }
  });
};

/**
 * Render the row for this technician.
 * static row length and items
 * @param tech   -> tech name as string their techId
 * @param spoTechs  -> spo.techs
 * @param TimeObj
 * @returns {string}
 */
const renderTableRow = (tech, spoTechs, TimeObj) => {
  if (TimeObj) {
    return `
    <tr id="${tech}">
        <td>${spoTechs[tech].tech.firstName} ${spoTechs[tech].tech.lastName}</td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Saturday.times.returnStart}/${TimeObj.Saturday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Saturday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Sunday.times.returnStart}/${TimeObj.Sunday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Sunday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Monday.times.returnStart}/${TimeObj.Monday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Monday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Tuesday.times.returnStart}/${TimeObj.Tuesday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Tuesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Wednesday.times.returnStart}/${TimeObj.Wednesday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Wednesday.toFixed(2)}
          </a>
        </td>
        <td>
          <a  href="http://orion.parkenergyservices.com/#/workorder/v2Search/${TimeObj.Saturday.times.returnStart}/${TimeObj.Wednesday.times.returnEnd}/${spoTechs[tech].tech.username}">
            ${spoTechs[tech].Total.toFixed(2)}
          </a>
        </td>
      </tr>
    `;
  } else {
    return `
      <tr id="${tech}">
        <td>${spoTechs[tech].tech.firstName} ${spoTechs[tech].tech.lastName}</td>
        <td>${spoTechs[tech].Saturday.toFixed(2)}</td>
        <td>${spoTechs[tech].Sunday.toFixed(2)}</td>
        <td>${spoTechs[tech].Monday.toFixed(2)}</td>
        <td>${spoTechs[tech].Tuesday.toFixed(2)}</td>
        <td>${spoTechs[tech].Wednesday.toFixed(2)}</td>
        <td>${spoTechs[tech].Total.toFixed(2)}</td>
      </tr>
    `;
  }
};

/**
 * Render the dynamic list of technicians
 * @param spo
 * @param TimeObj
 * @returns {string}
 */
const renderTableRows = (spo, TimeObj) => {
  const spoTechs = Object.keys(spo.techs);
  return spoTechs.map((tech) => {
    if (spo.techs[tech].tech.email) {
      return `${renderTableRow(tech, spo.techs, TimeObj)}`
    }
  }).join('');
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
 * @param spo
 * @param TimeObj
 * @returns {string}
 */
const renderTable = (spo, TimeObj) => {
  return `
    <table width="100%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        ${renderTableHeader(header)}
      </tr>
      ${renderTableRows(spo, TimeObj)}
    </table>
  `;
};

const renderNames = (spo, manages) => {
  return manages.map((username) => {
    return ` ${spo.manages[username].firstName} ${spo.manages[username].lastName},`;
  }).join('');
};

const renderManages = (spo) => {
  const manages = Object.keys(spo.manages);
  if (manages.length !== 0) {
    return `
      <p>Manages: ${renderNames(spo, manages)}</p>
    `;
  } else {
    return `<p></p>`;
  }
};

/**
 * Email method to email to manager
 * @param spo
 * @param start
 * @param end
 * @param TimeObj
 * @returns {Promise}
 * @constructor
 */
const EmailSupervisor = (spo, start, end, TimeObj) => {
  return new Promise((resolve, reject) => {
    try {
      if (spo.SupervisorObj.email) {
        const mailer = new GmailMailer();
        mailer.transport.verify((err, success) => {
          if (err) {
            return reject(err);
          } else {
            const managerEmail = (hasManager) => {
              if (hasManager.email) {
                return hasManager.email;
              } else {
                return 'orionalerts@parkenergyservices.com'
              }
            };
            const toEmail = managerEmail(spo.SupervisorObj);
            const mailerOptions = {
              from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
              subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Wednesday: ${end.returnEnd.toLocaleDateString()} Total Workorder Time Submitted`,
              to: toEmail,
              // to: 'mwhelan@parkenergyservices.com',
              html: `
            <body>
              <p>Name: ${spo.SupervisorObj.firstName} ${spo.SupervisorObj.lastName}</p>
              ${renderManages(spo)}
              <p>Technician workorder hours from Saturday to Wednesday.</p>
              ${renderTable(spo, TimeObj)}
            </body>
            `,
            };

            if (spo.SupervisorObj.firstName === 'Orion') {
              const spoTechs = Object.keys(spo.techs);
              if (spoTechs.length === 0) {
                return resolve();
              }
            }
            mailer.transport.sendMail(mailerOptions, (error, info) => {
              if (error) {
                return reject(error);
              } else {
                resolve();
              }
            });
          }
        });
      }  else {
        resolve();
      }
    } catch(e) {
      log.debug({error: e}, 'Error While emailing supervisor. Sunday - Thursday this week');
      return reject(e);
    }
  });
};


/**
 * Render the table for this technician.
 * @param spo
 * @param tech
 * @returns {string}
 */
const renderTechTable = (spo, tech) => {
  return `
    <table width="100%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        ${renderTableHeader(header)}
      </tr>
      ${renderTableRow(tech, spo.techs)}
    </table>
  `;
};

/**
 * Check for user email- email html of their times form Sunday - Thursday
 * for this technician.
 * @param spo
 * @param tech
 * @param start
 * @param end
 * @returns {Promise}
 */
const emailTech = (spo, tech, start, end) => {
  return new Promise((resolve, reject) => {
    try {
      const user = spo.techs[tech].tech;
      if (user.email) {
        const mailer = new GmailMailer();
        mailer.transport.verify((err, success) => {
          if (err) {
            return reject(err);
          } else {
            const mailerOptions = {
              from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
              subject: `Saturday: ${start.returnStart.toLocaleDateString()} - Wednesday: ${end.returnStart.toLocaleDateString()} Total Workorder Time Submitted`,
              to: user.email,
              // to: 'mwhelan@parkenergyservices.com',
              html: `
              <body>
                <p>Supervisor: ${spo.SupervisorObj.firstName} ${spo.SupervisorObj.lastName}</p>
                <p>Name: ${user.firstName} ${user.lastName}</p>
                <p>Your workorder hours from Saturday to Wednesday that have been submitted</p>
                ${renderTechTable(spo, tech)}
              </body>
              `,
            };
            mailer.transport.sendMail(mailerOptions, (error, info) => {
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
    } catch(e) {
      log.debug({error: e}, 'Error While emailing technician. Sunday - Thursday this week');
      return reject(e);
    }
  });
};

/**
 * Like the EmailSupervisors method this will email out for
 * each technician their times
 * @param spo
 * @param start
 * @param end
 * @returns {Promise.<*[]>}
 * @constructor
 */
const EmailSupervisorTechs = (spo, start, end) => {
  const promises = [];
  const techs = Object.keys(spo.techs); // get technicians from this supervisor to email
  if (techs.length === 0) {
    promises.push(new Promise((res) => res()));
  } else {
    techs.forEach((tech) => {
      promises.push(emailTech(spo, tech, start, end));
    });
  }
  return Promise.all(promises);
};


/**
 * Should email all the techs to each manager and waterfall techs up to higher management
 * @param superObj
 * @param start
 * @param end
 * @param TimesObj
 * @constructor
 */
const WaterFallEmail = (superObj, start, end, TimesObj) => {
  return new Promise((resolve, reject) => {
    try {
      // add manages to each manager user -> this is all non-tech users not necessarily a manager
      const managersKeys = Object.keys(superObj);
      managersKeys.forEach((username) => {
        superObj[username].manages = {};
      });
      return Promise.all(managersKeys.map((manager) => TH.addTechsToSupervisor(superObj, manager)))
      .then(() => Promise.all(managersKeys.map((manager) => EmailSupervisor(superObj[manager], start, end, TimesObj)))) // here is where you now email the managers;
      .then(resolve)
      .catch(reject);
    } catch (e) {
      reject(e);
    }
  })
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
    let SUNDAY;
    let WEDNESDAY;
    let TimesObj;
    let SuperObj;
    TH.getUsers()
      .then((users) => {
        const promises = [];
        const techs = [];
        users.forEach((user) => {
          if (user.role === 'tech') {
            techHash[user.username] = user;
            techs.push(user);
          } else {
            managers[user.username] = user;
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
        SUNDAY = SundayTimes;
        WEDNESDAY = WednesdayTimes;
        const TimeObjKeys = Object.keys(TimesObj);
        techs.forEach((tech) => {
          TimeObjKeys.forEach((day) => {
            promises.push(TH.getUserWorkOrdersHours(tech, TimesObj[day]));
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
      .then((objArr) => breakUpTechsBySupervisor(managers, objArr)) // returns just an object
      .then((obj) => {
        SuperObj = obj;
        // email all techs their weekly time thus far
        const managerKeys = Object.keys(managers);
        return Promise.all(managerKeys.map((manager) => {
          const SUPEROBJ = SuperObj[manager];
          if (SUPEROBJ.SupervisorObj) {
            return EmailSupervisorTechs(SUPEROBJ, SUNDAY, WEDNESDAY);
          } else {
            return new Promise((res) => res());
          }
        }));
      })// next waterfall email all managers up to Corporate level. then total to payroll.
      .then(() => WaterFallEmail(SuperObj, SUNDAY, WEDNESDAY, TimesObj))
      .then(resolve)
      .catch(reject);
  });
};

module.exports = SaturdayToWednesdayTotalsEmail;
