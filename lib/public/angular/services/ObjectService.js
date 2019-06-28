function ObjectService() {
    const ObjectService = {};

    const isArray = Array.isArray;
    const keyList = Object.keys;
    const hasProp = Object.prototype.hasOwnProperty;

    ObjectService.equal = (a, b) => {
        if (a === b) return true;

        if (a && b && typeof a == 'object' && typeof b == 'object') {
            let arrA   = isArray(a)
                , arrB = isArray(b)
                , i
                , length
                , key;

            if (arrA && arrB) {
                length = a.length;
                if (length !== b.length) return false;
                for (i = length; i-- !== 0;)
                    if (!ObjectService.equal(a[i], b[i])) return false;
                return true;
            }

            if (arrA !== arrB) return false;

            const dateA = a instanceof Date
                , dateB = b instanceof Date;
            if (dateA !== dateB) return false;
            if (dateA && dateB) return a.getTime() === b.getTime();

            const regexpA = a instanceof RegExp
                , regexpB = b instanceof RegExp;
            if (regexpA !== regexpB) return false;
            if (regexpA && regexpB) return a.toString() === b.toString();

            const keys = keyList(a);
            length = keys.length;

            if (length !== keyList(b).length)
                return false;

            for (i = length; i-- !== 0;)
                if (!hasProp.call(b, keys[i])) return false;

            for (i = length; i-- !== 0;) {
                key = keys[i];
                if (!ObjectService.equal(a[key], b[key])) return false;
            }

            return true;
        }

        return a !== a && b !== b;
    };

    // Change A nested Value of an Object based on a String
    ObjectService.updateNestedObjectValue = (object, newValue, path) => {
        _.update(object, path, function (n) {
            n = newValue;
            return n;
        });
    };
    // -----------------------------------------------

    // setobjvalue
    ObjectService.setObjValue = (obj, path, value) => {
        if (typeof path === 'string') {
            return ObjectService.setObjValue(obj, path.split('.'), value)
        } else if (path.length === 1) {
            return obj[path[0]] = value
        } else if (path.length === 0) {
            return obj
        } else {
            return ObjectService.setObjValue(obj[path[0]], path.slice(1), value)
        }
    }

    // Change A non Nested Value of an Object based on String
    ObjectService.updateNonNestedObjectValue = function (object, newValue, path) {
        object[path] = newValue;
    };
    // -----------------------------------------------

    // Return nested value of object based on String -
    ObjectService.getNestedObjectValue = function (object, path) {
        var stack = path.split('.');
        while (stack.length > 1) {
            object = object[stack.shift()];
        }
        return object[stack.shift()];
    };
    // -----------------------------------------------


    return ObjectService;
}

angular.module('CommonServices')
       .factory('ObjectService', [ObjectService]);
