angular.module('CommonServices').factory('Utils', [function () {
    return {
        debounce (fn, wait, immediate) {
            console.log(fn);
            console.log(wait);

            let inDebounce;
            return function executedFunction () {
                let context = this;
                let args = arguments;
                let later = function () {
                    inDebounce = null;
                    if (!immediate) fn.apply(context, args);
                };

                let callNow = immediate && !inDebounce;

                clearTimeout(inDebounce);
                inDebounce = setTimeout(later, wait);

                if (callNow) fn.apply(context, args);
            };
        },
    };
}]);
