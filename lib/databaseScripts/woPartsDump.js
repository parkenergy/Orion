const TH = require('../helpers/task_helper');

module.exports = (db, Users, query) => {
  return new Promise((resolve, reject) => {
    query.parts = {$exists: true};
    function WoPARTs(){
      return {
        WoId: null,
        techId: '',
        truckId: '',
        firstName: '',
        lastName: '',
        timeSubmitted: null,
        unitNumber: '',
        partDescription: '',
        partNetsuiteId: '',
        partSmartPart: '',
        partLaborCode: '',
        partQuantity: 0,
        partId: null,
        partIsManual: false,
        partIsBillable: false,
        partIsWarranty: false
      }
    }
  
    let users = [];
    // get all technicians
    Users.aggregate()
    .match({role: {$in: ['tech', 'manager', 'admin']}})
    .project({
      techId: '$username',
      firstName: '$firstName',
      lastName: '$lastName'
    })
    .exec()
    .then((AllUsers) => {
      users = AllUsers;
      return db.aggregate()
      .match(query)
      .unwind('$parts')
      .project({
        techId: '$techId',
        timeSubmitted: '$timeSubmitted',
        truckId: '$truckId',
        unitNumber: '$header.unitNumber',
      
        description: '$parts.description',
        netsuiteId: '$parts.netsuiteId',
        smartPart: '$parts.smartPart',
        laborCode: '$parts.laborCode',
        quantity: '$parts.quantity',
        partId: '$parts._id',
        isManual: '$parts.isManual',
        isBillable: '$parts.isBillable',
        isWarranty: '$parts.isWarranty'
      });
    })
    .map((wo) => {
      const thisWo = WoPARTs();
      thisWo.WoId = wo._id;
      thisWo.techId = wo.techId;
      thisWo.timeSubmitted = wo.timeSubmitted;
      thisWo.truckId = wo.truckId;
      thisWo.unitNumber = wo.unitNumber;
    
      thisWo.partDescription = wo.description;
      thisWo.partNetsuiteId = wo.netsuiteId;
      thisWo.partSmartPart = wo.smartPart;
      thisWo.partLaborCode = wo.laborCode;
      thisWo.partQuantity = wo.quantity;
      thisWo.partId = wo.partId;
      thisWo.partIsManual = wo.isManual;
      thisWo.partIsBillable = wo.isBillable;
      thisWo.partIsWarranty = wo.isWarranty;
    
      users.map(function(tech){
        if(tech.techId === wo.techId){
          thisWo.firstName = tech.firstName;
          thisWo.lastName = tech.lastName;
        }
      });
    
      return thisWo;
    })
    .reduce((csv, row) => {
      return csv + [
        row.WoId,
        row.timeSubmitted,
        row.unitNumber,
        row.techId,
        TH.sanitize(row.firstName),
        TH.sanitize(row.lastName),
        row.truckId,
        row.partNetsuiteId,
        row.partSmartPart,
        row.partLaborCode,
        row.partQuantity,
        row.partId,
        row.partIsManual,
        row.partIsBillable,
        row.partIsWarranty
      ].join(',') + '\n';
    },'WoId,timeSubmitted,unitNumber,techId,firstName,lastName,truckId,partNSID,partSmartPart,partLC,partQuantity,partId,partIsManual,partIsBillable,partIsWarranty\n')
    .then(resolve)
    .catch(reject);
  });
};
