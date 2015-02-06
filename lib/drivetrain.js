var context = {
    getTime: function () {
        return new Date().getTime();
    }
};

var configuration = {
    resultHandler: function (result) {
        console.log(JSON.stringify(result));
    }
};

function configure(config) {
    for (var name in config) {
        if (config.hasOwnProperty(name)) {
            config[name] = config[name];
        }
    }
}

function run(steps, callback) {
    if (steps.length > 0) {
        var i = -1;

        var runNextStep = function () {
            i++;

            if (i >= steps.length) {
                if (typeof(callback) === 'function') {
                    callback();
                }
            } else {
                steps[i].run(context, runNextStep);
            }
        };

        runNextStep(context, runNextStep);
    }
}

function runParallel(steps, then) {
    var completed = 0;

    var finished = function () {
        completed++;

        if (typeof(then) === 'function' && completed == steps.length) {
            then();
        }
    };

    for (var i = 0; i < steps.length; i++) {
        steps[i].run(context, finished);
    }
}

module.exports = {
    configuration: configuration,
    configure: configure,
    run: run,
    runParallel: runParallel
};
