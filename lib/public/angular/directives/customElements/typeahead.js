angular.module('CommonDirectives')
.directive('pesCollectionMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl){
      // check if input value matches any values in the arrayList
      var collectionValidation = function(viewValue){
        scope.check = (scope.arrayList.indexOf(viewValue) !== -1) ? 'valid' : undefined;
        if(scope.check){
          ctrl.$setValidity('pesCollectionMatch', true);
          ctrl.$setValidity('pesCollectionMatch', true);
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-success');
          } else {
            elem.parent().addClass('has-success');
          }
          return viewValue;
        } else {
          ctrl.$setValidity('pesCollectionMatch', false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-error');
          } else {
            elem.parent().addClass('has-error');
          }
          return viewValue;
        }
      };

      ctrl.$parsers.unshift(collectionValidation);
      scope.$watch(attr.ngModel, function(v){
        scope.check = (scope.arrayList.indexOf(v) !== -1) ? 'valid' : undefined;
        if(scope.check){
          ctrl.$setValidity('pesCollectionMatch', true);
          ctrl.$setValidity('pesCollectionMatch', true);
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-success');
          } else {
            elem.parent().addClass('has-success');
          }
          return v;
        } else {
          ctrl.$setValidity('pesCollectionMatch', false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-error');
          } else {
            elem.parent().addClass('has-error');
          }
          return v;
        }
      })
    }
  };
})
.directive('typeAhead', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/typeahead.html',
    scope: {
      labelText: '@',
      /*formId: '@',*/
      formName: '@',
      data: '=',
      selectField: '@',
      arrayList: '=',
      limit: '@',
      disabled: '='
    }
  };
}]);
