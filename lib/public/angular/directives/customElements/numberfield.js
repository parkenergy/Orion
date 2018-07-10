angular.module('CommonDirectives')
.directive('ngMin', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {

      const minValidator = viewValue => {
        viewValue = +viewValue;
          let min = true;
          let max = true;
        if(scope.min == 0){
            min = viewValue > -1;
        } else if(scope.min == 1){
            min = viewValue > 0;
        } else if(scope.min == null){
            scope.check = true;
        }
          if (scope.max == 0 || scope.max !== null || scope.max !== false) {
              max = viewValue <= scope.max;
          }
          if (min && max) {
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
    templateUrl: '/lib/public/angular/views/directive.views/customElements/numberfield.html',
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
