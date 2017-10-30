'use strict';
/*
* Man Hours monitoring email 1. Check done every 2 hours
*
* If man hours exceed 35 or 45 hours an email is sent to 2 different emails.
* Each hours should have a link to search
*
* If the hours are not there add them. Every update will update the times.
* */
const User = require('../../models/user'),
      WorkOrder = require('../../models/workOrder'),
      GmailMailer = require('../../helpers/email_helper'),
      nodemailer = require('nodemailer');

const startOfDay = (a) => {
  const From = new Date(a);
  return new Date(From.setHours(0, 0, 0, 0));
};

const endOfDay = (b) => {
  const To = new Date(b);
  return new Date(To.setHours(23, 59, 59, 999));
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({}).exec()
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Produce to - from dates for current week for WO querying
 * @returns {{returnStart: *, returnEnd: *}}
 */
const getToFromDates = () => {
  let returnStart;
  let returnEnd;
  const now = new Date();
  const toStart = new Date();
  const toEnd = new Date();
  const day = now.getDay();
  toStart.setDate(now.getDate() - day);
  returnStart = startOfDay(toStart);
  toEnd.setDate(now.getDate() + (6 - day));
  returnEnd = endOfDay(toEnd);
  return {returnStart, returnEnd};
};

/**
 * Produce total labor code time for a work order
 * separated into wo type catagories
 * @param wo
 * @returns {Promise}
 */
const getTotalLaborCodeTime = (wo) => {
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
          if((chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch')) {
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
              } else {
                Release.hours += +wo.laborCodes[lb][chlb].hours;
                Release.minutes += +wo.laborCodes[lb][chlb].minutes;
              }
            }
          }
        });
      });
      // console.log(Indirect);
      Indirect.hours += Indirect.minutes / 60;
      PM.hours += PM.minutes / 60;
      Corrective.hours += Corrective.minutes / 60;
      TroubleCall.hours += TroubleCall.minutes / 60;
      NewSet.hours += NewSet.minutes / 60;
      Release.hours += Release.minutes / 60;
      Travel.hours += Travel.minutes / 60;
      resolve({ Indirect, PM, Corrective, TroubleCall, NewSet, Release, Travel});
    } catch (e) {
      return reject(e);
    }
  });
};

/**
 * Get all work order hours for user for current week
 * Separate the times into types and have total as well
 * @param user
 * @param times
 * @returns {Promise}
 */
