function WOs() {
  return {
    timeStarted: null,
    timeSubmitted: null,
    timeApproved: null,

    techId: "",
    type: "",
    atShop: "",

    header: {
      unitNumber: "",
      customerName: "",
      county: "",
      state: "",
      leaseName: "",
    },
    comments: {
      indirectNotes: "",
    },
    laborCodes: {
      basic: {
        safety: { hours: 0, minutes: 0 },
        positiveAdj: { hours: 0, minutes: 0 },
        negativeAdj: { hours: 0, minutes: 0 },
        lunch: { hours: 0, minutes: 0 },
        custRelations: { hours: 0, minutes: 0 },
        telemetry: { hours: 0, minutes: 0 },
        environmental: { hours: 0, minutes: 0 },
        diagnostic: { hours: 0, minutes: 0 },
        serviceTravel: { hours: 0, minutes: 0 },
        optimizeUnit: { hours: 0, minutes: 0 },
        pm: { hours: 0, minutes: 0 },
        washUnit: { hours: 0, minutes: 0 },
        inventory: { hours: 0, minutes: 0 },
        training: { hours: 0, minutes: 0 },
      },
      engine: {
        oilAndFilter: { hours: 0, minutes: 0 },
        addOil: { hours: 0, minutes: 0 },
        compression: { hours: 0, minutes: 0 },
        replaceEngine: { hours: 0, minutes: 0 },
        replaceCylHead: { hours: 0, minutes: 0 },
        coolingSystem: { hours: 0, minutes: 0 },
        fuelSystem: { hours: 0, minutes: 0 },
        ignition: { hours: 0, minutes: 0 },
        starter: { hours: 0, minutes: 0 },
        lubrication: { hours: 0, minutes: 0 },
        exhaust: { hours: 0, minutes: 0 },
        alternator: { hours: 0, minutes: 0 },
        driveOrCoupling: { hours: 0, minutes: 0 },
        sealsAndGaskets: { hours: 0, minutes: 0 },
      },
      emissions: {
        install: { hours: 0, minutes: 0 },
        test: { hours: 0, minutes: 0 },
        repair: { hours: 0, minutes: 0 },
      },
      panel: {
        panel: { hours: 0, minutes: 0 },
        electrical: { hours: 0, minutes: 0 },
      },
      compressor: {
        inspect: { hours: 0, minutes: 0 },
        replace: { hours: 0, minutes: 0 },
        addOil: { hours: 0, minutes: 0 },
      },
      cooler: {
        cooling: { hours: 0, minutes: 0 },
      },
      vessel: {
        dumpControl: { hours: 0, minutes: 0 },
        reliefValve: { hours: 0, minutes: 0 },
        suctionValve: { hours: 0, minutes: 0 },
      },
    },
  };
}

