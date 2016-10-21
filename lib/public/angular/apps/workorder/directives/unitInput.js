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
      scope.$watch(attr.ngModel, _.debounce(function(viewValue){
        scope.$apply(function(){
          var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
          var checkUnitFields = function(){
            // get the index of the unit number out of the array
            var index = scope.unitNumberArray.indexOf(scope.workorder.header.unitNumber);
            switch(attribute){
              case "header.unitNumber":
                if(arrayOfArrays[0][index] !== scope.workorder.header.unitNumber){
                  setInvalid('header.unitNumber');
                } else {
                  setValid('header.unitNumber');
                }
                break;
              case "header.customerName":
                // customer
                if(arrayOfArrays[1][index] !== scope.workorder.header.customerName){
                  setInvalid('header.customerName');
                } else { // otherwise set set valid and no errors
                  setValid('header.customerName');
                }
                break;
              case "header.leaseName":
                // lease
                if(arrayOfArrays[2][index] != scope.workorder.header.leaseName){
                  setInvalid('header.leaseName');
                } else {
                  setValid('header.leaseName');
                }
                break;
              case "header.county":
                // county
                if(arrayOfArrays[3][index] !== scope.workorder.header.county){
                  setInvalid('header.county');
                } else {
                  setValid('header.county');
                }
                break;
              case "header.state":
                // state
                if(arrayOfArrays[4][index] !== scope.workorder.header.state){
                  setInvalid('header.state');
                } else {
                  setValid('header.state');
                }
                break;
            }
          };

          // Here get the
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
              if(attribute === "header.unitNumber") scope.unitValid = true;
              console.log(scope.unitValid);
              if(scope.unitValid === true){
                checkUnitFields();
              } else {
                // if it is false then set this field itself as true
                setInvalid(attribute);
              }
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

