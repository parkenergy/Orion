// https://gist.github.com/iamkvein/2006752

/* Declaration
----------------------------------------------------------------------------- */
var HookInstaller = function () {

};

/* Functions
----------------------------------------------------------------------------- */
HookInstaller.prototype.install_hook_to = function(obj) {

    if (obj.hook || obj.unhook) {
        throw new Error('Object already has properties hook and/or unhook');
    }

    obj.hook = function(methodName, newAction, isAsync) {
        var self = this;
        var originalMethod = function () {};

        // Make sure method exists
        if (typeof obj[methodName] !== 'function') {
            throw new Error('Invalid method: ' + methodName);
        }

        // We should not hook a hook
        if (self.unhook.methods[methodName]) {
            throw new Error('Method already hooked: ' + methodName);
        }

        // Reference default method
        originalMethod = obj[methodName];
        self.unhook.methods[methodName] = originalMethod;

        self[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);

            // Our hook should take the same number of arguments
            // as the original method so we must fill with undefined
            // optional args not provided in the call
            while (args.length < originalMethod.length) {
                args.push(undefined);
            }

            // Last argument is always original method call
            args.push(function() {
                var args = arguments;

                if (isAsync) {
                  process.nextTick(function() {
                      originalMethod.apply(self, args);
                  });
                } else {
                  originalMethod.apply(self, args);
                }
            });

            newAction.apply(self, args);
        };
    };

    obj.unhook = function(methodName) {
        var self = this,
            ref  = self.unhook.methods[methodName];

        if (ref) {
            self[methodName] = self.unhook.methods[methodName];
            delete self.unhook.methods[methodName];
        } else {
            throw new Error('Method not hooked: ' + methodName);
        }
    };

    obj.unhook.methods = {};
};

/* Exports
----------------------------------------------------------------------------- */
module.exports = HookInstaller;
