'use strict';

const User = require('../models/user'),
      WorkOrder = require('../models/workOrder'),
      GmailMailer = require('../helpers/email_helper'),
      nodemailer = require('nodemailer'),
      log = require('../helpers/logger');

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

const getTotalLaborCodeTime = (wo) => {
  return new Promise((resolve, reject) => {
    const indirectTypes = ['safety', 'custRelations', 'training'];
    const travelTypes = ['serviceTravel'];
    const Indirect = {
      hours: 0,
      minutes: 0,
    };
    const Direct = {
      hours: 0,
      minutes: 0,
    };
    const Travel = {
      hours: 0,
      minutes: 0,
    };
    const laborCodeKeys = Object.keys(wo.laborCodes); // basic, engine, ... so on
    laborCodeKeys.forEach((lb) => {
      const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]); // basic: { safety... so on
      childLaborCodeKeys.forEach((chlb) => {
        if (chlb !== 'positiveAdj' || chlb !== 'negativeAdj' || chlb !== 'lunch') {
          if (indirectTypes.indexOf(chlb) !== -1) {
            Indirect.hours += +wo.laborCodes[lb][chlb].hours;
            Indirect.minutes += +wo.laborCodes[lb][chlb].minutes;
          } else if (travelTypes.indexOf(chlb) !== -1) {
            Travel.hours += +wo.laborCodes[lb][chlb].hours;
            Travel.minutes += +wo.laborCodes[lb][chlb].minutes;
          } else {
            Direct.hours += +wo.laborCodes[lb][chlb].hours;
            Direct.minutes += +wo.laborCodes[lb][chlb].minutes;
          }
        }
      });
    });
    Indirect.hours += Math.floor(Indirect.minutes / 60);
    Direct.hours += Math.floor(Direct.minutes / 60);
    Travel.hours += Math.floor(Travel.minutes / 60);
    resolve({ Indirect, Direct, Travel });
  });
};

const getUserWorkOrdersHours = (user) => {
  return new Promise((resolve, reject) => {
    console.log(user.username);
    const times = getToFromDates();
    WorkOrder.find({
      techId: user.username,
      timeStarted: {$gte: times.returnStart, $lte: times.returnEnd},
      timeSubmitted: {$gte: times.returnStart, $lte: times.returnEnd},
    }).exec()
      .then((wos) => {
        console.log('user work order hours');
        const promises = [];
        wos.forEach((wo) => {
          promises.push(getTotalLaborCodeTime(wo));
        });
        return Promise.all(promises);
      })
      .then((objArr) => {
        console.log('combine user wo hours');
        const Indirect = objArr.reduce((a, b) => a.Indirect.hours + b.Indirect.hours);
        const Direct = objArr.reduce((a, b) => a.Direct.hours + b.Direct.hours);
        const Travel = objArr.reduce((a, b) => a.Travel.hours + b.Travel.hours);
        console.log(Indirect + Direct + Travel);
        resolve({user, Indirect, Direct, Travel});
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

const emailManager = (manager, techObj) => {
  return new Promise((resolve, reject) => {
  
  });
};

const manHourMonitoring = () => {
  return new Promise((resolve, reject) => {
    const managers = {};
    getUsers()
      .then((users) => {
        const promises = [];
        const techs = [];
        users.forEach((user) => {
          if (user.role === 'tech') {
            techs.push(user);
          } else if (user.role === 'manager') {
            managers[user.username] = user;
          }
        });
        techs.forEach((tech) => {
          promises.push(getUserWorkOrdersHours(tech));
        });
        Promise.all(promises)
      })
      .then((objArr) => {
        const promises = [];
        // update users first then send emails out
        objArr.forEach((obj) => {
          const total = obj.Indirect.hours + obj.Direct.hours + obj.Travel.hours;
          if (total > 35) {
            if (obj.user.supervisor) {
              const supervisor = managers[obj.user.supervisor];
              
            }
          } else if (total > 45) {
            // email orion alerts
          }
        }); //  you are here. you are trying to figure out how to update users and send the email
      })
      .catch(reject);
  });
};

module.exports = manHourMonitoring;
