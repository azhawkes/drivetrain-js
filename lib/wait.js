//
// A command that waits a certain number of milliseconds.
//

function wait(drivetrain, ms) {
    var self = {
        ms: ms,
        run: function (callback) {
            var startTime = drivetrain.getTime();

            setTimeout(function () {
                var endTime = drivetrain.getTime();

                var result = {
                    type: "wait",
                    planned: ms,
                    actual: endTime - startTime,
                    startTime: startTime,
                    endTime: endTime
                };

                if (typeof(drivetrain.configuration.resultHandler) === 'function') {
                    drivetrain.configuration.resultHandler(self, result);
                }

                if (typeof(callback) === 'function') {
                    callback();
                }
            }, ms);
        }
    };

    return self;
}

module.exports = {
    wait: wait
};
