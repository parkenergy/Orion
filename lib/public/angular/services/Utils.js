angular.module('CommonServices').factory('Utils', [function () {
    return {
        setInvalid(arg, ctrl, elem) {
            ctrl.$setValidity(arg, false);
            if (elem.parent().hasClass('has-success')) {
                elem.parent().removeClass('has-success');
                elem.parent().addClass('has-error');
            } else {
                elem.parent().addClass('has-error');
            }
        },
        setHighlight(arg, ctrl, elem) {
            ctrl.$setValidity(arg, false);
            if (elem.parent().hasClass('has-success')) {
                elem.parent().removeClass('has-success');
            }
            if (elem.parent().hasClass('has-error')) {
                elem.parent().removeClass('has-error');
            }
            elem.parent().addClass('has-highlight');
        },
        setValid(arg, ctrl, elem) {
            ctrl.$setValidity(arg, true);
            if (elem.parent().hasClass('has-error')) {
                elem.parent().removeClass('has-error');
                elem.parent().addClass('has-success');
            } else {
                elem.parent().addClass('has-success');
            }
        },
        debounce (fn, wait, immediate) {
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
            return path.split('.').reduce((o, i) => {
                if (o !== undefined) {
                    return o[i]
                }
            }, obj)
        }
    };
}]);
