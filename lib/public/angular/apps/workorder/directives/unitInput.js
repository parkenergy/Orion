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

      var arrayOfArrays = [scope.unitNumberArray, scope.unitCustomerArray, scope.unitLocationArray,scope.unitCountiesArray, scope.unitStateArray];

      // runs on page load and on item selection.
      scope.$watch(attr.ngModel, function(viewValue){
        var checkUnitFields = function(){
          // get the index of the unit number out of the array
          var index = scope.unitNumberArray.indexOf(scope.workorder.header.unitNumber);

          // customer
          if(arrayOfArrays[1][index] !== scope.workorder.header.customerName){
            setInvalid(attribute);
          } else { // otherwise set set valid and no errors
            setValid(attribute);
          }

          // lease
          if(arrayOfArrays[2][index] !== scope.workorder.header.leaseName){
            setInvalid(attribute);
          } else {
            setValid(attribute);
          }

          // county
          if(arrayOfArrays[3][index] !== scope.workorder.header.county){
            setInvalid(attribute);
          } else {
            setValid(attribute);
          }

          // state
          if(arrayOfArrays[4][index] !== scope.workorder.header.state){
            setInvalid(attribute);
          } else {
            setValid(attribute);
          }
        };

        var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);

        var attributeArray = [];
        switch(attribute){
          case "header.unitNumber": attributeArray = scope.unitNumberArray;
            break;
          case "header.customerName": attributeArray = scope.customersArray;
            break;
          case "header.leaseName": attributeArray = scope.unitLocationArray;
            break;
          case "header.county": attributeArray = scope.countiesArray;
            break;
          case "header.state": attributeArray = scope.statesArray;
            break;
        }

        // if empty don't set has-error
        if(viewValue){
          scope.check = (attributeArray.indexOf(viewValue) !== -1) ? 'valid' : undefined;
          if(scope.check){
            // this normally would set validity to true but since the unit number is valid we need to check if it matches the value in a unit.
            if(scope.unitValid === true){
              checkUnitFields();
            } else {
              // if it is false then set this field itself as true
              setInvalid(attribute);
            }
            if(attribute === "header.unitNumber") scope.unitValid = true;
            return viewValue;
          } else {
            setInvalid(attribute);
            if(attribute === "header.unitNumber") scope.unitValid = false;
            return viewValue;
          }
        }

        // if unit number is valid check all other unit elements for validity based on that unit number.
        if(scope.unitValid === true){
          checkUnitFields();
        }
      });
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

