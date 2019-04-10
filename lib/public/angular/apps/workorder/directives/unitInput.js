/**
 * Created by marcusjwhelan on 10/20/16.
 */
angular.module('WorkOrderApp.Directives')
.directive('pesCollectionMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl){
      // set the border of the input for color to be larger
      scope.myStyle = {
        borderWidth: "6px",
      };
      // validity setters.
      var setInvalid = function(arg){
        ctrl.$setValidity( arg, false);
        if(elem.parent().hasClass('has-success')){
          elem.parent().removeClass('has-success');
          elem.parent().addClass('has-error');
        } else {
          elem.parent().addClass('has-error');
        }
      };
      var setHighlight = function (arg) {
        ctrl.$setValidity( arg, false);
        if (elem.parent().hasClass('has-success')) {
          elem.parent().removeClass('has-success');
        }
        if (elem.parent().hasClass('has-error')) {
          elem.parent().removeClass('has-error');
        }
        elem.parent().addClass('has-highlight');
      };
      var setValid = function(arg){
        ctrl.$setValidity( arg, true );
        if(elem.parent().hasClass('has-error')){
          elem.parent().removeClass('has-error');
          elem.parent().addClass('has-success');
        } else {
          elem.parent().addClass('has-success');
        }
      };

      // runs on page load and on item selection.
      scope.$watch(attr.ngModel, _.debounce(function(viewValue){
        scope.$apply(function(){
          // get the model name EG header.unitNumber
          // var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
          var attribute = attr.ngModel;
          var unitExists;

          // if there is a unit and not a Indirect WO
          if(scope.displayUnit && scope.workorder.type !== 'Indirect'){
            unitExists = 'is_unit';
          // if there is no unit and not a Indirect WO
          } else if(!scope.displayUnit && scope.workorder.type !== 'Indirect') {
            unitExists = 'should_unit';
          // its an Indirect WO. false unless empty
          } else {
            unitExists = 'no_unit'
          }

          var checkUnitFields = function(vv){
            // get the index of the unit number out of the array
            switch(attribute){
              case "workorder.header.unitNumber":
                if(unitExists === 'is_unit'){
                  var number;
                  if (scope.workorder.type === 'Transfer') {
                    number = scope.headerUnit.number;
                  } else {
                    number = scope.displayUnit.number;
                  }
                  if(number.toUpperCase() === scope.workorder.header.unitNumber.toUpperCase()){
                    if ((scope.workorder.header.unitNumber.toUpperCase() === scope.workorder.unitNumber.toUpperCase()) && scope.workorder.type !== 'Swap') {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else {
                    setInvalid(attribute);
                  }
                } else if (unitExists === 'should_unit'){
                  setInvalid(attribute);
                } else if(unitExists === 'no_unit'){
                  if(vv){
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }
                break;
              case "workorder.header.customerName":
                // customer
                if(unitExists === 'is_unit'){
                  var customerName;
                  if (scope.workorder.type === 'Swap') {
                    customerName = scope.headerUnit.customerName;
                  } else {
                    customerName = scope.displayUnit.customerName;
                  }
                  if(customerName.toUpperCase() === scope.workorder.header.customerName.toUpperCase()){
                    setValid(attribute);
                  } else {
                    setInvalid(attribute);
                  }
                } else if (unitExists === 'should_unit') {
                  setInvalid(attribute);
                } else if (unitExists === 'no_unit') {
                    if (vv) {
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }

                break;
              case "workorder.header.leaseName":
                // lease
                  if (unitExists === 'is_unit') {
                  var locationName;
                  if (scope.workorder.type === 'Swap') {
                    locationName = scope.headerUnit.locationName;
                  } else {
                    locationName = scope.displayUnit.locationName;
                  }
                  if(locationName.toUpperCase() === scope.workorder.header.leaseName.toUpperCase()){
                    setValid(attribute);
                  } else {
                    setInvalid(attribute);
                  }
                } else if (unitExists === 'should_unit'){
                  setInvalid(attribute);
                } else if(unitExists === 'no_unit'){
                  if(vv){
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }

                break;
              case "workorder.header.county":
                // county
                if(unitExists === 'is_unit'){
                  var county;
                  if (scope.workorder.type === 'Swap') {
                      county = (scope.headerUnit.county === null || scope.headerUnit.county ===
                          undefined) ? '' : scope.countiesObj[scope.headerUnit.county].name
                  } else {
                      county = (scope.displayUnit.county === null || scope.displayUnit.county ===
                          undefined) ? '' : scope.countiesObj[scope.displayUnit.county].name
                  }
                  if(county.toUpperCase() === scope.workorder.header.county.toUpperCase()){
                    setValid(attribute);
                  } else {
                    setInvalid(attribute);
                  }
                } else if (unitExists === 'should_unit'){
                  setInvalid(attribute);
                } else if(unitExists === 'no_unit'){
                  if(vv){
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }

                break;
              case "workorder.header.state":
                // state
                if(unitExists === 'is_unit'){
                  var state;
                  if (scope.workorder.type === 'Swap') {
                      state = (scope.headerUnit.state === null || scope.headerUnit.state ===
                          undefined) ? '' : scope.statesObj[scope.headerUnit.state].name
                  } else {
                      state = (scope.displayUnit.state === null || scope.displayUnit.state ===
                          undefined) ? '' : scope.statesObj[scope.displayUnit.state].name
                  }
                  if(state.toUpperCase() === scope.workorder.header.state.toUpperCase()){
                    setValid(attribute);
                  } else {
                    setInvalid(attribute);
                  }
                } else if (unitExists === 'should_unit'){
                  setInvalid(attribute);
                } else if(unitExists === 'no_unit'){
                  if(vv){
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }

                break;
              case "workorder.unitReadings.compressorSerial":
                // compressor serial
                if (unitExists === 'is_unit') {
                  var compressorSerial = scope.displayUnit.compressorSerial === null ? "" : scope.displayUnit.compressorSerial;
                  if (compressorSerial === scope.workorder.unitReadings.compressorSerial) {
                    if (scope.workorder.type === 'Swap') {
                      setHighlight(attribute);
                    } else {
                      setValid(attribute);
                    }
                  } else {
                    if (scope.workorder.type === 'Swap') {
                      setHighlight(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  }
                } else if (unitExists === 'should_unit') {
                  setInvalid(attribute);
                } else if (unitExists === 'no_unit') {
                  if (vv) {
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }
                break;

              case "workorder.unitReadings.engineSerial":
                // Engine serial
                if (unitExists === 'is_unit') {
                  var engineSerial = scope.displayUnit.engineSerial === null ? "" : scope.displayUnit.engineSerial;
                  if (engineSerial === scope.workorder.unitReadings.engineSerial) {
                    if (scope.workorder.type === 'Swap') {
                      setHighlight(attribute);
                    } else {
                      setValid(attribute);
                    }
                  } else {
                    if (scope.workorder.type === 'Swap') {
                      setHighlight(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  }
                } else if (unitExists === 'should_unit') {
                  setInvalid(attribute);
                } else if (unitExists === 'no_unit') {
                  if (vv) {
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }
                break;

              case "workorder.geo.coordinates[1]":
                // Engine serial
                if (unitExists === 'is_unit') {
                  var latitude;
                  if (scope.workorder.type === 'Swap') {
                    latitude = scope.headerUnit.geo.coordinates[1] === 0 ? 0 : scope.headerUnit.geo.coordinates[1];
                  } else {
                    latitude = scope.displayUnit.geo.coordinates[1] === 0 ? 0 : scope.displayUnit.geo.coordinates[1];
                  }
                  if (latitude === scope.workorder.geo.coordinates[1]) {
                    setValid(attribute);
                  } else {
                    if (scope.workorder.atShop) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  }
                } else if (unitExists === 'should_unit') {
                  setInvalid(attribute);
                } else if (unitExists === 'no_unit') {
                  if (vv) {
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }
                break;

              case "workorder.geo.coordinates[0]":
                // Engine serial
                if (unitExists === 'is_unit') {
                  var longitude;
                  if (scope.workorder.type === 'Swap') {
                    longitude = scope.headerUnit.geo.coordinates[0] === 0 ? 0 : scope.headerUnit.geo.coordinates[0];
                  } else {
                    longitude = scope.displayUnit.geo.coordinates[0] === 0 ? 0 : scope.displayUnit.geo.coordinates[0];
                  }
                  if (longitude === scope.workorder.geo.coordinates[0]) {
                    setValid(attribute);
                  } else {
                    if (scope.workorder.atShop) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  }
                } else if (unitExists === 'should_unit') {
                  setInvalid(attribute);
                } else if (unitExists === 'no_unit') {
                  if (vv) {
                    setInvalid(attribute);
                  } else {
                    setValid(attribute);
                  }
                }
                break;
                case 'workorder.unitReadings.displayEngineModel':
                    if (unitExists === 'is_unit') {
                        // get _id from current WO unit engine
                        let engineModelID = ''

                        scope.engineModels.forEach((engine) => {
                            if (scope.displayUnit.engineModel) {
                                if (engine.netsuiteId === scope.displayUnit.engineModel) {
                                    engineModelID = engine.netsuiteId
                                }
                            }
                        })

                        if (engineModelID === scope.workorder.unitReadings.engineModel) {
                            setValid(attribute)
                        } else {
                            setInvalid(attribute)
                        }
                    } else if (unitExists === 'should_unit') {
                        setInvalid(attribute)
                    } else if (unitExists === 'no_unit') {
                        if (vv) {
                            setInvalid(attribute)
                        } else {
                            setValid(attribute)
                        }
                    }
                    break
                case 'workorder.unitReadings.displayFrameModel':
                    if (unitExists === 'is_unit') {
                        // get _id from current WO unit engine
                        let frameModelID = ''

                        scope.frameModels.forEach((frame) => {
                            if (scope.displayUnit.frameModel) {
                                if (frame.netsuiteId === scope.displayUnit.frameModel) {
                                    frameModelID = frame.netsuiteId
                                }
                            }
                        })

                        if (frameModelID === scope.workorder.unitReadings.compressorModel) {
                            setValid(attribute)
                        } else {
                            setInvalid(attribute)
                        }
                    } else if (unitExists === 'should_unit') {
                        setInvalid(attribute)
                    } else if (unitExists === 'no_unit') {
                        if (vv) {
                            setInvalid(attribute)
                        } else {
                            setValid(attribute)
                        }
                    }
                    break
            }
          };
          // if empty don't set has-error
          if(viewValue || viewValue === '' || viewValue === null || viewValue === 0){
            checkUnitFields(viewValue);

            return viewValue;
          }
        })
      },300)); // 300 ms wait. Don't do it every change
    }
  };
})
.directive('unitInput', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/unitInput.html',
    scope: false
  };
}]);

