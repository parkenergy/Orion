angular.module('CommonDirectives')
.directive('customValidation', function () {
  return {
    require: 'ngModel',
    scope: true,
    link: function (scope, element, attr, ngModelCtrl) {

      element.bind('focus', function () {
        if (element.context.value === "0") {
          element.context.value = "";
        }
      });


      function fromUser (text) {
        var originalText = text;
        var isNumber = attr.number !== undefined;
        var isTextOnly = attr.textonly !== undefined;
        var isNonNegative = attr.nonNegative === "true";
        var isIntegerOnly = attr.integerOnly === "true";
        console.log(attr.integerOnly);

        if (isNumber) {
          text = text.replace(/[^-?\d+\.?\d*$]/g,'');
          var decimalCount = 0;

          for (var i = 0; i < text.length; i++) { // because regex is fucky

            if (i === 0 && text[i] === '-') {
              continue;
            } // skip the first negative

            if (text[i] === '-') { // remove subsequent minus signs
              text = text.slice(0, i) + text.slice(i+1, text.length);
            } else if (text[i] === '.') {
              if (decimalCount > 0) { // remove subsequent decimal points
                text = text.slice(0, i) + text.slice(i+1, text.length);
              } else { // there can be only 1
                decimalCount = 1;
              }
            }

          }

          if (isNonNegative) {
            text = text.split('-').join();
          }

          if (isIntegerOnly) {
            text = text.split('.')[0];
          }

        }

        if (isTextOnly) {
          console.log("text only validation not implemented");
        }

        if(text !== originalText) {
            ngModelCtrl.$setViewValue(text);
            ngModelCtrl.$render();
        }
        return text;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});
