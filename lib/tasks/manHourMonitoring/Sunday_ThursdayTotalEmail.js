'use strict';
/*
* Man hours from Monday to Thursday totaled and grouped by managers
* then emailed to table to each manager.
*
* This should be a simple totalling of time and sent to each manager no matter
* what the times are.
* */

const User = require('../../models/user'),
    WorkOrder = require('../../models/workOrder'),
    GmailMailer = require('../../helpers/email_helper'),
    TH = require('../../helpers/task_helper'),
    nodemailer = require('nodemailer');

/**
 * Method to gather all labor code time for a given workorder
 * @param wo
 * @returns {Promise}
 */
const getTotalLaborCodeTime = (wo) => {
  return new Promise((resolve, reject) => {
    try {
      const Total = {
        hours: 0,
        minutes: 0,
      };
      const laborCodes = Object.keys(wo.laborCodes); // basic, engine, ... so on
      laborCodes.forEach((lb) => {
        const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]); // basic: { safety... so on
        childLaborCodeKeys.forEach((chlb) => {
          if((chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch')) {
            Total.hours += +wo.laborCodes[lb][chlb].hours;
            Total.minutes += +wo.laborCodes[lb][chlb].minutes;
          }
        });
      });
      Total.hours += Total.minutes / 60;
      resolve({Total});
    } catch(e) {
      return reject(e);
    }
  })
};

/**
 * Get work order hours for date time given. Should only be a single day
 * and returns it as an object with the tech and day ant total hours
 * for that day.
 * @param user
 * @param date -> Sunday... etc {times: {}, day: 'Sunday'} like this
 * @returns {Promise}
 */
const getUserWorkOrdersHours = (user, date) => {
  return new Promise((resolve, reject) => {
    WorkOrder.find({
      techId: user.username,
      timeStarted: {$gte: date.times.returnStart, $lte: date.times.returnEnd},
    }).exec()
      .then((wos) => {
        const promises = [];
        if (wos.length === 0) {
          promises.push(new Promise((res) => res({
            Total: {hours: 0, minutes: 0},
          })));
        } else {
          wos.forEach((wo) => {
            promises.push(getTotalLaborCodeTime(wo));
          });
        }
        return Promise.all(promises);
      })
      .then((objArr) => {
        if (objArr.length === 1) {
          resolve({user, Total: objArr[0].Total.hours, date: date});
        } else {
          const Total = objArr.reduce((a, b) => {
            return a + b.Total.hours;
          }, 0);
          resolve({user, Total, date: date});
        }
      })
      .catch(reject);
  });
};

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
  } else if (techObj.date.day === 'Thursday') {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Thursday'] = techObj.Total;
  } else {
    returnObj[techObj.user.supervisor].techs[techObj.user.username]['Sunday'] = techObj.Total;
  }
  returnObj[techObj.user.supervisor].techs[techObj.user.username]['tech'] = techObj.user;
};
/**
 * Specific version for when the technician does not have a supervisor. Should not
 * happen and if it does that means someone forgot ot assign the tech a supervisor
 * @param techObj
 * @param returnObj
 * @constructor
 */
