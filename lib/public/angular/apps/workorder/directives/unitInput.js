/**
 * Created by marcusjwhelan on 10/20/16.
 */
angular.module('WorkOrderApp.Directives')
.directive('pesCollectionMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl){
      // runs on page load and on item selection.
      scope.$watch(attr.ngModel, function(v){
        var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
        var attributeArray = [];
        switch(attribute){
          case "header.unitNumber": attributeArray = scope.unitNumberArray;
            break;
          case "header.customerName": attributeArray = scope.unitCustomerArray;
            break;
          case "header.leaseName": attributeArray = scope.unitLocationArray;
            break;
          case "header.county": attributeArray = scope.unitCountiesArray;
            break;
          case "header.state": attributeArray = scope.unitStateArray;
            break;
        }
        // if empty don't set has-error
        if(v){
          scope.check = (attributeArray.indexOf(v) !== -1) ? 'valid' : undefined;
          if(scope.check){
            ctrl.$setValidity(attribute, true);
            ctrl.$setValidity(attribute, true);
            if(elem.parent().hasClass('has-error')){
              elem.parent().removeClass('has-error');
              elem.parent().addClass('has-success');
            } else {
              elem.parent().addClass('has-success');
            }
            return v;
          } else {
            ctrl.$setValidity(attribute, false);
            if(elem.parent().hasClass('has-success')){
              elem.parent().removeClass('has-success');
              elem.parent().addClass('has-error');
            } else {
              elem.parent().addClass('has-error');
            }
            return v;
          }
        }
      })
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

