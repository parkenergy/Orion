angular.module('CommonDirectives')
.directive('ngMin', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {

      var minValidator = function(viewValue){
        if(scope.min == 0){
          scope.check = (viewValue && (viewValue > -1)) ? 'valid' : undefined;
        } else if(scope.min == 1){
          scope.check = (viewValue && (viewValue > 0)) ? 'valid' : undefined;
        } else if(scope.min == null){
          scope.check = 'valid';
        }
        if(scope.check){
          ctrl.$setValidity('ngMin', true);
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-success');
          } else {
            elem.parent().addClass('has-success');
          }
          return viewValue;
        }
        else{
          ctrl.$setValidity('ngMin', false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-error');
          } else {
            elem.parent().addClass('has-error');
          }
          return undefined;
        }
      };

      ctrl.$parsers.unshift(minValidator);
    }
  };
})
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      min: '@',
      max: '@',
      name: '@',
      nonNegative: '@',
      integerOnly: '@',
      placeholderText: '@',
      disabled: '='
    }
  };
}]);

function isEmpty(value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}
