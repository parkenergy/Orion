angular.module('CommonServices').factory('Utils', [function () {
    return {
        getObjFromArrayByID(objs, id) {
            return objs.reduce((acc, cur) => {
                if (cur._id === id) {
                    return cur
                } else {
                    return acc
                }
            }, {})
        },
        getObjByValue(objs, v, path) {
            return objs.reduce((acc, cur) => {
                if (this.getObjValue(cur, path) === v) {
                    return cur
                } else {
                    return acc
                }
            }, {})
        },
        getObjValue(obj, path) {
            return path.split(".").reduce((o, i) => {
                if (o !== undefined) {
                    return o[i]
                }
            }, obj)
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