module.exports = (db, query, PTOs) => {
    
  console.log("query -" + JSON.stringify(query));
  return new Promise((resolve, reject) => {
    const TH = require("../helpers/task_helper");
    const rmArrObjDups = require("tedb-utils").rmArrObjDups;
    const isEmpty = require("tedb-utils").isEmpty;
    let ptos = [];
    let wos = [];
    const setPTOTimeForUser = (ptos, diff, weekStart) => {
      let done = false;
      ptos.forEach((pto) => {
        if (!done) {
          pto.ptoDays.forEach((ptoday) => {
            if (
              !done &&
              diff !== 0 &&
              new Date(ptoday.dateOf).getTime() > weekStart
            ) {
              if (ptoday.hours === diff || ptoday.hours < diff) {
                diff -= ptoday.hours;
                ptoday.hours = 0;
              } else {
                // ptoday.hours > diff
                ptoday.hours -= diff;

                console.info("pto hours " + diff);
                done = true;
              }
            }
          });
        }
      });
    };

    const createPTOcsvObjs = (ptos, wos, days, weekStart) => {
      return new Promise((resolve, reject) => {
        // users {} will hold, {username: hours, username: hours,...}
        if (days.length !== 7) {
          return reject(
            "Cannot query time that is not 7 days long for work week"
          );
        }
        const users = {};
        days.forEach((day) => {
          ptos.forEach((pto) => {
            // make sure user has an hour time PTO and WO list
            if (isEmpty(users[pto.username])) {
              users[pto.username] = {
                PTOs: [],
                WOs: [],
                hours: 0,
                ptoTime: 0,
              };
            }
            // add pto hours to total time for this user for this day
            pto.ptoDays.forEach((ptoDay) => {
              if (
                new Date(ptoDay.dateOf).getTime() >= day.start &&
                new Date(ptoDay.dateOf).getTime() <= day.end &&
                pto.status !== "Rejected"
              ) {
                users[pto.username].hours += ptoDay.hours;
                users[pto.username].ptoTime += ptoDay.hours;
              }
            });
          });
          // add wo time to user
          wos.forEach((wo) => {
            if (isEmpty(users[wo.techId])) {
              users[wo.techId] = {
                PTOs: [],
                WOs: [],
                hours: 0,
                ptoTime: 0,
              };
            }
            if (
              new Date(wo.timeSubmitted).getTime() >= day.start &&
              new Date(wo.timeSubmitted).getTime() <= day.end
            ) {
              users[wo.techId].hours += +wo.totalWOTimebase10;
            }
          });
        });
        ptos.forEach((pto) => {
          // add PTO to user pto list
          users[pto.username]["PTOs"].push(pto);
        });
        // array of usernames
        const USERS = Object.keys(users);
        // now loop over each user.
        USERS.forEach((user) => {
          // make sure that pto does not add total time to be over 40
          // can be over 40 if pto time is 0;
          if (users[user].PTOs.length > 0 && users[user].hours > 40) {
            const diff = users[user].hours - 40;
            if (diff === users[user].ptoTime || diff > users[user].ptoTime) {
              // the difference in pto time is the difference
              // then set all pto time to 0
              // or the diff is greater than the pto time
              // so again remove all pto time.
              users[user].PTOs.forEach((pto) => {
                pto.ptoDays.forEach((ptoday) => {
                  if (new Date(ptoday.dateOf).getTime() > weekStart) {
                    ptoday.hours = 0;
                  }
                });
              });
            } else {
              // (diff < users[user].ptoTime)
              // there is some pto time that needs to be taken
              // from the current ptos. only subtract the diff
              // ex: total hours - 40 = 5
              // then 5 hours of pto needs to be removed
              setPTOTimeForUser(users[user].PTOs, diff, weekStart);
            }
          }
        });
        const returnPTOs = [];
        USERS.forEach((user) => {
          users[user].PTOs.forEach((pto) => {
            if (pto.status !== "Rejected") {
              // pto.hours = 0;
              pto.ptoDays.forEach((ptoday) => {
                if (
                  new Date(ptoday.dateOf).getTime() > weekStart &&
                  ptoday.hours > 0
                ) {
                  const dateFrom = TH.startOfDay(new Date(ptoday.dateOf));
                  const dateTo = TH.endOfDay(new Date(ptoday.dateOf));
                  returnPTOs.push({
                    timeStarted: dateFrom,
                    timeEnded: dateTo,
                    techId: pto.username,
                    hours: ptoday.hours,
                    status: pto.status,
                    typeofitem: "pto",
                  });
                  // pto.hours += ptoday.hours;
                }
              });
            }
          });
        });
        resolve(returnPTOs);
      });
    };
//
 

    //  query.timeStarted.$gte = new Date( "2021-20-31T05:00:00Z");  
     // console.log(query.timeStarted.$gte) ;
      
                  var qlte = new Date(query.timeStarted.$lte);
      var EndQueryDate = new Date(query.timeStarted.$lte);
      var StartQueryDate = new Date (query.timeStarted.$gte);
            nqlte = qlte.toLocaleString('en-US', { timeZone: 'America/Chicago' });
      
            var qedate = new Date(nqlte);
var tdiff = qlte - qedate; 
      qlte.setTime(qlte.getTime() + (tdiff));
      
      
      
       query.timeStarted = {
            $gte: query.timeStarted.$gte,
            $lte: qlte
        };
    const cursor = db.find(query).lean().cursor();
    const returnPTO1 = () => {
      return new Promise((resolve, reject) => {
        const ptoCursor1 = PTOs.find({
          DateFrom: {
            $gte: query.timeStarted.$gte,
            $lte: query.timeStarted.$lte,
          },
        })
          .lean()
          .cursor();
        ptoCursor1
          .eachAsync((docpto) => {
            ptos.push(docpto);
            return new Promise((res) => res());
          })
          .then(resolve)
          .catch(reject);
      });
    };
    const returnPTO2 = () => {
      return new Promise((resolve, reject) => {
        const ptoCursor2 = PTOs.find({
          DateTo: {
            $gte: query.timeStarted.$gte,
            $lte: query.timeStarted.$lte,
          },
        })
          .lean()
          .cursor();
        ptoCursor2
          .eachAsync((docpto) => {
            ptos.push(docpto);
            return new Promise((res) => res());
          })
          .then(resolve)
          .catch(reject);
      });
    };

    cursor
      .eachAsync((doc) => {
        const timeObj = TH.getTotalWOTimeNoPromise(doc);
        doc.totalWOTimebase10 = timeObj.decimal.toFixed(4);
        doc.typeofitem = "workorder";
        wos.push(doc);
        return returnPTO1();
      })
      .then(() => {
        return returnPTO2();
      })
      .then(() => {
        ptos = rmArrObjDups(ptos, "ptoId");
        const DAYS = TH.weekDaysFromDates(
          new Date(query.timeStarted.$gte).getTime(),
          new Date(query.timeStarted.$lte).getTime()
        );
        return createPTOcsvObjs(
          ptos,
          wos,
          DAYS,
          new Date(query.timeStarted.$gte).getTime()
        );
      })
      .then((docs) => docs.concat(wos))
      .then((docs) => {
        return docs.reduce((csv, row) => {
         // console.info(row); 
            
            
//Start date from UTC to OKlahoma time
            var sdate = new Date(row.timeStarted);
            
            sdate = sdate.toLocaleString('en-US', { timeZone: 'America/Chicago' }); 
               var inrange = ''; 
            var s= new Date(sdate);
            if (s >= StartQueryDate  && s <= EndQueryDate  )  { inrange = 'True'  } else { inrange = 'False' }
             var edate = new Date(row.timeSubmitted); 
               edate = edate.toLocaleString('en-US', { timeZone: 'America/Chicago' });
           e = new Date(edate); 
          if (row.typeofitem === "workorder") {
            const timeStarted = TH.toExcelTime(s);
          
       
            var timeSubmitted = TH.toExcelTime(e);
            var ts1 = new Date(timeStarted);
           
  

              var wte = new Date(timeSubmitted);  // workorder time end
              var te = new Date(ts1.getTime() + row.totalWOTimebase10*60*60*1000);
           //   console.info(row.techId + " " + row.header.unitNumber + " Totoal time  " + row.totalWOTimebase10); 
                                              
            if (ts1.getDay() != te.getDay()) {
              var ts2 = new Date(te.getFullYear(), te.getMonth(), te.getDate()); //   0000 o'clock second day of workorder
              var hoursDay1 = Math.abs(ts2 - ts1) / 36e5;
               hoursDay1 = (Math.round(hoursDay1 * 100) / 100).toFixed(3);
                var hoursDay2 = row.totalWOTimebase10 - hoursDay1;
              //  console.info(                "after Midnight "    );

      if (inrange == 'True') {  
              csv +=
                [
                  timeStarted ,
                  timeSubmitted,
                  row.techId,
                 row.truckId,
                   hoursDay1   ,
                  row.type ,
                  row.atShop ? row.atShop : false,
                  // Header
                  row.header.unitNumber,
                  TH.sanitize(row.header.customerName),
                  row.header.county,
                  row.header.state,
                  TH.sanitize(row.header.leaseName),
                  TH.sanitize(row.comments.indirectNotes), 
                ].join(",") + "\n";
      } 
                if (ts2 >= StartQueryDate  && ts2 <= EndQueryDate  )  { inrange = 'True'  } else { inrange = 'False' }
          if (inrange == 'True') {  
              csv +=
                [
                  TH.toExcelTime(ts2),
                  timeSubmitted,
                  row.techId,
                row.truckId,
                  hoursDay2,
                  row.type   ,
                  row.atShop ? row.atShop : false,
                  // Header
                  row.header.unitNumber,
                  TH.sanitize(row.header.customerName),
                  row.header.county,
                  row.header.state,
                  TH.sanitize(row.header.leaseName),
                  TH.sanitize(row.comments.indirectNotes),
                ].join(",") + "\n";
          }
            } else {
                 if (inrange == 'True') {  
              csv +=
                [
                timeStarted ,
                  timeSubmitted,
                  row.techId,
                  "-",
                  row.totalWOTimebase10,
                  row.type ,
                  row.atShop ? row.atShop : false,
                  // Header
                  row.header.unitNumber,
                  TH.sanitize(row.header.customerName),
                  row.header.county,
                  row.header.state,
                  TH.sanitize(row.header.leaseName),
                  TH.sanitize(row.comments.indirectNotes),
                ].join(",") + "\n";
                 }
            }

            return (csv);
		  
          } else {
            const Started = TH.toExcelTime(row.timeStarted);
              
            const ended = TH.toExcelTime(row.timeEnded);
            return (
              csv +
              [
                Started,
                ended,
                row.techId,
                "-",
                row.hours,
                row.status,
                false, // at shop
                "", // unit number
                "-", // customer name
                "-", // county
                "-", // state
                "-", // lease name
                "PTO", // notes
              ].join(",") +
              "\n"
            );
          }
        }, "TimeStarted,TimeSubmitted,TechId,TruckId,Total Hours Decimal,Type,AtShop,Header.unitNumber,Header.customer,Header.county,Header.state,Header.lease,Comments.indirectNotes,\n");
      })
      .then((r) => {
        resolve(r);
      })
      .catch(reject);   // JSON.stringify(query)
  });
};
