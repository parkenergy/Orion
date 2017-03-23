/**
 * Created by marcusjwhelan on 10/20/16.
 */
angular.module('WorkOrderApp.Directives')
.directive('pesCollectionMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl){
      
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
          var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
          var unitExists;
          
          // if there is a unit and not a Indirect WO
          if(scope.workorder.unit && scope.workorder.type !== 'Indirect'){
            unitExists = 'is_unit';
          // if there is no unit and not a Indirect WO
          } else if(!scope.workorder.unit && scope.workorder.type !== 'Indirect') {
            unitExists = 'should_unit';
          // its an Indirect WO. false unless empty
          } else {
            unitExists = 'no_unit'
          }
          
          var checkUnitFields = function(vv){
            // get the index of the unit number out of the array
            switch(attribute){
              case "header.unitNumber":
                if(unitExists === 'is_unit'){
                  if(scope.workorder.unit.number === scope.workorder.header.unitNumber){
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
              case "header.customerName":
                // customer
                if(unitExists === 'is_unit'){
                  if(scope.workorder.unit.customerName === scope.workorder.header.customerName){
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
              case "header.leaseName":
                // lease
                if(unitExists === 'is_unit'){
                  if(scope.workorder.unit.locationName === scope.workorder.header.leaseName){
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
              case "header.county":
                // county
                if(unitExists === 'is_unit'){
                  var county = scope.workorder.unit.county === null ? "" : scope.workorder.unit.county.name;
                  if(county === scope.workorder.header.county){
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
              case "header.state":
                // state
                if(unitExists === 'is_unit'){
                  var state = scope.workorder.unit.state === null ? "" : scope.workorder.unit.state.name;
                  if(state === scope.workorder.header.state){
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
            }
          };
          // if empty don't set has-error
          if(viewValue || viewValue === '' || viewValue === null){
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

