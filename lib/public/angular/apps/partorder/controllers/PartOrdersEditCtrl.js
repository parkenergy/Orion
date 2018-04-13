angular.module('PartOrderApp.Controllers')
  .controller('PartOrdersEditCtrl', ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'LocationItemService', 'PartOrders', 'InventoryTransfers', 'partorders', 'locations', 'DateService',
    function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, LocationItemService, PartOrders, InventoryTransfers, partorders, locations, DateService) {

      // Variables ----------------------------------------
      const AS = AlertService;
      const DS = DateService;
      const LIS = LocationItemService;
      $scope.locations = locations;
      $scope.partorders = partorders;
      $scope.comment = '';
      // --------------------------------------------------

      $scope.status = [
        { type: 'ordered', value: false },
        { type: 'backorder', value: false },
        { type: 'canceled', value: false },
        { type: 'completed', value: false }
      ];
      $scope.type = {};
      $scope.disabled = false;

      const isComplete = () => {
        $scope.partorders.forEach((po) => {
          if ((po.status === 'canceled' || po.status === 'completed') && po.timeComplete) {
            $scope.disabled = true;
          }
        });
      };

      // Change Selected Check box --------------------------
      $scope.changeCheckBoxes = (data, selected) => {
        _.map($scope.status,(obj) => {
          if ( obj.type === selected ){
            obj.value = true;
            $scope.type = obj;
            $scope.status.forEach((x) => {
              if( x.type !== selected ){
                x.value = false;
              }
            });
          }
        });
      };
      // ----------------------------------------------------

      const setSave = (po) => {
        if (po.timeCreated) {
          po.timeCreated = DS.saveToOrion(new Date(po.timeCreated));
        }
        if (po.timeSubmitted) {
          po.timeSubmitted = DS.saveToOrion(new Date(po.timeSubmitted));
        }
        if (po.timeOrdered) {
          po.timeOrdered = DS.saveToOrion(new Date(po.timeOrdered));
        }
        if (po.timeComplete) {
          po.timeComplete = DS.saveToOrion(new Date(po.timeComplete));
        }
      };
      const setDisplay = () => {
        $scope.partorders.forEach((po) => {
          if (po.timeCreated) {
            po.timeCreated = DS.displayLocal(new Date(po.timeCreated));
          }
          if (po.timeSubmitted) {
            po.timeSubmitted = DS.displayLocal(new Date(po.timeSubmitted));
          }
          if (po.timeOrdered) {
            po.timeOrdered = DS.displayLocal(new Date(po.timeOrdered));
          }
          if (po.timeComplete) {
            po.timeComplete = DS.displayLocal(new Date(po.timeComplete));
          }
        });
      };

      const setDestinationLocation = () => {
        $scope.partorders.forEach((po) => {
          po.destinationLocationName = LIS.getNameFromNSID(po.destinationNSID, $scope.locations);
        });
      };

      $scope.headerSelectFieldChange = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData;
        });
      };

      $scope.changeThisTextAreaField = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData;
        })
      };

      $scope.headerTextFieldChange = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData
        });
      };

      // Passed function to Edit Table --------------------
      $scope.changeStatus = (changedData, selected) => {
        $scope.partorders.forEach((po) => po.status = selected);
      };
      // --------------------------------------------------

      // Submit changes of POs ----------------------------
      $scope.submit = (status) => {
        let ableToSubmit = true;
        let commenError = false;
        let poNumberError = false;
        let statusError = false;
        $scope.partorders.forEach((po) => {
          if (po.status === 'canceled' && !po.comment) {
            commenError = true;
            ableToSubmit = false;
          }
          if (po.status === 'ordered' && !po.poNumber) {
            poNumberError = true;
            ableToSubmit = false;
          }
          if (!po.status) {
            statusError = true;
            ableToSubmit = false;
          }
        });
        if (!ableToSubmit) {
          if (commenError) {
            AS.add('danger', 'Please fill out the comment box if canceling a part order.');
          }
          if (poNumberError) {
            AS.add('danger', 'Please fill out the PO number. If none leave N/A');
          }
          if (statusError) {
            AS.add('danger', 'Must select a status');
          }
        } else {
          const tech = $cookies.get('tech');
          const now = new Date();
          $scope.partorders.forEach((po) => {
            if ( $scope.type === 'ordered' || $scope.type === 'backorder' || $scope.type === 'canceled' ) {
              po.approvedBy = tech;
            }

            if ( $scope.type === 'completed' ) {
              po.completedBy = tech;
            }

            if( $scope.type === 'canceled' && po.source === 'Orion'){
              po.completedBy = tech;
            }
            if ($scope.type === 'ordered') {
              po.timeOrdered = now;
            }
            setSave(po);
            PartOrders.update({ id: po.orderId}, po,
              (res) => {
                AS.add('success', "Update was successful.");
                console.log(res);
                // If successful create Inventory Transfer
                if ( res.status === 'completed' ) {
                  const thisIT = $scope.newInventoryTransfer();
                  thisIT.originLocationNSID = res.originNSID;
                  thisIT.destinationLocationNSID = res.destinationNSID;

                  thisIT.originLocation = LocationItemService.getIDFromNSID(res.originNSID, $scope.locations);
                  thisIT.destinationLocation = LocationItemService.getIDFromNSID(res.destinationNSID, $scope.locations);

                  thisIT.truckId = LocationItemService.getTruckFromNSID(res.destinationNSID, $scope.locations);

                  thisIT.parts.push(res.part);
                  thisIT.parts[0].netsuiteId = res.partNSID;
                  thisIT.parts[0].quantity = res.quantity;

                  InventoryTransfers.save({}, thisIT,
                    (res) => {
                      console.log("Inventory Transfer Created.");
                      $scope.completeForm();
                    },
                    (err) => {
                      setDisplay();
                      AS.add('danger', 'An error occurred while attempting to save inventory transfer.');
                      console.log(err);
                    }
                  );
                } else {
                  $scope.completeForm();
                }
              },
              function (err) {
                setDisplay();
                console.log(err);
                AlertService.add('danger', 'An error occurred while attempting to update this part order.');
              }
            );
          });
        }
      };
      // --------------------------------------------------
      // Route back ---------------------------------------
      $scope.completeForm = () => {
        $location.url('/partorder')
      };
      // --------------------------------------------------

      setDisplay();
      setDestinationLocation();
      isComplete();
    }]);
