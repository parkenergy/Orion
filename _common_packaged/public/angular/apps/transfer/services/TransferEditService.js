angular.module('TransferApp.Services')
.factory('TransferEditService', ['Transfers', 'Users', 'Locations', 'Customers', 'role',
  function (Transfers, Users, Locations, Customers, role) {

    var TransferEditService = {
      transfer: {},
      technicians: [],
      locations: []
    };

    TransferEditService.getTechnicians = function (callback) {
      console.log("transfer edit service");
      var self = this;
      if (self.transfer.unit) {
        var id = self.transfer.unit._id;
        var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
        Users.query({ where: obj },
          function (response) {
            self.technicians = response;
            obj = { ServicePartnerId: id, role: "REVIEWER" };
            Users.query({ where: obj },
              function (response) {
                self.technicians = self.technicians.concat(response);
                return callback(null);
              },
              function (err) {
                return callback(err);
              }
            );
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

    TransferEditService.getLocations = function (callback) {
      var self = this;
      if (self.transfer.newLocation && self.transfer.newLocation._id) {
        Locations.query({ where: { CustomerId: self.transfer.newLocation.CustomerId }},
          function (response) {
            response.push({id: null, name: "Other"});
            self.locations = response;
            return callback(null);
          },
          function (err) {
            return callback(err);
          }
        );
      } else if (self.transfer.freehandLocationName) {
        Customers.query({ where: { id: self.transfer.freehandLocationCustomerId }},
          function (response) {
            self.transfer.newLocation = {};
            self.transfer.newLocation.customer = response[0];
            Locations.query(
              { where: { CustomerId: self.transfer.freehandLocationCustomerId }},
              function (response) {
                self.locations = response;
                return callback(null);
              },
              function (err) {
                return callback(err);
              }
            );
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

    TransferEditService.load = function (transfer, callback) {
      var self = this;
      if (transfer) {
        var reassign = transfer.reassignMultipleUnits;
        if (reassign !== undefined && reassign !== null) {
          transfer.reassignMultipleUnits = transfer.reassignMultipleUnits.toString();
        }
        self.transfer = transfer;
        self.getTechnicians(function (err) {
          if (err) { return callback(err); }
          self.getLocations(function (err) {
            return callback(err);
          });
        });
      } else {
        self.transfer = emptyTransfer();
        return callback(null);
      }
    };

    TransferEditService.save = function (transfer, role, callback) {
      if (role === "ADMIN" && transfer.freehandLocationName) {
        var err = "You cannot approve a transfer with a freehand location. " +
                  "You'll need to use or create a permanent location.";
        return callback(err);
      }
      var type = transfer.transferType;
      setTransferStatus(transfer, role, true);
      transfer.UnitId = transfer.unit._id;
      if (type === "TEST" || type === "CONTRACT") {
        transfer.NewCustomerId = transfer.newLocation.customer._id;
      } else if (type === "TRANSFER" && transfer.isYardTransfer === "false") {
        transfer.NewCustomerId = transfer.newLocation.customer._id;
      }
      var conditions = transfer._id ? { id: transfer._id } : {};
      Transfers.save(conditions, transfer,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    };


    TransferEditService.destroy = function (transfer, role, callback) {
      setTransferStatus(transfer, role, false);
      if (!transfer.status) {
        Transfers.delete({ id: transfer._id },
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      } else {
        transfer.UnitId = transfer.unit._id;
        Transfers.save({ id: transfer._id }, transfer,
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      }
    };

    TransferEditService.submitButtonText =  function (transfer) {
      var status = transfer.status;
      if (!status) {
        return "Create";
      } else if (status === "PENDING") {
        return "Submit";
      } else if (status === "SUBMITTED") {
        return "Approve";
      } else {
        return "Edit";
      }
    };

    TransferEditService.rejectButtonText = function (transfer) {
      var status = transfer.status;
      if (!status) {
        return "Cancel";
      } else if (status === "PENDING") {
        return "Delete";
      } else if (status === "SUBMITTED") {
        return "Reject";
      } else {
        return "Delete";
      }
    };

    return TransferEditService;

}]);

function emptyTransfer() {
  return {
    date:           new Date(),

    isTransfer:     true,
    transferType:   null,
    transferTypes: ["SWAP", "TRANSFER", "RELEASE", "CONTRACT", "TEST", "REASSIGNMENT"],
    isYardTransfer: "false",

    createdBy:      {}, // user
    transferOrderParts: [],
    unit:           {},
    newLocation:    { customer: {} },
    statuses:       ["PENDING", "SUBMITTED", "APPROVED"]
  };
}

function setTransferStatus (transfer, role, isProgressing) {

  if (isProgressing) {
    switch (role) {
    case "TECHNICIAN": transfer.status = "PENDING"; break;
    case "REVIEWER": transfer.status = "SUBMITTED"; break;
    case "CORPORATE": transfer.status = "APPROVED"; break;
    case "ADMIN": transfer.status = "APPROVED"; break;
    }
  } else {
    switch (role) {
      case "TECHNICIAN": transfer.status = null; break;
      case "REVIEWER": transfer.status = null; break;
      case "CORPORATE": transfer.status = "PENDING"; break;
      case "ADMIN": transfer.status = "PENDING"; break;
    }
  }
}