const getUserWorkOrdersHours = (user, times) => {
  return new Promise((resolve, reject) => {
    WorkOrder.find({
      techId: user.username,
      timeStarted: {$gte: times.returnStart, $lte: times.returnEnd},
      timeSubmitted: {$gte: times.returnStart, $lte: times.returnEnd},
    }).exec()
      .then((wos) => {
        const promises = [];
        if (wos.length === 0) {
          promises.push(new Promise((res) => res({
            Indirect: { hours: 0, minutes: 0 },
            PM: { hours: 0, minutes: 0 },
            Corrective: { hours: 0, minutes: 0 },
            TroubleCall: { hours: 0, minutes: 0 },
            NewSet: { hours: 0, minutes: 0 },
            Release: { hours: 0, minutes: 0 },
            Travel: { hours: 0, minutes: 0 },
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
          // console.log(objArr[0].Indirect.hours + objArr[0].PM.hours + objArr[0].Corrective.hours + objArr[0].TroubleCall.hours + objArr[0].NewSet.hours + objArr[0].Release.hours + objArr[0].Travel.hours);
          resolve({user, Indirect: objArr[0].Indirect.hours, PM: objArr[0].PM.hours, Corrective: objArr[0].Corrective.hours, TroubleCall: objArr[0].TroubleCall.hours, NewSet: objArr[0].NewSet.hours, Release: objArr[0].Release.hours, Travel: objArr[0].Travel.hours});
        } else {
          const Indirect = objArr.reduce((a, b) => {
            return a + b.Indirect.hours;
          }, 0);
          const PM = objArr.reduce((a, b) => {
            return  a + b.PM.hours;
          }, 0);
          const Corrective = objArr.reduce((a, b) => {
            return a + b.Corrective.hours;
          }, 0);
          const TroubleCall = objArr.reduce((a, b) => {
            return a + b.TroubleCall.hours;
          }, 0);
          const NewSet = objArr.reduce((a, b) => {
            return a + b.NewSet.hours;
          }, 0);
          const Release = objArr.reduce((a, b) => {
            return a + b.Release.hours;
          }, 0);
          const Travel = objArr.reduce((a, b) => {
            return a + b.Travel.hours;
          }, 0);
          // console.log(Indirect + PM + Corrective + TroubleCall + NewSet + Release + Travel);
          resolve({user, Indirect, PM, Corrective, TroubleCall, NewSet, Release, Travel});
        }
      })
      .catch(reject)
  });
};

const updateUser = (username, obj) => {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate({
        username,
      }, obj, {upsert: false}).exec()
      .then(resolve)
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
          const startTime = new Date(techObj.startTime).getTime();
          if (weekStart === startTime && type === techObj.user.hours.emailed) {
            console.log(0);
            resolve(false); // false
          } else {
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
 * Emailer for just to Manager
 * once done emailing update user object
 * @param manager
 * @param techObj
 * @returns {Promise}
 */
const emailManager = (manager, techObj) => {
  return new Promise((resolve, reject) => {
    const mailer = new GmailMailer();
    doesUserNeedEmail(techObj, manager.role)
      .then((bool) => {
        if (bool) {
          mailer.transport.verify((err, success) => {
            if (err) {
              return reject(err);
            } else {
              let mailOptions;
              try {
                mailOptions = {
                  from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                  subject: `Technician Time Report`,
                  to: `${manager.email}`,
                  html: `
                  <body>
                    <p>Manager: ${manager.firstName} ${manager.lastName}</p>
                    <p>Technician: ${techObj.user.firstName} ${techObj.user.lastName}</p>
                    <p>This technician has passed 35 hours in work orders this week.</p>
                    <table width="40%" border="1" cellpadding="10" cellspacing="0">
                      <tr>
                        <th align="left" style="background-color: #ccc">Type</td>
                        <th align="left" style="background-color: #ccc">Hours</th>
                      </tr>
                      <tr>
                        <td>PM</td>
                        <td>${techObj.PM.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Corrective</td>
                        <td>${techObj.Corrective.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Trouble Call</td>
                        <td>${techObj.TroubleCall.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Indirect</td>
                        <td>${techObj.Indirect.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Travel</td>
                        <td>${techObj.Travel.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>New Set</td>
                        <td>${techObj.NewSet.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Release</td>
                        <td>${techObj.Release.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #ccc">Total</td>
                        <td style="background-color: #ccc">${techObj.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </body>
                  `,
                }
              } catch (e) {
                return reject(e);
              }
              mailer.transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return reject(error);
                } else {
                  // update user
                  return updateUser(techObj.user.username, {
                    hours: {
                      weekStart:    techObj.startTime,
                      emailed:      'manager',
                      Indirect:     techObj.Indirect,
                      PM:           techObj.PM,
                      Corrective:   techObj.Corrective,
                      TroubleCall:  techObj.TroubleCall,
                      NewSet:       techObj.NewSet,
                      Release:      techObj.Release,
                      Travel:       techObj.TroubleCall,
                      total:        techObj.total,
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
          mailer.transport.verify((err, success) => {
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
              let mailOptions;
              try {
                mailOptions = {
                  from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                  subject: `Technician Time Report`,
                  to: `${manager.email}`,
                  cc: ['canderson@parkenergyservices.com'],
                  html: `
                  <body>
                    ${showManager(manager)}
                    <p>Technician: ${techObj.user.firstName} ${techObj.user.lastName}</p>
                    <p>This technician has passed or is at 45 hours in workorder time this week.</p>
                    <table width="40%" border="1" cellpadding="10" cellspacing="0">
                      <tr>
                        <th align="left" style="background-color: #ccc">Type</td>
                        <th align="left" style="background-color: #ccc">Hours</th>
                      </tr>
                      <tr>
                        <td>PM</td>
                        <td>${techObj.PM.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Corrective</td>
                        <td>${techObj.Corrective.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Trouble Call</td>
                        <td>${techObj.TroubleCall.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Indirect</td>
                        <td>${techObj.Indirect.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Travel</td>
                        <td>${techObj.Travel.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>New Set</td>
                        <td>${techObj.NewSet.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Release</td>
                        <td>${techObj.Release.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #ccc">Total</td>
                        <td style="background-color: #ccc">${techObj.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </body>
                  `,
                }
              } catch (e) {
                return reject(e);
              }
              mailer.transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return reject(error);
                } else {
                  // update user
                  return updateUser(techObj.user.username, {
                    hours: {
                      weekStart:    techObj.startTime,
                      emailed:      'admin',
                      Indirect:     techObj.Indirect,
                      PM:           techObj.PM,
                      Corrective:   techObj.Corrective,
                      TroubleCall:  techObj.TroubleCall,
                      NewSet:       techObj.NewSet,
                      Release:      techObj.Release,
                      Travel:       techObj.TroubleCall,
                      total:        techObj.total,
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
          mailer.transport.verify((err, success) => {
            if (err) {
              return reject(err);
            } else {
              let mailOptions;
              try {
                mailOptions = {
                  from: `"Orion Alerts" <orionalerts@parkenergyservices.com>`,
                  subject: `Technician Time Report`,
                  to: 'orionalerts@parkenergyservices.com',
                  html: `
                  <body>
                    <p>No manager was found or Admin</p>
                    <p>This technician has passed or is at 45 hours in workorder time this week.</p>
                    <table width="40%" border="1" cellpadding="10" cellspacing="0">
                      <tr>
                        <th align="left" style="background-color: #ccc">Type</td>
                        <th align="left" style="background-color: #ccc">Hours</th>
                      </tr>
                      <tr>
                        <td>PM</td>
                        <td>${techObj.PM.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Corrective</td>
                        <td>${techObj.Corrective.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Trouble Call</td>
                        <td>${techObj.TroubleCall.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Indirect</td>
                        <td>${techObj.Indirect.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Travel</td>
                        <td>${techObj.Travel.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>New Set</td>
                        <td>${techObj.NewSet.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Release</td>
                        <td>${techObj.Release.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #ccc">Total</td>
                        <td style="background-color: #ccc">${techObj.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </body>
                  `,
                }
              } catch (e) {
                return reject(e);
              }
              mailer.transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return reject(error);
                } else {
                  // update user
                  return updateUser(techObj.user.username, {
                    hours: {
                      weekStart:    techObj.startTime,
                      emailed:      'orion',
                      Indirect:     techObj.Indirect,
                      PM:           techObj.PM,
                      Corrective:   techObj.Corrective,
                      TroubleCall:  techObj.TroubleCall,
                      NewSet:       techObj.NewSet,
                      Release:      techObj.Release,
                      Travel:       techObj.TroubleCall,
                      total:        techObj.total,
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
 * Main method
 * Gets all users. Saves managers and techs to memory
 * then tests their work order time. Accordingly email
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
    getUsers()
      .then((users) => {
        const promises = [];
        const techs = [];
        users.forEach((user) => {
          if (user.role === 'tech') {
            techHash[user.username] = user;
            techs.push(user);
          } else if (user.role === 'manager') {
            managers[user.username] = user;
          }
          if (user.username === 'CAN001') {
            admin = user;
          }
        });
        const times = getToFromDates();
        startTime = times.returnStart;
        techs.forEach((tech) => {
          promises.push(getUserWorkOrdersHours(tech, times));
        });
        
        return Promise.all(promises)
      })
      .then((objArr) => {
        const promises = [];
        // update users first then send emails out
        objArr.forEach((obj) => {
          const thisUser = techHash[obj.user.username];
          const total = obj.Indirect + obj.PM + obj.Corrective + obj.TroubleCall + obj.NewSet + obj.Release + obj.Release + obj.Travel;
          if (total >= 45) {
            console.log('total >= 45')
            if (obj.user.supervisor && admin) {
              const supervisor = managers[obj.user.supervisor];
              // promises.push(emailManagerAdmin(supervisor, admin, {...obj, total, startTime}));
              promises.push(emailManagerAdmin(supervisor, admin, {user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Release: obj.Release,
                Travel: obj.Travel,
                total, startTime}));
            } else if (!obj.user.supervisor && admin) {
              // email admin manager is missing.
              promises.push(emailManagerAdmin(false, admin, {user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Release: obj.Release,
                Travel: obj.Travel,
                total, startTime}));
            } else {
              // email orion alerts all were missing
              promises.push(emailOrionAlerts({user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Release: obj.Release,
                Travel: obj.Travel,
                total, startTime}));
            }
          } else if (total >= 35 && total < 45) {
            console.log('total >= 35 but total < 45')
            if (obj.user.supervisor) {
              const supervisor = managers[obj.user.supervisor];
              promises.push(emailManager(supervisor, {user: obj.user,
                Indirect: obj.Indirect,
                PM: obj.PM,
                Corrective: obj.Corrective,
                TroubleCall: obj.TroubleCall,
                NewSet: obj.NewSet,
                Release: obj.Release,
                Travel: obj.Travel,
                total, startTime}));
            }
          } else if (thisUser.hours.weekStart) {
            const weekStart = new Date(thisUser.hours.weekStart).getTime();
            const startGetTime = new Date(startTime).getTime();
            if (weekStart !== startGetTime) {
              console.log('reset Time');
              console.log(thisUser.hours.weekStart);
              console.log(startTime);
              promises.push(updateUser(techObj.user.username, {
                hours: {
                  weekStart:    startTime,
                  emailed:      'none',
                  Indirect:     0,
                  PM:           0,
                  Corrective:   0,
                  TroubleCall:  0,
                  NewSet:       0,
                  Release:      0,
                  Travel:       0,
                  total:        0,
                }
              }));
            } else {
              promises.push(updateUser(obj.user.username, {
                hours: {
                  weekStart:    startTime,
                  emailed:      'none',
                  Indirect:     obj.Indirect,
                  PM:           obj.PM,
                  Corrective:   obj.Corrective,
                  TroubleCall:  obj.TroubleCall,
                  NewSet:       obj.NewSet,
                  Release:      obj.Release,
                  Travel:       obj.Travel,
                  total:        total,
                }
              }));
            }
          } else {
            promises.push(updateUser(obj.user.username, {
              hours: {
                weekStart:    startTime,
                emailed:      'none',
                Indirect:     obj.Indirect,
                PM:           obj.PM,
                Corrective:   obj.Corrective,
                TroubleCall:  obj.TroubleCall,
                NewSet:       obj.NewSet,
                Release:      obj.Release,
                Travel:       obj.Travel,
                total:        total,
              }
            }));
            // promises.push(new Promise((res) => res()));
          }
        }); //  you are here. you are trying to figure out how to update users and send the email
        return Promise.all(promises);
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = manHourMonitoringFn;
