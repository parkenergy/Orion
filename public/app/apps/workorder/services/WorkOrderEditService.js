angular.module('WorkOrderApp.Services')
.factory('WorkOrderEditService', ['WorkOrders', 'Users', 'role', '$cookies', function (WorkOrders, Users, role, $cookies) {

  var WorkOrderEditService = {
    workorder: {},
    technician: []
  };

  WorkOrderEditService.load = function (workorder, callback) {
    var self = this;
    if (workorder) {
      self.workorder = workorder;
      self.workorder.timeCalled = workorder.timeCalled.split(".")[0];
      self.workorder.timeDeparted = workorder.timeDeparted.split(".")[0];
      self.workorder.timeArrived = workorder.timeArrived.split(".")[0];
      self.loadTechnicians(callback);
    } else {
      self.workorder = emptyWorkOrder();
      return callback(null);
    }
    return self.workorder;
  };

  WorkOrderEditService.loadTechnicians = function (callback) {
    var self = this;
    var id = null;
    if (self.workorder.unit) {
      id = self.workorder.unit.ServicePartnerId;
    }
    if (id) {
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

  WorkOrderEditService.save = function (workorder, role, callback) {

    var logsWithoutTimes = workorder.workOrderLogs.filter(function (woLog) {
      return (woLog.hours === 0 && woLog.minutes === 0);
    });
    var isConfirmRequired = logsWithoutTimes.length > 0;
    var conditions;
     
    if (isConfirmRequired) {
      var text = 'This workorder contains some' +
      ' Types of Work Performed Line Items that do not have hours or minutes.' +
      ' Are you sure you wish to save?';

      if (confirm(text)) {
        setWorkOrderStatus(workorder, role, true);
        workorder.UnitId = workorder.unit._id;
        conditions = workorder._id ? { id: workorder._id } : {};
        WorkOrders.save(conditions, workorder,
          function (response) { return callback(null, response); },
          function (err) { return callback(err, null); }
        );
      } else {
        return callback("Please edit the line items and then save again.");
      }
    } else {
      setWorkOrderStatus(workorder, role, true);
      workorder.UnitId = workorder.unit._id;
      conditions = workorder._id ? { id: workorder._id } : {};
      WorkOrders.save(conditions, workorder,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    }


  };

  WorkOrderEditService.destroy = function (workorder, role, callback) {
    console.log(workorder.status);
    setWorkOrderStatus(workorder, role, false);
    console.log(workorder.status);
    if (!workorder.status) {
      WorkOrders.delete({ id: workorder._id },
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    } else {
      workorder.UnitId = workorder.unit._id;
      WorkOrders.save({ id: workorder._id }, workorder,
        function (response) { return callback(null, response); },
        function (err) { return callback(err, null); }
      );
    }
  };

  WorkOrderEditService.submitButtonText =  function (workorder) {
    var status = workorder.status;
    if (!status || role === "TECHNIAN") {
      return "Create";
    } else if (status === "PENDING" || role === "REVIEWER") {
      return "Submit";
    } else if (status === "SUBMITTED" || role === "CORPORATE") {
      return "Approve";
    } else if (status === "SUBMITTED" || role === "ADMIN") {
      return "Approve";
    } else {
      return "Edit";
    }
  };

  WorkOrderEditService.rejectButtonText = function (workorder) {
    var status = workorder.status;
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

  function setWorkOrderStatus (workorder, role, isProgressing) {
    if (isProgressing) {
      switch (role) {
        case "TECHNICIAN": workorder.status = "SUBMITTED"; break;
        case "REVIEWER": workorder.status = "APPROVED"; break;
        case "CORPORATE": workorder.status = "APPROVED"; break;
        case "ADMIN": workorder.status = "APPROVED"; break;
      }
    } else {
      var userId = $cookies.userId || 0;
      if (userId === workorder.CreatedById) {
        workorder.status = null;
        return;
      } else {
        switch (role) {
          case "TECHNICIAN": workorder.status = null; break;
          case "REVIEWER": workorder.status = "SUBMITTED"; break;
          case "CORPORATE": workorder.status = "SUBMITTED"; break;
          case "ADMIN": workorder.status = "SUBMITTED"; break;
        }
      }
    }
  }


  return WorkOrderEditService;

}]);

function emptyWorkOrder() {
  return {
    date:                   new Date(),
    reason:                 "",
    details:                "",
    isTransfer:             false,
    calledOutBy:            "",

    // Application
    suction:                0,
    discharge:              0,
    flowrate:               0,
    // Engine
    engineHours:            0,
    engineOilPressure:      0,
    jwTemperature:          0,
    rpm:                    0,
    manifoldVac:            0,
    // Engine
    compressorHours:        0,
    compressorOilPressure:  0,
    // Call Out
    timeCalled:             new Date(),
    timeDeparted:           new Date(),
    timeArrived:            new Date(),
    callOutReason:          new Date(),
    // Engine Swap
    engineSerial:           "",
    engineModel:            "",
    // Engine Swap
    compressorSerial:       "",
    compressorModel:        "",

    createdBy:              {}, // user
    workOrderParts:         [], // parts
    workOrderLogs:          [], // labor logs
    unit:                   {}, // user
    technician:             {}, // technician

    statuses:               ["PENDING", "SUBMITTED", "APPROVED"]
  };
}
