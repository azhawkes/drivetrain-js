//
// A command that waits a certain number of milliseconds.
//

function wait(context, ms) {
    var self = {
        ms: ms,
        run: function (callback) {
            var startTime = context.getTime();

            setTimeout(function () {
                var endTime = context.getTime();

                var result = {
                    type: "wait",
                    planned: ms,
                    actual: endTime - startTime,
                    startTime: startTime,
                    endTime: endTime
                };

                context.config.resultHandler(result);

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