const NoManagerObjDay = (techObj, returnObj) => {
  returnObj['Orion']['SupervisorObj'] = {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email: 'orionalerts@parkenergyservices.com'};
  if (techObj.date.day === 'Monday') {
    returnObj['Orion'].techs[techObj.user.username]['Monday'] = techObj.Total;
  } else if (techObj.date.day === 'Tuesday') {
    returnObj['Orion'].techs[techObj.user.username]['Tuesday'] = techObj.Total;
  } else if (techObj.date.day === 'Wednesday') {
    returnObj['Orion'].techs[techObj.user.username]['Wednesday'] = techObj.Total;
  } else if (techObj.date.day === 'Thursday') {
    returnObj['Orion'].techs[techObj.user.username]['Thursday'] = techObj.Total;
  } else {
    returnObj['Orion'].techs[techObj.user.username]['Sunday'] = techObj.Total;
  }
  returnObj['Orion'].techs[techObj.user.username]['tech'] = techObj.user;
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
      managers.forEach((manager) => returnObj[manager] = {techs: {}});
      /**
       * Need to make sure the 'SupervisorObj' is created on the object before population
       */
      techObjArr.forEach((techObj) => {
        if (techObj.user.supervisor) {
          if (!managersHash[techObj.user.supervisor]) {
            returnObj['Orion']['SupervisorObj'] = {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email: 'orionalerts@parkenergyservices.com'};
          }
        } else {
          returnObj['Orion']['SupervisorObj'] = {firstName: 'Orion', lastName: 'Alerts', username: 'No Manager', role: 'admin', email: 'orionalerts@parkenergyservices.com'};
        }
      });
      /**
       * Need to make sure each technician object exists on the object before adding new
       * fields otherwise will get an error like 'Cannot set Monday of undefined'.
       */
      techObjArr.forEach((techObj) => {
        if (techObj.user.supervisor) {
          if (managersHash[techObj.user.supervisor]) {
            returnObj[techObj.user.supervisor].techs[techObj.user.username] = {};
          } else {
            returnObj['Orion'].techs[techObj.user.username] = {};
          }
        } else {
          returnObj['Orion'].techs[techObj.user.username] = {};
        }
      });
      /**
       * Finally populate all fields of the super object
       */
      techObjArr.forEach((techObj) => {
        // console.log(techObj);
        if (techObj.user.supervisor) {
          if (managersHash[techObj.user.supervisor]) {
            addTechObjDay(managersHash, techObj, returnObj);
          } else {
            // no matching manager name in hash of managers for supervisor
            NoManagerObjDay(techObj, returnObj);
          }
        } else {
          // no manager send to orion alerts
          NoManagerObjDay(techObj, returnObj);
        }
      });
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
 * @returns {string}
 */
const renderTableRow = (tech, spoTechs) => {
  return `
    <tr id="${tech}">
      <td>${spoTechs[tech].tech.firstName} ${spoTechs[tech].tech.lastName}</td>
      <td>${spoTechs[tech].Sunday.toFixed(2)}</td>
      <td>${spoTechs[tech].Monday.toFixed(2)}</td>
      <td>${spoTechs[tech].Tuesday.toFixed(2)}</td>
      <td>${spoTechs[tech].Wednesday.toFixed(2)}</td>
      <td>${spoTechs[tech].Thursday.toFixed(2)}</td>
    </tr>
  `;
};

/**
 * Render the dynamic list of technicians
 * @param spo
 * @returns {string}
 */
const renderTableRows = (spo) => {
  const spoTechs = Object.keys(spo.techs);
  return spoTechs.map((tech) => {
    if (spo.techs[tech].tech.email) {
      return `${renderTableRow(tech, spo.techs)}`
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

const header = ['Tech', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

/**
 * Renders the table header. Static heading
 * @param spo
 * @returns {string}
 */
const renderTable = (spo) => {
  return `
    <table width="100%" border="1" cellpadding="10" cellspacing="0">
      <tr>
        ${renderTableHeader(header)}
      </tr>
      ${renderTableRows(spo)}
    </table>
  `;
};

/**
 * Email method to email to manager
 * @param spo
 * @returns {Promise}
 * @constructor
 */
const EmailSupervisor = (spo) => {
  return new Promise((resolve, reject) => {
    try {
      if (spo.SupervisorObj.email) {
        const mailer = new GmailMailer();
        mailer.transport.verify((err, success) => {
          if (err) {
            return reject(err);
          } else {
            let mailerOptions;
            mailerOptions = {
              from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
              subject: `Sunday - Thursday Total Workorder Time Submitted`,
              to: 'mwhelan@parkenergyservices.com',
              html: `
            <body>
              <p>Name: ${spo.SupervisorObj.firstName} ${spo.SupervisorObj.lastName}</p>
              <p>Technician workorder hours from Sunday to Thursday.</p>
              ${renderTable(spo)}
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
      }  else {
        resolve();
      }
    } catch(e) {
      return reject(e);
    }
  });
};


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

const emailTech = (spo, tech) => {
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
              subject: `Sunday - Thursday Total Workorder Time Submitted`,
              to: 'mwhelan@parkenergyservices.com',
              html: `
              <body>
                <p>Supervisor: ${spo.SupervisorObj.firstName} ${spo.SupervisorObj.lastName}</p>
                <p>Name: ${user.firstName} ${user.lastName}</p>
                <p>Your workorder hours from Sunday to Thursday that have been submitted</p>
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
      return reject(e);
    }
  });
};

const EmailSupervisorTech = (spo) => {
  const promises = [];
  const techs = Object.keys(spo.techs); // get technicians from this supervisor to email
  if (techs.length === 0) {
    promises.push(new Promise((res) => res()));
  }
  techs.forEach((tech) => {
    promises.push(emailTech(spo, tech));
  });
  return Promise.all(promises);
};

/**
 * Break out and email each manager their tech
 * table
 * @param managers
 * @param superObj
 * @returns {Promise}
 * @constructor
 */
const EmailSupervisors = (managers, superObj) => {
  const promises = [];
  const managerKeys = Object.keys(managers);
  managerKeys.forEach((manager) => {
    const superVisorObj = superObj[manager];
    if (superVisorObj.SupervisorObj) {
      promises.push(EmailSupervisor(superVisorObj));
      promises.push(EmailSupervisorTech(superVisorObj));
    } else {
      promises.push(new Promise((res) => res()));
    }
  });
  return Promise.all(promises);
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
const SundayThursdayTotalEmail = () => {
  return new Promise((resolve, reject) => {
    const managers = {};
    const techHash = {};
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
        const SundayTimes = TH.getToFromDates(0, now.getDay());
        const MondayTimes = TH.getToFromDates(1, now.getDay() - 1);
        const TuesdayTimes = TH.getToFromDates(2, now.getDay() - 2);
        const WednesdayTimes = TH.getToFromDates(3, now.getDay() - 3);
        const ThursdayTimes = TH.getToFromDates(4, now.getDay() - 4);
        const TimesObj = {
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
          }
        };
        const TimeObjKeys = Object.keys(TimesObj);
        techs.forEach((tech) => {
          TimeObjKeys.forEach((day) => {
            promises.push(getUserWorkOrdersHours(tech, TimesObj[day]));
          });
        });
        return Promise.all(promises);
      })
      .then((objArr) => breakUpTechsBySupervisor(managers, objArr)) // returns just an object
      .then((obj) => EmailSupervisors(managers, obj))
      .then(resolve)
      .catch(reject);
  });
};

module.exports = SundayThursdayTotalEmail;
