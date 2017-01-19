/**
 *            callReport
 *
 * Created by marcuswhelan on 1/18/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
const CallReport = require('../../lib/models/callReport');
const mongoose   = require('mongoose');
const config     = require('../../config');
const Promise    = require('bluebird');
const should     = require('should');
const _          = require('lodash');
const fixture    = require('../fixture/callReport.json');

before(done => {
  CallReport.remove({}, done);
});

after(done => {
  CallReport.remove({}, done);
});

describe("CallReport Units", () => {
  
  describe("#createDoc()", () => {
    
    it("Should create and return a new document", () => {
      return CallReport.createDoc(fixture)
        .then(doc => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.callTime.should.be.a.Date();
          doc.updated_at.should.be.a.Date();
          doc.username.should.equal("TEST001");
          doc.phoneNumber.should.be.a.String();
        });
    });
  }); /* End of 'describe' #createDoc */
  
  describe("#fetch()", () => {
    let id;
    
    before(() => {
      return CallReport.remove({})
        .then(() => {
          return CallReport.createDoc(fixture);
        }).then(doc => {
          id = doc._id;
      });
    });
    
    it("Should fetch one document", () => {
      return CallReport.fetch(id)
        .then(doc => {
          doc.should.have.property("_id");
          doc.should.have.property("customer");
          doc.phoneNumber.should.be.a.String();
          doc.title.should.be.equal("TestTitle");
        });
    });
  }); /* End of 'describe' #fetch() */
  
  describe('#list()', () =>{
    
    before(() => {
      return new Promise((resolve, reject) => {
        CallReport.remove({})
          .then(() => {
            
            let phoneDocs = _.range(25).map(() => {
              let f = _.cloneDeep(fixture);
              delete f._id;
              f.phoneNumber = '198-765-4321';
              return f;
            });
            
            let userDocs = _.range(25).map(() => {
              let f = _.cloneDeep(fixture);
              delete f._id;
              f.username = 'Tester2';
              return f;
            });
            
            let activityDocs = _.range(25).map(() => {
              let f = _.cloneDeep(fixture);
              delete f._id;
              f.activityType = "golf";
              return f;
            });
            
            let dateDocs = _.range(25).map(() => {
              let f = _.cloneDeep(fixture);
              delete f._id;
              f.callTime = new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)');
              return f;
            });
            
            return _.flatten([phoneDocs, userDocs, activityDocs, dateDocs]);
          })
          .then(docs => {
            return CallReport.insertMany(docs);
          })
          .then(resolve)
          .catch(reject);
      }); /* End of 'before' #list() Promise */
    }); /* End of 'before' #list() */
    
    it("Should list 4 pages of 25 results", () => {
      let options = {
        sort: '-callTime',
        limit: 25,
        skip: 0
      };
      
      return CallReport.list(options)
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip += 25;
          
          return CallReport.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip += 25;
          
          return CallReport.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip += 25;
          
          return CallReport.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          
          return null;
        });
    }).slow(500);
    
    it("Should list callreports with specific callTime", () => {
      var options = {
        sort: '-callTime',
        to: new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
        from: new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
        limit: 25,
        skip: 0
      };
      
      return CallReport.list(options)
        .then(docs => {
           docs.should.be.an.Array();
           docs.should.be.length(25);
           
           docs.forEach(doc => {
             doc.callTime.should.be.a.Date();
             doc.callTime.should.eql(new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'));
           });
        });
      
    });
    
  }); /* End of 'describe' #list() */
  
}); /* End of 'describe' CallReport Unit Tests */







