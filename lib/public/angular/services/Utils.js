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
        isEmpty(obj) {
            if (!obj && obj !== 0) {
                return true;
            }
            return (!(typeof (obj) === "number") && !Object.keys(obj).length && Object.prototype.toString.call(obj) !== '[object Date]');
        },
        rmArrObjDups(arr, field) {
            return arr.filter((obj, pos, ray) => {
                return (pos === ray.findIndex((t) => {
                    return t[field] === obj[field]
                }))
            })
        },
        getObjValue(obj, path) {
            path.split('.').reduce((o, i) => {
                if (o !== undefined) {
                    return o[i]
                }
            }, obj)
        }
    };
}]);
