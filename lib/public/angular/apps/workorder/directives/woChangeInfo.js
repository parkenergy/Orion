angular.module('WorkOrderApp.Directives')
  .directive('pesSwapCollectionMatch', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attr, ctrl){
        scope.$watch(attr.ngModel, _.debounce(function(viewValue){
          scope.myStyle = {
            borderWidth: "6px",
          };
          scope.$apply(function(){
            // get the model name EG header.unitNumber
            // var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
            var attribute = attr.ngModel;
            var unitExists;
            console.log(attribute)
            if(viewValue || viewValue === '' || viewValue === null || viewValue === 0){
              //checkUnitFields(viewValue);

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
