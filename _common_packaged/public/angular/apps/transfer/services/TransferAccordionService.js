angular.module('TransferApp.Services')
.factory('TransferAccordionService', ['Transfers', function (Transfers) {

  var TransferAccordionService = {};

  TransferAccordionService.instantiate = function (transfer) {
    var isCreate = !transfer._id;
    return {
      genInfo:    { open: true,      disabled: false, valid: false },
      transfer:   { open: !isCreate, disabled: true,  valid: false },
      parts:      { open: !isCreate, disabled: true,  valid: false }
    };
  };

  TransferAccordionService.sectionIsValid = function (section, accordion, transfer) {

    var tran = transfer;
    var isValid = false;

    switch (section) {

      case "genInfo":
        if ((tran.transferType === "REASSIGNMENT") ||
            (tran.date && tran.unit.number && tran.transferType)) {
          isValid = true;
        }
        break;


      case "transfer":

        isValid = accordion.genInfo.valid &&
                  (tran.NewLocationId || tran.freehandLocationName ||
                    ( tran.isNewLocation &&
                      tran.newLocation.name &&
                      tran.newLocation.state &&
                      tran.newLocation.county &&
                      tran.newLocation.ServicePartnerId &&
                      tran.newLocation.CustomerId
                    ) ||
                    ( tran.transferType === "REASSIGNMENT" &&
                      tran.OldServicePartnerId &&
                      tran.NewServicePartnerId
                    )
                  );
                  break;
    }

    return isValid;
  };

  return TransferAccordionService;

}]);
