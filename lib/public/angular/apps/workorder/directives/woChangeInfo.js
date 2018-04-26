angular.module('WorkOrderApp.Directives')
  .directive('pesSwapCollectionMatch', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attr, ctrl){
        scope.myStyle = {
          borderWidth: "6px",
        };
        // validity setters.
        var setInvalid = function(arg){
          ctrl.$setValidity( arg, false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-highlight');
          } else {
            elem.parent().addClass('has-highlight');
          }
        };
        var setValid = function(arg){
          ctrl.$setValidity( arg, true );
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-highlight');
          } else {
            elem.parent().addClass('has-highlight');
          }
        };

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

            var checkUnitFields = function (vv) {
              switch(attribute) {
                case 'workorder.unitChangeInfo.transferCounty':
                  if (unitExists === 'is_unit') {
                    var county = scope.displayUnit.county === null ? '' : scope.displayUnit.county.name;
                    if (county.toUpperCase() === scope.workorder.unitChangeInfo.transferCounty.toUpperCase()) {
                      setValid(attribute)
                    } else {
                      setInvalid(attribute)
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.transferState':
                  if (unitExists === 'is_unit') {
                    var state = scope.displayUnit.state === null ? '' : scope.displayUnit.state.name;
                    if (state.toUpperCase() === scope.workorder.unitChangeInfo.transferState.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.transferLease':
                  if (unitExists === 'is_unit') {
                    if (scope.displayUnit.locationName.toUpperCase() === scope.workorder.unitChangeInfo.transferLease.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.swapUnitNumber':
                  if (unitExists === 'is_unit') {
                    if (scope.displayUnit.number.toUpperCase() === scope.workorder.unitChangeInfo.swapUnitNumber.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
              }
            };

            if(viewValue || viewValue === '' || viewValue === null || viewValue === 0){
              checkUnitFields(viewValue);

              return viewValue;
            }
          })
        },300)); // 300 ms wait. Don't do it every change
      }
    }
  })
  .directive('unitChangeInfo', [function() {
    return {
      restrict: 'E',
      templateUrl: '/lib/public/angular/apps/workorder/views/woChangeInfo.html',
      scope: true
    };
  }]);
