//
// A command that waits a certain number of milliseconds.
//

function wait(config, ms) {
    return {
        ms: ms,
        run: function (context, then) {
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

                config.resultHandler(result);

                then();
            }, ms);
        }
    };
}

module.exports = {
    wait: wait
};
